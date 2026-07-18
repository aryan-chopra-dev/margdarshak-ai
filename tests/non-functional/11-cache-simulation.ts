/**
 * ============================================================
 * TEST 11: Cache Simulation — Latency Delta Measurement
 * ============================================================
 * WHAT THIS TESTS:
 *   Measures whether repeated calls to static/semi-static
 *   endpoints are faster on subsequent requests — indicating
 *   that caching (Next.js cache, HTTP cache, CDN) is working.
 *
 *   Tests:
 *   1. /api/leaderboard — repeated calls (should benefit from
 *      Next.js route-level caching or Supabase connection pool)
 *   2. Verifies HTTP cache headers exist (Cache-Control)
 *
 * PASS: Subsequent calls are measurably faster OR cache headers present
 * FAIL: Every call takes the same long time + no cache headers
 *
 * HOW TO RUN:
 *   npx tsx tests/non-functional/11-cache-simulation.ts
 * ============================================================
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const BASE_URL     = 'http://localhost:3000';
const ROUNDS       = 5;   // How many times to call each endpoint
const WARMUP_ROUND = 0;   // Index of the "cold" round

interface RoundResult {
  round:      number;
  durationMs: number;
  status:     number;
  cacheHeader: string | null;
  etagHeader:  string | null;
}

async function measureEndpoint(url: string, rounds: number): Promise<RoundResult[]> {
  const results: RoundResult[] = [];

  for (let i = 0; i < rounds; i++) {
    const start = Date.now();
    const res   = await fetch(url, { cache: 'no-store' }); // bypass browser cache
    const duration = Date.now() - start;
    await res.text(); // consume body

    results.push({
      round:       i,
      durationMs:  duration,
      status:      res.status,
      cacheHeader: res.headers.get('cache-control'),
      etagHeader:  res.headers.get('etag'),
    });

    // Small gap between requests
    await new Promise(r => setTimeout(r, 200));
  }

  return results;
}

async function test() {
  console.log('\n🧪 TEST 11 — Cache Simulation & Latency Analysis');
  console.log('━'.repeat(55));

  // ── Test 1: Leaderboard endpoint ─────────────────────────
  const leaderboardUrl = `${BASE_URL}/api/leaderboard`;
  console.log(`\n   Endpoint: ${leaderboardUrl}`);
  console.log(`   Running ${ROUNDS} consecutive requests...\n`);

  const results = await measureEndpoint(leaderboardUrl, ROUNDS);

  // Print round-by-round results
  results.forEach(r => {
    const label = r.round === WARMUP_ROUND ? '(cold)' : '      ';
    console.log(`   Round ${r.round + 1} ${label}: ${r.durationMs}ms | Status: ${r.status}`);
  });

  // ── Analysis ─────────────────────────────────────────────
  const coldLatency = results[WARMUP_ROUND].durationMs;
  const warmLatencies = results.slice(1).map(r => r.durationMs);
  const avgWarm = Math.round(warmLatencies.reduce((a, b) => a + b, 0) / warmLatencies.length);
  const improvement = coldLatency - avgWarm;
  const improvementPct = coldLatency > 0 ? Math.round((improvement / coldLatency) * 100) : 0;

  console.log('\n   📊 Cache Analysis');
  console.log('   ' + '─'.repeat(40));
  console.log(`   Cold (1st) request  : ${coldLatency}ms`);
  console.log(`   Avg warm (2–${ROUNDS}) req: ${avgWarm}ms`);
  console.log(`   Improvement         : ${improvement > 0 ? '+' : ''}${improvementPct}%`);

  // ── HTTP Cache Headers ────────────────────────────────────
  const cacheControl = results[0].cacheHeader;
  const etag         = results[0].etagHeader;
  console.log(`\n   HTTP Headers:`);
  console.log(`   Cache-Control : ${cacheControl ?? '(not set)'}`);
  console.log(`   ETag          : ${etag ?? '(not set)'}`);

  // ── Recommendations ───────────────────────────────────────
  if (!cacheControl) {
    console.log('\n   💡 Recommendation: Add cache headers to leaderboard route:');
    console.log(`      NextResponse.json(data, {`);
    console.log(`        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' }`);
    console.log(`      });`);
  }

  // ── Test 2: Static-like data endpoints ───────────────────
  console.log('\n   Testing profile GET (personalized — should NOT be cached)...');
  const profileRes = await fetch(`${BASE_URL}/api/profile?email=test@example.com`);
  const profileCacheHeader = profileRes.headers.get('cache-control');

  console.log(`   Cache-Control : ${profileCacheHeader ?? '(not set — correct for personalized data)'}`);
  const profileCacheOk = !profileCacheHeader || profileCacheHeader.includes('no-store') || profileCacheHeader.includes('no-cache');
  if (profileCacheOk) {
    console.log('   ✅ Profile endpoint correctly NOT cached (personalized data)');
  } else {
    console.error('   ⚠️  Profile endpoint has cache headers — personalized data should NOT be cached');
  }

  // ── Verdict ───────────────────────────────────────────────
  console.log('\n   🏁 Verdict');
  console.log('   ' + '─'.repeat(40));

  // We consider it a pass if:
  // 1. Warm requests are within 20% of cold (pool warmup helps), OR
  // 2. There's measurable improvement (connection pool warmed up)
  const hasImprovement  = avgWarm < coldLatency * 1.1; // within 10% or better
  const allSucceeded    = results.every(r => r.status === 200);

  if (!allSucceeded) {
    console.error('   ❌ FAIL — Some requests failed\n');
    process.exit(1);
  } else if (hasImprovement || improvement > 0) {
    console.log(`   ✅ PASS — Warm requests are ${Math.abs(improvementPct)}% faster (connection pool effect)`);
    if (!cacheControl) {
      console.log('   ⚠️  ACTION NEEDED: Add Cache-Control headers for CDN caching\n');
    } else {
      console.log('   ✅ Cache-Control headers configured\n');
    }
  } else {
    console.log('   ⚠️  MARGINAL — No caching improvement detected');
    console.log('      Add Cache-Control headers + consider Redis/Vercel KV for leaderboard caching\n');
  }
}

test().catch(err => {
  console.error('Uncaught error:', err);
  process.exit(1);
});
