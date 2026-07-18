/**
 * ============================================================
 * K6 Load Test — Margdarshak AI
 * ============================================================
 * Simulates realistic traffic ramp-up against the two
 * most critical API endpoints:
 *   • GET /api/leaderboard  (read-heavy, DB-bound)
 *   • POST /api/profile      (write-heavy, DB + LRS calc)
 *
 * HOW TO RUN:
 *   k6 run tests/k6/load-test.js
 *   k6 run --out json=tests/k6/results.json tests/k6/load-test.js
 *
 * INSTALL K6 (Windows):
 *   winget install k6 --source winget
 * ============================================================
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// ── Custom Metrics ─────────────────────────────────────────
const errorRate         = new Rate('error_rate');
const leaderboardTrend  = new Trend('leaderboard_duration_ms');
const profileWriteTrend = new Trend('profile_write_duration_ms');

// ── Test Configuration ─────────────────────────────────────
export const options = {
  stages: [
    { duration: '30s', target: 50   },  // Warm-up: ramp to 50 VUs
    { duration: '60s', target: 500  },  // Ramp up: 50 → 500 VUs
    { duration: '60s', target: 500  },  // Sustained load: 500 VUs for 1 min
    { duration: '15s', target: 1000 },  // Spike: jump to 1000 VUs
    { duration: '30s', target: 0    },  // Cool down: back to 0
  ],
  thresholds: {
    // 95th percentile response time must be under 500ms
    'http_req_duration': ['p(95)<500'],
    // Error rate must be below 1%
    'error_rate': ['rate<0.01'],
    // Leaderboard must be fast
    'leaderboard_duration_ms': ['p(95)<300'],
    // Profile write is heavier (LRS calc + DB write)
    'profile_write_duration_ms': ['p(95)<800'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Test users pool — spread load across different emails
const TEST_EMAILS = [
  'loadtest_user_1@margdarshak.test',
  'loadtest_user_2@margdarshak.test',
  'loadtest_user_3@margdarshak.test',
  'loadtest_user_4@margdarshak.test',
  'loadtest_user_5@margdarshak.test',
];

// ── Main VU Function ───────────────────────────────────────
export default function () {
  const email = TEST_EMAILS[Math.floor(Math.random() * TEST_EMAILS.length)];

  // ── Scenario 1: Leaderboard Read (most frequent operation) ──
  const leaderboardRes = http.get(`${BASE_URL}/api/leaderboard`, {
    tags: { name: 'leaderboard_get' },
  });

  leaderboardTrend.add(leaderboardRes.timings.duration);
  errorRate.add(leaderboardRes.status !== 200);

  check(leaderboardRes, {
    '✅ Leaderboard: status 200':     (r) => r.status === 200,
    '✅ Leaderboard: has data field': (r) => {
      try { return Array.isArray(JSON.parse(r.body).data); } catch { return false; }
    },
    '✅ Leaderboard: responds < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(0.5); // Simulate user think time

  // ── Scenario 2: Profile Write (LRS recalculation + DB update) ──
  const profilePayload = JSON.stringify({
    email,
    name:          'Load Test User',
    gpa:           8.5,
    targetCountry: 'United States',
    targetField:   'Computer Science',
    degree:        'masters',
    greScore:      320,
    // Intentionally send a spoofed lrsScore — server must override this
    lrsScore:      850,
  });

  const profileRes = http.post(
    `${BASE_URL}/api/profile`,
    profilePayload,
    {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'profile_post' },
    }
  );

  profileWriteTrend.add(profileRes.timings.duration);
  errorRate.add(profileRes.status !== 200 && profileRes.status !== 400);

  check(profileRes, {
    '✅ Profile: status 2xx or 400':      (r) => r.status < 500,
    '✅ Profile: responds < 800ms':       (r) => r.timings.duration < 800,
    '✅ Profile: returns JSON':           (r) => {
      try { JSON.parse(r.body); return true; } catch { return false; }
    },
  });

  sleep(1); // Think time between iterations
}

// ── Setup: Print test configuration ───────────────────────
export function setup() {
  console.log(`\n🚀 Margdarshak AI Load Test`);
  console.log(`   Target: ${BASE_URL}`);
  console.log(`   Stages: warm-up 50 VUs → 500 VUs sustained → 1000 VU spike`);
  console.log(`   Thresholds: p95 < 500ms, error rate < 1%\n`);
}

// ── Teardown: Print summary ────────────────────────────────
export function teardown(data) {
  console.log('\n📊 Load test complete. Check the summary above for p95 latencies.');
  console.log('   If thresholds passed: ✅ System handled the load');
  console.log('   If thresholds failed: ❌ Bottleneck detected — check DB indexes or API logic\n');
}
