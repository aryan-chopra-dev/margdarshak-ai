/**
 * ============================================================
 * Supavisor Connection Pool Stress Test
 * ============================================================
 * Fires N simultaneous Supabase queries using Promise.all().
 * This simulates what happens when many users hit the DB at
 * the same time — testing whether Supavisor (the connection
 * pooler) manages the queue or drops connections.
 *
 * HOW TO RUN:
 *   npx tsx tests/connection-pool/pool-stress.ts
 *   npx tsx tests/connection-pool/pool-stress.ts --concurrency 200
 *
 * WHAT TO LOOK FOR:
 *   ✅ PASS: All queries succeed (or fail gracefully with 429/503)
 *   ❌ FAIL: Connections hang forever, or you see "connection refused"
 * ============================================================
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// ── Config ─────────────────────────────────────────────────
const CONCURRENCY = parseInt(
  process.argv.find(a => a.startsWith('--concurrency='))?.split('=')[1] ?? '100'
);
const TIMEOUT_MS = 10_000; // 10 seconds per query max

// ── Supabase Client ────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ── Single query with timeout wrapper ─────────────────────
async function queryWithTimeout(index: number): Promise<{
  index: number;
  success: boolean;
  durationMs: number;
  error?: string;
}> {
  const start = Date.now();

  const queryPromise = supabase
    .from('academic_scores')
    .select(`
      lrs_score,
      profiles (
        name
      )
    `)
    .order('lrs_score', { ascending: false })
    .limit(10);

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('TIMEOUT')), TIMEOUT_MS)
  );

  try {
    const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
    const durationMs = Date.now() - start;

    if (error) {
      return { index, success: false, durationMs, error: error.message };
    }
    return { index, success: true, durationMs };
  } catch (err: any) {
    return { index, success: false, durationMs: Date.now() - start, error: err.message };
  }
}

// ── Main Test Runner ───────────────────────────────────────
async function runPoolStressTest() {
  console.log('\n🔌 Supavisor Connection Pool Stress Test');
  console.log('━'.repeat(50));
  console.log(`   Firing ${CONCURRENCY} simultaneous DB queries...`);
  console.log(`   Timeout per query: ${TIMEOUT_MS}ms\n`);

  const start = Date.now();

  // Fire ALL queries at the exact same time
  const promises = Array.from({ length: CONCURRENCY }, (_, i) => queryWithTimeout(i + 1));
  const results = await Promise.all(promises);

  const totalMs = Date.now() - start;

  // ── Tally Results ─────────────────────────────────────
  const succeeded = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const timeouts = failed.filter(r => r.error === 'TIMEOUT');
  const dbErrors = failed.filter(r => r.error !== 'TIMEOUT');

  const durations = succeeded.map(r => r.durationMs).sort((a, b) => a - b);
  const avgMs = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
  const p95Ms = durations.length ? durations[Math.floor(durations.length * 0.95)] : 0;
  const maxMs = durations.length ? durations[durations.length - 1] : 0;

  // ── Print Report ───────────────────────────────────────
  console.log('📊 Results');
  console.log('━'.repeat(50));
  console.log(`   Total concurrent queries : ${CONCURRENCY}`);
  console.log(`   ✅ Succeeded             : ${succeeded.length}`);
  console.log(`   ❌ Failed                : ${failed.length}`);
  console.log(`      ⏱  Timeouts           : ${timeouts.length}`);
  console.log(`      🚫 DB Errors          : ${dbErrors.length}`);
  console.log('');
  console.log('⚡ Performance');
  console.log('━'.repeat(50));
  console.log(`   Avg latency (success)    : ${avgMs}ms`);
  console.log(`   p95 latency              : ${p95Ms}ms`);
  console.log(`   Max latency              : ${maxMs}ms`);
  console.log(`   Wall-clock total         : ${totalMs}ms`);
  console.log('');

  if (dbErrors.length > 0) {
    console.log('🚨 DB Errors Encountered:');
    dbErrors.slice(0, 5).forEach(r => {
      console.log(`   Query #${r.index}: ${r.error}`);
    });
    if (dbErrors.length > 5) {
      console.log(`   ... and ${dbErrors.length - 5} more.`);
    }
    console.log('');
  }

  // ── Pass/Fail Verdict ──────────────────────────────────
  const successRate = (succeeded.length / CONCURRENCY) * 100;
  const passed = successRate >= 95 && timeouts.length === 0;

  console.log('🏁 Verdict');
  console.log('━'.repeat(50));
  if (passed) {
    console.log(`   ✅ PASS — ${successRate.toFixed(1)}% queries succeeded`);
    console.log('   Supavisor handled the connection pool correctly.\n');
  } else {
    console.log(`   ❌ FAIL — Only ${successRate.toFixed(1)}% queries succeeded`);
    if (timeouts.length > 0) {
      console.log(`   ⚠️  ${timeouts.length} connections timed out — pool may be exhausted`);
    }
    if (dbErrors.length > 0) {
      console.log(`   ⚠️  ${dbErrors.length} DB errors — check Supabase project limits\n`);
    }
    process.exit(1);
  }
}

runPoolStressTest();
