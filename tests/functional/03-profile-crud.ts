/**
 * ============================================================
 * TEST 03: Full Profile CRUD Lifecycle
 * ============================================================
 * WHAT THIS TESTS:
 *   The complete round-trip: create a profile → update fields
 *   → fetch via GET → verify all fields survived correctly,
 *   including JSON arrays (shortlistedUniversities, docsUploaded).
 *
 * PASS: All fields round-trip correctly
 * FAIL: Any field is missing, null, or incorrectly typed
 *
 * HOW TO RUN:
 *   npx tsx tests/functional/03-profile-crud.ts
 * ============================================================
 */

import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const BASE_URL   = 'http://localhost:3000';
const TEST_EMAIL = `crud_test_${Date.now()}@margdarshak.test`;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function assert(label: string, condition: boolean, got?: any) {
  if (condition) {
    console.log(`   ✅ ${label}`);
  } else {
    console.error(`   ❌ ${label}`);
    if (got !== undefined) console.error(`      Got: ${JSON.stringify(got)}`);
    process.exitCode = 1;
  }
}

async function test() {
  console.log('\n🧪 TEST 03 — Full Profile CRUD Lifecycle');
  console.log('━'.repeat(55));

  // Step 0: Insert a dummy OTP verification record so RLS allows us to seed/test the profile
  console.log('   Step 0: Generating temporary verification session for seed...');
  await supabase.from('otp_verifications').upsert({
    email: TEST_EMAIL,
    otp: '999999',
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
  }, { onConflict: 'email' });

  // ── Step 1: Create via Supabase (simulate registration) ──
  console.log('\n   Step 1: Creating profile (upsert)...');
  const { data: profile, error: createErr } = await supabase.from('profiles').upsert({
    email:          TEST_EMAIL,
    name:           'CRUD Test User',
  }, { onConflict: 'email' }).select().single();

  if (createErr) {
    console.error('   ❌ Create failed:', createErr.message);
    await supabase.from('otp_verifications').delete().eq('email', TEST_EMAIL);
    process.exit(1);
  }

  // Seed normalized tables
  await supabase.from('academic_scores').upsert({
    profile_id: profile.id,
    gpa: 8.2,
    gre_score: 315,
    toefl_score: 105
  }, { onConflict: 'profile_id' });

  await supabase.from('study_targets').upsert({
    profile_id: profile.id,
    target_country: 'United Kingdom',
    target_field: 'Data Science',
    degree: 'masters'
  }, { onConflict: 'profile_id' });

  await supabase.from('co_applicants').upsert({
    profile_id: profile.id,
    name: 'Test Parent',
    income: 1500000
  }, { onConflict: 'profile_id' });

  console.log('   Profile and related records created.');

  // ── Step 2: Update via API (with JSON array fields) ───────
  console.log('\n   Step 2: Updating profile via API (with arrays)...');
  const updateRes = await fetch(`${BASE_URL}/api/profile`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({
      email:                    TEST_EMAIL,
      shortlistedUniversities:  ['University of London', 'Imperial College'],
      docsUploaded:             ['Transcript', 'Passport'],
      workExperience:           2,
      hasResearch:              true,
    }),
  });

  const updateBody = await updateRes.json();
  await assert('Update returns HTTP 200',         updateRes.status === 200);
  await assert('Update returns status: success',  updateBody.status === 'success');

  // ── Step 3: Fetch via GET API ─────────────────────────────
  console.log('\n   Step 3: Fetching profile via GET API...');
  const getRes  = await fetch(`${BASE_URL}/api/profile?email=${encodeURIComponent(TEST_EMAIL)}`);
  const getBody = await getRes.json();
  const p       = getBody.profile;

  await assert('GET returns HTTP 200',                       getRes.status === 200);
  await assert('Profile has correct email',                  p?.email === TEST_EMAIL,          p?.email);
  await assert('Profile name round-trips',                   p?.name === 'CRUD Test User',     p?.name);
  await assert('GPA round-trips',                            p?.gpa === 8.2,                   p?.gpa);
  await assert('Target country round-trips',                 p?.targetCountry === 'United Kingdom', p?.targetCountry);
  await assert('shortlistedUniversities is an array',        Array.isArray(p?.shortlistedUniversities), typeof p?.shortlistedUniversities);
  await assert('shortlistedUniversities has 2 entries',      p?.shortlistedUniversities?.length === 2, p?.shortlistedUniversities);
  await assert('docsUploaded is an array',                   Array.isArray(p?.docsUploaded),   typeof p?.docsUploaded);
  await assert('docsUploaded has 2 entries',                 p?.docsUploaded?.length === 2,    p?.docsUploaded);
  await assert('workExperience round-trips',                 p?.workExperience === 2,           p?.workExperience);
  await assert('hasResearch round-trips',                    p?.hasResearch === true,           p?.hasResearch);
  await assert('lrsScore is a positive number',              typeof p?.lrsScore === 'number' && p?.lrsScore > 300, p?.lrsScore);

  // ── Step 4: Cleanup ───────────────────────────────────────
  await supabase.from('profiles').delete().eq('email', TEST_EMAIL);
  await supabase.from('otp_verifications').delete().eq('email', TEST_EMAIL);

  // ── Verdict ───────────────────────────────────────────────
  console.log('\n   🏁 Verdict');
  console.log('   ' + '─'.repeat(40));
  if (process.exitCode === 1) {
    console.error('   ❌ FAIL — Some fields did not round-trip correctly\n');
  } else {
    console.log('   ✅ PASS — All profile fields round-trip correctly\n');
  }
}

test().catch(err => {
  console.error('Uncaught error:', err);
  process.exit(1);
});
