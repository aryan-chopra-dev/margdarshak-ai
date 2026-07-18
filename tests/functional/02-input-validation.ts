/**
 * ============================================================
 * TEST 02: Database-Level Input Validation (CHECK Constraints)
 * ============================================================
 * WHAT THIS TESTS:
 *   Sends 7 requests with deliberately invalid values.
 *   Each must return HTTP 400 with a user-friendly message
 *   (not a raw Postgres crash error like "23514: new row for...").
 *
 * PASS: All 7 cases return 400 + a readable message
 * FAIL: Any case returns 200 (value was accepted) or 500
 *       (raw error leaked to user)
 *
 * HOW TO RUN:
 *   npx tsx tests/functional/02-input-validation.ts
 * ============================================================
 */

import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const BASE_URL    = 'http://localhost:3000';
const TEST_EMAIL  = `validation_test_${Date.now()}@margdarshak.test`;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ── Test Cases ─────────────────────────────────────────────
// Each case sends one bad field and expects a 400 with a message
const invalidCases = [
  {
    label:   'GPA too high (99)',
    payload: { email: TEST_EMAIL, gpa: 99 },
    expectMessageContains: 'GPA',
  },
  {
    label:   'GPA negative (-1)',
    payload: { email: TEST_EMAIL, gpa: -1 },
    expectMessageContains: 'GPA',
  },
  {
    label:   'GRE score too low (100)',
    payload: { email: TEST_EMAIL, greScore: 100 },
    expectMessageContains: 'GRE',
  },
  {
    label:   'GRE score too high (400)',
    payload: { email: TEST_EMAIL, greScore: 400 },
    expectMessageContains: 'GRE',
  },
  {
    label:   'TOEFL score too high (200)',
    payload: { email: TEST_EMAIL, toeflScore: 200 },
    expectMessageContains: 'TOEFL',
  },
  {
    label:   'IELTS score too high (15)',
    payload: { email: TEST_EMAIL, ieltsScore: 15 },
    expectMessageContains: 'IELTS',
  },
  {
    label:   'Work experience too high (100 years)',
    payload: { email: TEST_EMAIL, workExperience: 100 },
    expectMessageContains: 'Work experience',
  },
];

// ── Runner ─────────────────────────────────────────────────
async function test() {
  console.log('\n🧪 TEST 02 — Database-Level Input Validation');
  console.log('━'.repeat(55));

  // Step 0: Insert a dummy OTP verification record so RLS allows us to seed/test the profile
  console.log('   Step 0: Generating temporary verification session for seed...');
  await supabase.from('otp_verifications').upsert({
    email: TEST_EMAIL,
    otp: '999999',
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
  }, { onConflict: 'email' });

  // Seed a base profile to update
  console.log('   Seeding base profile...');
  const { data: profile, error: seedError } = await supabase.from('profiles').upsert({
    email: TEST_EMAIL,
    name: 'Validation Test User',
  }, { onConflict: 'email' }).select().single();

  if (seedError) {
    console.error('   ❌ Seed failed:', seedError.message);
    await supabase.from('otp_verifications').delete().eq('email', TEST_EMAIL);
    process.exit(1);
  }

  // Seed academic scores table with base data
  await supabase.from('academic_scores').upsert({
    profile_id: profile.id,
    gpa: 8.0
  }, { onConflict: 'profile_id' });

  let passCount = 0;
  let failCount = 0;

  for (const tc of invalidCases) {
    const res = await fetch(`${BASE_URL}/api/profile`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(tc.payload),
    });

    let body: any = {};
    try { body = await res.json(); } catch {}

    const statusOk  = res.status === 400;
    const messageOk = typeof body.message === 'string' &&
                      body.message.toLowerCase().includes(tc.expectMessageContains.toLowerCase());

    const passed = statusOk && messageOk;

    if (passed) {
      console.log(`   ✅ ${tc.label}`);
      console.log(`      Status: ${res.status} | Message: "${body.message}"`);
      passCount++;
    } else {
      console.error(`   ❌ ${tc.label}`);
      console.error(`      Expected: status 400 with message containing "${tc.expectMessageContains}"`);
      console.error(`      Got:      status ${res.status} | body: ${JSON.stringify(body)}`);
      failCount++;
    }
  }

  // Cleanup
  await supabase.from('profiles').delete().eq('email', TEST_EMAIL);
  await supabase.from('otp_verifications').delete().eq('email', TEST_EMAIL);

  // Verdict
  console.log('\n   🏁 Verdict');
  console.log('   ' + '─'.repeat(40));
  if (failCount === 0) {
    console.log(`   ✅ PASS — All ${passCount}/${invalidCases.length} validation cases correctly rejected\n`);
  } else {
    console.error(`   ❌ FAIL — ${failCount}/${invalidCases.length} cases did not behave correctly\n`);
    process.exit(1);
  }
}

test().catch(err => {
  console.error('Uncaught error:', err);
  process.exit(1);
});
