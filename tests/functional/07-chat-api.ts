/**
 * ============================================================
 * TEST 07: Chat API Response Shape & Latency
 * ============================================================
 * WHAT THIS TESTS:
 *   POST /api/chat with a simple user message:
 *   1. Returns 200 (or graceful 500 if no API key configured)
 *   2. Response has a 'reply' string field
 *   3. Response has a 'traces' array field
 *   4. Responds within 10 seconds
 *   5. Does NOT return raw internal errors to the user
 *
 * HOW TO RUN:
 *   npx tsx tests/functional/07-chat-api.ts
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
  console.log('\n🧪 TEST 07 — Chat API Response Shape & Latency');
  console.log('━'.repeat(55));

  const testMessages = [
    {
      label:    'Simple question about Poonawala loan rates',
      messages: [{ role: 'user', content: 'What is the Poonawala Fincorp education loan interest rate?' }],
    },
    {
      label:    'GRE score question (RAG routing)',
      messages: [{ role: 'user', content: 'What GRE score do I need for MIT Computer Science?' }],
    },
  ];

  for (const tc of testMessages) {
    console.log(`\n   → Testing: "${tc.label}"`);

    const start   = Date.now();
    const res     = await fetch(`${BASE_URL}/api/chat`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ messages: tc.messages }),
    });
    const latency = Date.now() - start;

    let body: any = {};
    try { body = await res.json(); } catch {}

    console.log(`   Status: ${res.status} | Latency: ${latency}ms`);

    // Graceful AI-down scenario
    if (res.status === 500) {
      await assert('Graceful 500 — returns error field (not a crash)', typeof body.error === 'string', body);
      await assert('Does NOT leak raw stack trace',                     !JSON.stringify(body).includes('at '), body);
      console.log('   ℹ️  AI API key may not be configured. Graceful 500 is OK.');
      continue;
    }

    await assert('Returns HTTP 200',                    res.status === 200, res.status);
    await assert('reply field is a string',             typeof body.reply === 'string', typeof body.reply);
    await assert('reply is not empty',                  body.reply?.length > 10, body.reply?.length);
    await assert('traces field is an array',            Array.isArray(body.traces), typeof body.traces);
    await assert('traces has at least 1 entry',         body.traces?.length >= 1, body.traces?.length);
    await assert(`Responds < 10s (actual: ${latency}ms)`, latency < 10_000, `${latency}ms`);
  }

  // ── Verdict ───────────────────────────────────────────────
  console.log('\n   🏁 Verdict');
  console.log('   ' + '─'.repeat(40));
  if (process.exitCode === 1) {
    console.error('   ❌ FAIL — Chat API did not behave correctly\n');
  } else {
    console.log('   ✅ PASS — Chat API responds with correct shape\n');
  }
}

test().catch(err => {
  console.error('Uncaught error:', err);
  process.exit(1);
});
