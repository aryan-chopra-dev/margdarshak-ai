import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = getSupabaseServerClient();
    // Fetch leaderboard scores joining profiles table
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

    return NextResponse.json({ status: 'success', data: mappedLeaderboard });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
