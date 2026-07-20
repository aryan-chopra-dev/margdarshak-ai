/**
 * ============================================================
 * TEST 12: Phone Number Input Validation (Indian Format)
 * ============================================================
 * WHAT THIS TESTS:
 *   Sends requests with invalid and valid phone number patterns
 *   to check validation rules on the API layer.
 *
 * PASS: Invalid phone numbers return 400 + readable message,
 *       Valid phone numbers pass validation constraints.
 *
 * HOW TO RUN:
 *   npx tsx tests/functional/12-onboarding-phone-validation.ts
 * ============================================================
 */

import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const BASE_URL   = 'http://localhost:3000';
const TEST_EMAIL = `phone_validation_test_${Date.now()}@margdarshak.test`;

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
  console.log('\n🧪 TEST 12 — Phone Number Input Validation (Indian Format)');
  console.log('━'.repeat(60));

  // Set up temp OTP session so we can upsert profiles
  await supabase.from('otp_verifications').upsert({
    email: TEST_EMAIL,
    otp: '123456',
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
  }, { onConflict: 'email' });

  // Create temporary profile
  const { data: profile } = await supabase.from('profiles').upsert({
    email: TEST_EMAIL,
    name: 'Phone Validator User',
  }, { onConflict: 'email' }).select().single();

  // Test Case 1: Send invalid phone number during registration OTP request
  console.log('\n   Case 1: Sending invalid phone number during registration OTP request...');
  const res1 = await fetch(`${BASE_URL}/api/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test Reg User',
      email: `reg_phone_test_${Date.now()}@margdarshak.test`,
      phone: '12345678', // Invalid (too short)
      isLogin: false,
    })
  });
  const data1 = await res1.json();
  await assert('Invalid phone during OTP request returns 400', res1.status === 400);
  await assert('Error message mentions phone/mobile validation', data1.error?.toLowerCase().includes('phone') || data1.error?.toLowerCase().includes('mobile'));

  // Test Case 2: Send invalid phone number during profile update
  console.log('\n   Case 2: Sending invalid phone number during profile update...');
  const res2 = await fetch(`${BASE_URL}/api/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: TEST_EMAIL,
      phone: 'invalid_phone_string',
    })
  });
  const data2 = await res2.json();
  await assert('Invalid phone during profile update returns 400', res2.status === 400);

  // Test Case 3: Send invalid parent phone number during profile update
  console.log('\n   Case 3: Sending invalid parent phone number during profile update...');
  const res3 = await fetch(`${BASE_URL}/api/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: TEST_EMAIL,
      parentPhone: '91823982', // Invalid length
    })
  });
  const data3 = await res3.json();
  await assert('Invalid parent phone returns 400', res3.status === 400);

  // Test Case 4: Send valid phone number formats (with spaces/prefixes)
  console.log('\n   Case 4: Sending valid phone formats...');
  const validFormats = [
    '9876543210',
    '+91 98765 43210',
    '+91-88888-88888',
    '7000000001'
  ];

  for (const p of validFormats) {
    const res = await fetch(`${BASE_URL}/api/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        phone: p,
      })
    });
    const d = await res.json();
    await assert(`Valid phone format "${p}" passes validation`, res.status === 200, d);
  }

  // Cleanup
  await supabase.from('profiles').delete().eq('email', TEST_EMAIL);
  await supabase.from('otp_verifications').delete().eq('email', TEST_EMAIL);

  console.log('\n   🏁 Verdict');
  console.log('   ' + '─'.repeat(40));
  if (process.exitCode === 1) {
    console.error('   ❌ FAIL — Phone validation checks failed\n');
  } else {
    console.log('   ✅ PASS — Phone validation checks passed\n');
  }
}

test().catch(err => {
  console.error('Uncaught error:', err);
  process.exit(1);
});
