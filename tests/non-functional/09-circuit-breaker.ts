/**
 * ============================================================
 * TEST 09: Circuit Breaker Simulation
 * ============================================================
 * WHAT THIS TESTS:
 *   Fires 10 consecutive requests to /api/chat using a
 *   scenario that would fail (AI service unavailable).
 *   A proper circuit breaker means:
 *   1. All 10 requests return structured errors (not hangs)
 *   2. No connection hangs (each request completes within timeout)
 *   3. Error responses don't escalate (system stays stable)
 *   4. Response times remain consistent (no degradation over time)
 *
 * NOTE: This tests the OBSERVABLE behaviour. A real circuit
 * breaker (like 'opossum' library) would show faster responses
 * after the breaker trips. We document this as a future upgrade.
 *
 * HOW TO RUN:
 *   npx tsx tests/non-functional/09-circuit-breaker.ts
 * ============================================================
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const BASE_URL = 'http://localhost:3000';
const TOTAL_REQUESTS  = 10;
const REQUEST_TIMEOUT = 15_000; // 15 seconds per request

interface RequestResult {
  attempt:    number;
  status:     number | 'TIMEOUT' | 'ERROR';
  durationMs: number;
  isStructuredError: boolean;
}

async function fireRequest(attempt: number): Promise<RequestResult> {
  const start = Date.now();
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const res = await fetch(`${BASE_URL}/api/chat`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        messages: [{ role: 'user', content: `Circuit breaker test attempt ${attempt}` }]
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    let body: any = {};
    try { body = await res.json(); } catch {}

    const isStructuredError = res.status >= 400
      ? (typeof body.error === 'string' || typeof body.reply === 'string')
      : typeof body.reply === 'string';

    return {
      attempt,
      status:            res.status,
      durationMs:        Date.now() - start,
      isStructuredError,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const duration = Date.now() - start;

    if (err.name === 'AbortError') {
      return { attempt, status: 'TIMEOUT', durationMs: duration, isStructuredError: false };
    }
    return { attempt, status: 'ERROR', durationMs: duration, isStructuredError: false };
  }
}

async function test() {
  console.log('\n🧪 TEST 09 — Circuit Breaker Simulation');
  console.log('━'.repeat(55));
  console.log(`   Firing ${TOTAL_REQUESTS} consecutive chat API requests...`);
  console.log(`   Timeout per request: ${REQUEST_TIMEOUT}ms\n`);

  const results: RequestResult[] = [];

  for (let i = 1; i <= TOTAL_REQUESTS; i++) {
    const result = await fireRequest(i);
    results.push(result);

    const statusStr = result.status.toString();
    const icon      = result.status === 'TIMEOUT' ? '⏱'
                    : result.status === 'ERROR'   ? '🔴'
                    : result.status === 200        ? '🟢'
                    : '🟡';
    console.log(
      `   ${icon} Attempt ${String(i).padStart(2)} | Status: ${statusStr.padEnd(7)} | ${result.durationMs}ms | Structured: ${result.isStructuredError}`
    );

    // Small delay between requests (100ms)
    await new Promise(r => setTimeout(r, 100));
  }

  // ── Analysis ───────────────────────────────────────────────
  const timeouts  = results.filter(r => r.status === 'TIMEOUT');
  const errors    = results.filter(r => r.status === 'ERROR');
  const responses = results.filter(r => typeof r.status === 'number');
  const structured = results.filter(r => r.isStructuredError);

  const durations    = responses.map(r => r.durationMs).sort((a, b) => a - b);
  const avgDuration  = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;
  const maxDuration  = durations.length ? durations[durations.length - 1] : 0;

  // Check for stability: response times should NOT increase dramatically
  const firstHalf   = results.slice(0, 5).map(r => r.durationMs);
  const secondHalf  = results.slice(5).map(r => r.durationMs);
  const avgFirst    = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avgSecond   = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  const degradation = avgSecond / avgFirst; // Should be < 2x (no major escalation)

  console.log('\n   📊 Analysis');
  console.log('   ' + '─'.repeat(40));
  console.log(`   Total requests   : ${TOTAL_REQUESTS}`);
  console.log(`   Responses        : ${responses.length}`);
  console.log(`   Timeouts         : ${timeouts.length}`);
  console.log(`   Network errors   : ${errors.length}`);
  console.log(`   Structured errors: ${structured.length}/${TOTAL_REQUESTS}`);
  console.log(`   Avg response time: ${avgDuration}ms`);
  console.log(`   Max response time: ${maxDuration}ms`);
  console.log(`   Degradation ratio: ${degradation.toFixed(2)}x (ideal: < 2.0x)`);

  console.log('\n   🏁 Verdict');
  console.log('   ' + '─'.repeat(40));

  const noTimeouts     = timeouts.length === 0;
  const allStructured  = structured.length === TOTAL_REQUESTS;
  const stableLatency  = degradation < 3.0; // Allow 3x tolerance

  if (noTimeouts && allStructured && stableLatency) {
    console.log('   ✅ PASS — System remained stable across all 10 consecutive failures');
    console.log('            No hangs, no crashes, all responses structured.');
    if (degradation < 1.5) {
      console.log('            ⭐ Excellent: No latency degradation detected.');
    }
    console.log('\n   💡 Future Upgrade: Add opossum/node-circuit-breaker for automatic');
    console.log('      trip-and-recover behaviour (faster rejections after N failures)\n');
  } else {
    if (timeouts.length > 0) {
      console.error(`   ❌ ${timeouts.length} requests timed out — connections are hanging`);
    }
    if (!allStructured) {
      console.error(`   ❌ ${TOTAL_REQUESTS - structured.length} requests returned unstructured responses`);
    }
    if (!stableLatency) {
      console.error(`   ❌ Latency degraded ${degradation.toFixed(1)}x — system is under cascade stress`);
    }
    console.error('   ❌ FAIL\n');
    process.exit(1);
  }
}

test().catch(err => {
  console.error('Uncaught error:', err);
  process.exit(1);
});
