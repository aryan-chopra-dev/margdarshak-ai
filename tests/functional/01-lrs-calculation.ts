/**
 * ============================================================
 * TEST 01: LRS Tamper-Proof Server-Side Calculation
 * ============================================================
 * WHAT THIS TESTS:
 *   A hacker tries to send lrsScore: 850 directly via the API.
 *   The server must IGNORE the client's value and recalculate
 *   the LRS from the actual profile data stored in the DB.
 *
 * PASS: The stored score does NOT equal 850 (the hacked value)
 * FAIL: The stored score equals 850 (security vulnerability!)
 *
 * HOW TO RUN:
 *   npx tsx tests/functional/01-lrs-calculation.ts
 * ============================================================
 */

import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = `lrs_tamper_test_${Date.now()}@margdarshak.test`;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function test() {
  console.log('\n🧪 TEST 01 — LRS Tamper-Proof Server-Side Calculation');
  console.log('━'.repeat(55));

  // Step 0: Insert a dummy OTP verification record so RLS allows us to seed/test the profile
  console.log('   Step 0: Generating temporary verification session for seed...');
  await supabase.from('otp_verifications').upsert({
    email: TEST_EMAIL,
    otp: '999999',
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
  }, { onConflict: 'email' });

  // Step 1: Create a minimal profile first (upsert via direct Supabase so we have a real record)
  console.log('   Step 1: Seeding minimal test profile...');
  const { data: profile, error: seedError } = await supabase.from('profiles').upsert({
    email: TEST_EMAIL,
    name: 'Tamper Test User',
  }, { onConflict: 'email' }).select().single();

  if (seedError) {
    console.error('   ❌ Seed failed:', seedError.message);
    await supabase.from('otp_verifications').delete().eq('email', TEST_EMAIL);
    process.exit(1);
  }

  // Insert default academic_scores
  await supabase.from('academic_scores').upsert({
    profile_id: profile.id,
    gpa: 7.0,
    gre_score: 300,
    lrs_score: 310, // legitimate starting score
  }, { onConflict: 'profile_id' });

  // Step 2: Send a POST with a SPOOFED lrsScore: 850
  console.log('   Step 2: Sending spoofed lrsScore: 850 to API...');
  const res = await fetch(`${BASE_URL}/api/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: TEST_EMAIL,
      lrsScore: 850,       // ← HACKED VALUE — should be ignored
      name: 'Tamper Test User',
    }),
  });

  const body = await res.json();
  console.log(`   API Response Status: ${res.status}`);

  // Step 3: Read back the actual stored score from DB
  console.log('   Step 3: Fetching stored score from Supabase...');
  const { data: scores } = await supabase
    .from('academic_scores')
    .select('lrs_score')
    .eq('profile_id', profile.id)
    .single();

  const storedScore = scores?.lrs_score;
  console.log(`   Hacked value sent : 850`);
  console.log(`   Actual stored score: ${storedScore}`);

  // Step 4: Cleanup
  await supabase.from('profiles').delete().eq('email', TEST_EMAIL);
  await supabase.from('otp_verifications').delete().eq('email', TEST_EMAIL);

  // Step 5: Verdict
  console.log('\n   🏁 Verdict');
  console.log('   ' + '─'.repeat(40));
  if (storedScore !== 850) {
    console.log(`   ✅ PASS — Server correctly overrode the hacked score.`);
    console.log(`            Real score stored: ${storedScore} (based on profile data)\n`);
  } else {
    console.error('   ❌ FAIL — Server stored the hacked score of 850!');
    console.error('            SECURITY VULNERABILITY: LRS can be manipulated.\n');
    process.exit(1);
  }
}

test().catch(err => {
  console.error('Uncaught error:', err);
  process.exit(1);
});
