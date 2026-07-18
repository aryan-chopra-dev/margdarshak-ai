/**
 * ============================================================
 * TEST 05: Leaderboard Rankings
 * ============================================================
 * WHAT THIS TESTS:
 *   GET /api/leaderboard must:
 *   1. Return HTTP 200
 *   2. Return { status: 'success', data: [...] }
 *   3. data is an array
 *   4. Each entry has name + lrs_score fields
 *   5. Scores are sorted in DESCENDING order (highest first)
 *   6. No score exceeds 850 (the max possible LRS)
 *   7. No score is below 300 (the min possible LRS)
 *
 * HOW TO RUN:
 *   npx tsx tests/functional/05-leaderboard.ts
 * ============================================================
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const BASE_URL = 'http://localhost:3000';

async function assert(label: string, condition: boolean, got?: any) {
  if (condition) {
    console.log(`   ✅ ${label}`);
  } else {
    console.error(`   ❌ ${label}`, got !== undefined ? `| Got: ${JSON.stringify(got)}` : '');
    process.exitCode = 1;
  }
}

async function test() {
  console.log('\n🧪 TEST 05 — Leaderboard Rankings');
  console.log('━'.repeat(55));

  const start  = Date.now();
  const res    = await fetch(`${BASE_URL}/api/leaderboard`);
  const latency = Date.now() - start;
  let body: any = {};
  try { body = await res.json(); } catch {}

  // ── Basic shape ───────────────────────────────────────────
  await assert('Returns HTTP 200',                 res.status === 200, res.status);
  await assert('Returns status: success',          body.status === 'success', body.status);
  await assert('data field is an array',           Array.isArray(body.data), typeof body.data);

  if (!Array.isArray(body.data)) {
    console.error('   Cannot continue — data is not an array\n');
    process.exit(1);
  }

  console.log(`   ℹ️  Found ${body.data.length} entries in leaderboard`);

  // ── Per-entry shape ───────────────────────────────────────
  if (body.data.length > 0) {
    const hasName  = body.data.every((e: any) => typeof e.name === 'string');
    const hasScore = body.data.every((e: any) => typeof e.lrs_score === 'number');
    await assert('Every entry has a name (string)',      hasName,  body.data[0]);
    await assert('Every entry has lrs_score (number)',   hasScore, body.data[0]);
  } else {
    console.log('   ℹ️  Leaderboard is empty — skipping per-entry checks (OK for empty DB)');
  }

  // ── Sorted order ──────────────────────────────────────────
  if (body.data.length > 1) {
    const scores    = body.data.map((e: any) => e.lrs_score);
    const isSorted  = scores.every((s: number, i: number) => i === 0 || scores[i - 1] >= s);
    await assert('Scores sorted descending (highest first)', isSorted, scores.slice(0, 5));
  }

  // ── Score boundary checks ─────────────────────────────────
  if (body.data.length > 0) {
    const allValid = body.data.every((e: any) => e.lrs_score >= 300 && e.lrs_score <= 850);
    await assert('All scores in valid range [300–850]', allValid,
      body.data.find((e: any) => e.lrs_score < 300 || e.lrs_score > 850));
  }

  // ── Performance ───────────────────────────────────────────
  await assert(`Response within 1000ms (actual: ${latency}ms)`, latency < 1000, `${latency}ms`);

  // ── Verdict ───────────────────────────────────────────────
  console.log('\n   🏁 Verdict');
  console.log('   ' + '─'.repeat(40));
  if (process.exitCode === 1) {
    console.error('   ❌ FAIL — Leaderboard API has issues\n');
  } else {
    console.log('   ✅ PASS — Leaderboard API is correct\n');
  }
}

test().catch(err => {
  console.error('Uncaught error:', err);
  process.exit(1);
});
