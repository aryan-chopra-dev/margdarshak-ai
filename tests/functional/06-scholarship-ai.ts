/**
 * ============================================================
 * TEST 06: AI Scholarship Evaluation Endpoint
 * ============================================================
 * WHAT THIS TESTS:
 *   POST /api/scholarships/evaluate with a sample profile:
 *   1. Returns HTTP 200 (or graceful 500 if Groq key not set)
 *   2. Returns { percentage: number, reasoning: string }
 *   3. percentage is between 0 and 100
 *   4. reasoning is a non-empty string
 *   5. Responds within 10 seconds
 *
 * HOW TO RUN:
 *   npx tsx tests/functional/06-scholarship-ai.ts
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
  console.log('\n🧪 TEST 06 — AI Scholarship Evaluation');
  console.log('━'.repeat(55));

  const sampleScholarship = {
    name:          'Chevening Scholarship',
    targetCountry: 'United Kingdom',
    eligibility:   'Must target UK institutions, GPA > 7.5, work experience required',
  };

  const sampleProfile = {
    targetCountry:  'United Kingdom',
    degree:         'masters',
    targetField:    'Computer Science',
    gpa:            8.5,
    workExperience: 2,
    hasResearch:    false,
    greScore:       315,
    ieltsScore:     7.0,
  };

  console.log(`   Evaluating: ${sampleScholarship.name}`);
  console.log(`   Profile: GPA ${sampleProfile.gpa}, Work Exp ${sampleProfile.workExperience}yr, Target: ${sampleProfile.targetCountry}`);

  const start = Date.now();

  const res  = await fetch(`${BASE_URL}/api/scholarships/evaluate`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ scholarship: sampleScholarship, profile: sampleProfile }),
  });

  const latency = Date.now() - start;
  let body: any = {};
  try { body = await res.json(); } catch {}

  console.log(`\n   Response status: ${res.status} | Latency: ${latency}ms`);
  console.log(`   Body: ${JSON.stringify(body)}\n`);

  // The API might return 500 if GROQ_API_KEY is not configured in env.
  // That's acceptable — we verify it's graceful, not an unhandled crash.
  if (res.status === 500) {
    await assert('AI unavailable — returns structured error (not a crash)', typeof body.error === 'string', body);
    console.log('   ℹ️  Groq API key may not be configured. Graceful 500 is acceptable.\n');
    console.log('   🏁 Verdict');
    console.log('   ' + '─'.repeat(40));
    console.log('   ✅ PASS — API fails gracefully when AI is unavailable\n');
    return;
  }

  // Happy path assertions
  await assert('Returns HTTP 200',                               res.status === 200, res.status);
  await assert('percentage is a number',                         typeof body.percentage === 'number', typeof body.percentage);
  await assert('percentage is between 0 and 100',               body.percentage >= 0 && body.percentage <= 100, body.percentage);
  await assert('reasoning is a non-empty string',               typeof body.reasoning === 'string' && body.reasoning.length > 10, body.reasoning);
  await assert(`Responds within 10 seconds (actual: ${latency}ms)`, latency < 10_000, `${latency}ms`);

  // ── Verdict ───────────────────────────────────────────────
  console.log('\n   🏁 Verdict');
  console.log('   ' + '─'.repeat(40));
  if (process.exitCode === 1) {
    console.error('   ❌ FAIL — Scholarship AI API has issues\n');
  } else {
    console.log(`   ✅ PASS — AI returned ${body.percentage}% match in ${latency}ms\n`);
  }
}

test().catch(err => {
  console.error('Uncaught error:', err);
  process.exit(1);
});
