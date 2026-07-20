/**
 * ============================================================
 * TEST 13: Loan Application Submission & Admin Approval Lifecycle
 * ============================================================
 * WHAT THIS TESTS:
 *   1. Submit a loan application via API (starts as 'pending').
 *   2. Retrieve the active loan status and verify state consistency.
 *   3. Admin approves/sanctions the loan.
 *   4. Verify status updates to 'approved'.
 *   5. Admin rejects the loan.
 *   6. Verify status updates to 'rejected'.
 *
 * PASS: The entire state transitions correctly.
 *
 * HOW TO RUN:
 *   npx tsx tests/functional/13-loan-admin-approval.ts
 * ============================================================
 */

import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const BASE_URL   = 'http://localhost:3000';
const TEST_EMAIL = `loan_test_${Date.now()}@margdarshak.test`;

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
  console.log('\n🧪 TEST 13 — Loan Submission & Admin Approval Lifecycle');
  console.log('━'.repeat(60));

  // Set up temp OTP session & profile
  await supabase.from('otp_verifications').upsert({
    email: TEST_EMAIL,
    otp: '999888',
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
  }, { onConflict: 'email' });

  const { data: profile } = await supabase.from('profiles').upsert({
    email: TEST_EMAIL,
    name: 'Loan Lifecycle User',
  }, { onConflict: 'email' }).select().single();

  // Step 1: Submit loan application via API
  console.log('\n   Step 1: Submitting loan application...');
  const refId = 'PF-' + Math.floor(1000 + Math.random() * 9000);
  const applyRes = await fetch(`${BASE_URL}/api/loans/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: TEST_EMAIL,
      lenderId: 'credila',
      lenderName: 'HDFC Credila',
      universityName: 'Stanford University',
      principalINR: 4500000,
      referenceId: refId,
    })
  });
  const applyData = await applyRes.json();
  await assert('Apply API returns 200', applyRes.status === 200, applyData);

  // Step 2: Retrieve loan status & verify 'pending'
  console.log('\n   Step 2: Checking status (should be pending)...');
  const statusRes = await fetch(`${BASE_URL}/api/loans/status?email=${encodeURIComponent(TEST_EMAIL)}`);
  const statusData = await statusRes.json();
  await assert('Status API returns 200', statusRes.status === 200);
  await assert('Loan is marked submitted', statusData.loan?.submitted === true);
  await assert('Loan status is initially pending', statusData.loan?.status === 'pending');

  // Load the loan ID from Supabase to run admin actions
  const { data: loanRow } = await supabase
    .from('loan_applications')
    .select('id')
    .eq('profile_id', profile.id)
    .single();

  if (!loanRow) {
    console.error('   ❌ Could not load loan ID from DB.');
    process.exit(1);
  }

  // Step 3: Admin approves the loan
  console.log('\n   Step 3: Admin approving (sanctioning) the loan...');
  const approveRes = await fetch(`${BASE_URL}/api/admin/loans/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      loanId: loanRow.id,
      action: 'approve',
    })
  });
  const approveData = await approveRes.json();
  await assert('Admin Action API returns 200', approveRes.status === 200);

  // Step 4: Verify status updates to 'approved'
  console.log('\n   Step 4: Re-checking status (should be approved)...');
  const statusRes2 = await fetch(`${BASE_URL}/api/loans/status?email=${encodeURIComponent(TEST_EMAIL)}`);
  const statusData2 = await statusRes2.json();
  await assert('Loan status is now approved', statusData2.loan?.status === 'approved');

  // Step 5: Admin rejects the loan
  console.log('\n   Step 5: Admin rejecting the loan...');
  const rejectRes = await fetch(`${BASE_URL}/api/admin/loans/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      loanId: loanRow.id,
      action: 'reject',
    })
  });
  await assert('Admin Action API returns 200', rejectRes.status === 200);

  // Step 6: Verify status updates to 'rejected'
  console.log('\n   Step 6: Re-checking status (should be rejected)...');
  const statusRes3 = await fetch(`${BASE_URL}/api/loans/status?email=${encodeURIComponent(TEST_EMAIL)}`);
  const statusData3 = await statusRes3.json();
  await assert('Loan status is now rejected', statusData3.loan?.status === 'rejected');

  // Cleanup
  await supabase.from('profiles').delete().eq('email', TEST_EMAIL);
  await supabase.from('otp_verifications').delete().eq('email', TEST_EMAIL);

  console.log('\n   🏁 Verdict');
  console.log('   ' + '─'.repeat(40));
  if (process.exitCode === 1) {
    console.error('   ❌ FAIL — Loan admin approval lifecycle checks failed\n');
  } else {
    console.log('   ✅ PASS — Loan admin approval lifecycle checks passed\n');
  }
}

test().catch(err => {
  console.error('Uncaught error:', err);
  process.exit(1);
});
