import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

// ─────────────────────────────────────────────────────────────────
// In-memory cache — avoids a cold Supabase round-trip on every hit.
// At 1M users/hour, the leaderboard data changes rarely.
// TTL: 60 seconds. Reset on any write to academic_scores.
// ─────────────────────────────────────────────────────────────────
interface CacheEntry { data: any; ts: number }
let leaderboardCache: CacheEntry | null = null;
const CACHE_TTL_MS = 60_000; // 60 seconds

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // ── Serve from cache if fresh ───────────────────────────
    if (leaderboardCache && Date.now() - leaderboardCache.ts < CACHE_TTL_MS) {
      return NextResponse.json(leaderboardCache.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          'X-Cache': 'HIT',
        },
      });
    }

    // ── Cache miss — fetch from DB ──────────────────────────
    const supabase = getSupabaseServerClient();
    const { data: records, error } = await supabase
      .from('academic_scores')
      .select(`
        lrs_score,
        profiles (
          name
        )
      `)
      .order('lrs_score', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Leaderboard fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }

    // Map nested data to flat structures expected by frontend
    const mappedLeaderboard = (records || []).map((r: any) => ({
      name: r.profiles?.name || 'Student',
      lrs_score: r.lrs_score
    }));

    const responseBody = { status: 'success', data: mappedLeaderboard };

    // ── Populate cache ──────────────────────────────────────
    leaderboardCache = { data: responseBody, ts: Date.now() };

    return NextResponse.json(responseBody, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        'X-Cache': 'MISS',
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// ── Cache invalidation helper (called after LRS score updates) ──
export function invalidateLeaderboardCache() {
  leaderboardCache = null;
}

