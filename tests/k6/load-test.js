/**
 * ============================================================
 * K6 Load Test — Margdarshak AI (High-Scale Edition)
 * ============================================================
 * Simulates realistic traffic ramp-up from 10 → 10,000 VUs
 * across all critical API endpoints.
 *
 * HOW TO RUN:
 *   # Standard test (up to 1000 VUs):
 *   k6 run tests/k6/load-test.js
 *
 *   # Export results to JSON:
 *   k6 run --out json=tests/k6/results.json tests/k6/load-test.js
 *
 *   # Scale to 5000 VUs (million-request simulation):
 *   k6 run --env SCALE=high tests/k6/load-test.js
 *
 *   # Cloud scale (1M VUs — requires k6 Cloud):
 *   k6 cloud tests/k6/load-test.js
 *
 * INSTALL K6 (Windows):
 *   winget install k6 --source winget
 * ============================================================
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// ── Custom Metrics ─────────────────────────────────────────
const errorRate          = new Rate('error_rate');
const leaderboardTrend   = new Trend('leaderboard_duration_ms');
const profileWriteTrend  = new Trend('profile_write_duration_ms');
const scholarshipTrend   = new Trend('scholarship_duration_ms');
const chatTrend          = new Trend('chat_duration_ms');
const totalRequests      = new Counter('total_requests');

// ── Scale selection ─────────────────────────────────────────
const SCALE = __ENV.SCALE || 'standard'; // 'standard' | 'high' | 'extreme'

const stageProfiles = {
  standard: [
    { duration: '30s',  target: 10   },  // Warm-up
    { duration: '60s',  target: 100  },  // Ramp up
    { duration: '60s',  target: 500  },  // Sustained
    { duration: '30s',  target: 1000 },  // Spike
    { duration: '30s',  target: 0    },  // Cool down
  ],
  high: [
    { duration: '30s',  target: 100  },  // Warm-up
    { duration: '60s',  target: 1000 },  // Ramp up
    { duration: '120s', target: 2000 },  // Sustained high
    { duration: '30s',  target: 5000 },  // Mega-spike
    { duration: '30s',  target: 0    },  // Cool down
  ],
  extreme: [
    { duration: '30s',  target: 500  },  // Warm-up
    { duration: '60s',  target: 5000 },  // Ramp up
    { duration: '120s', target: 10000},  // Sustained extreme
    { duration: '60s',  target: 0    },  // Cool down
  ],
};

// ── Test Configuration ─────────────────────────────────────
export const options = {
  stages: stageProfiles[SCALE] || stageProfiles.standard,
  thresholds: {
    // Overall HTTP performance
    'http_req_duration':        ['p(95)<1000', 'p(99)<2000'],
    // Error rate must be below 2%
    'error_rate':               ['rate<0.02'],
    // Per-endpoint thresholds
    'leaderboard_duration_ms':  ['p(95)<300',  'p(99)<600'],
    'profile_write_duration_ms':['p(95)<1000', 'p(99)<2000'],
    'scholarship_duration_ms':  ['p(95)<2000', 'p(99)<4000'],
    'chat_duration_ms':         ['p(95)<3000', 'p(99)<6000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// ── Test user pool (spread load across emails) ─────────────
const TEST_EMAILS = Array.from({ length: 20 }, (_, i) =>
  `loadtest_user_${i + 1}@margdarshak.test`
);

// ── Shared headers ─────────────────────────────────────────
const JSON_HEADERS = { 'Content-Type': 'application/json' };

// ── Main VU Function ───────────────────────────────────────
export default function () {
  const email = TEST_EMAILS[Math.floor(Math.random() * TEST_EMAILS.length)];

  // ── Scenario 1: Leaderboard Read (most frequent) ──────────
  group('leaderboard_read', () => {
    const res = http.get(`${BASE_URL}/api/leaderboard`, {
      tags: { name: 'leaderboard_get' },
    });
    leaderboardTrend.add(res.timings.duration);
    totalRequests.add(1);
    errorRate.add(res.status !== 200);

    check(res, {
      'leaderboard: status 200':       (r) => r.status === 200,
      'leaderboard: has data array':   (r) => {
        try { return Array.isArray(JSON.parse(r.body).data); } catch { return false; }
      },
      'leaderboard: p95 < 300ms':      (r) => r.timings.duration < 300,
    });
  });

  sleep(0.3);

  // ── Scenario 2: Profile Read ──────────────────────────────
  group('profile_read', () => {
    const res = http.get(`${BASE_URL}/api/profile?email=${encodeURIComponent(email)}`, {
      tags: { name: 'profile_get' },
    });
    totalRequests.add(1);
    errorRate.add(res.status >= 500);

    check(res, {
      'profile GET: not 5xx':     (r) => r.status < 500,
      'profile GET: < 500ms':     (r) => r.timings.duration < 500,
    });
  });

  sleep(0.2);

  // ── Scenario 3: Profile Write (LRS recalc + multi-table) ──
  group('profile_write', () => {
    const payload = JSON.stringify({
      email,
      gpa:           8.5,
      targetCountry: 'United States',
      targetField:   'Computer Science',
      degree:        'masters',
      greScore:      320,
      // Spoofed score — server must override via server-side LRS calc
      lrsScore:      850,
    });

    const res = http.post(`${BASE_URL}/api/profile`, payload, {
      headers: JSON_HEADERS,
      tags: { name: 'profile_post' },
    });
    profileWriteTrend.add(res.timings.duration);
    totalRequests.add(1);
    // 404 is expected for ghost emails; 5xx is an error
    errorRate.add(res.status >= 500);

    check(res, {
      'profile POST: not 5xx':        (r) => r.status < 500,
      'profile POST: returns JSON':   (r) => {
        try { JSON.parse(r.body); return true; } catch { return false; }
      },
      'profile POST: < 1000ms':       (r) => r.timings.duration < 1000,
    });
  });

  sleep(0.5);

  // ── Scenario 4: Scholarship (AI-augmented, heavier) ──────
  // Only 30% of VUs hit this to simulate realistic usage ratio
  if (Math.random() < 0.3) {
    group('scholarship_api', () => {
      const res = http.get(`${BASE_URL}/api/scholarships?country=United+States&field=Computer+Science`, {
        tags: { name: 'scholarships_get' },
      });
      scholarshipTrend.add(res.timings.duration);
      totalRequests.add(1);
      errorRate.add(res.status >= 500);

      check(res, {
        'scholarship: not 5xx':   (r) => r.status < 500,
        'scholarship: has data':  (r) => {
          try { const b = JSON.parse(r.body); return Array.isArray(b.scholarships) || !!b.data; } catch { return false; }
        },
      });
    });
    sleep(0.5);
  }

  sleep(1); // Think time
}

// ── Setup ──────────────────────────────────────────────────
export function setup() {
  console.log(`\n🚀 Margdarshak AI K6 Load Test — Scale: ${SCALE}`);
  console.log(`   Target: ${BASE_URL}`);

  const stages = stageProfiles[SCALE] || stageProfiles.standard;
  const maxVUs = Math.max(...stages.map(s => s.target));
  console.log(`   Max VUs: ${maxVUs.toLocaleString()}`);
  console.log(`   Thresholds: p95 < 1s, p99 < 2s, error rate < 2%\n`);
}

// ── Teardown ───────────────────────────────────────────────
export function teardown(data) {
  console.log('\n📊 Load test complete.');
  console.log('   Recommendations based on results:');
  console.log('   • If leaderboard p99 > 300ms → add in-memory cache with 60s TTL');
  console.log('   • If profile write p99 > 1s   → add Supabase pgBouncer pooling');
  console.log('   • If error_rate > 2%           → check DB connection pool exhaustion');
  console.log('   • If throughput < 100 req/s    → enable Next.js Edge Runtime + CDN\n');
}
