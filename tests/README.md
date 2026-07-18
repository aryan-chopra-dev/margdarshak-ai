# 🧪 Margdarshak AI — QE Testing Suite

> A comprehensive test suite covering functional correctness, security validation, performance, resilience, and caching — built for the Couchbase QE interview.

---

## Prerequisites

1. **Dev server running**: `npm run dev` (in a separate terminal)
2. **Supabase credentials**: Valid `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Node.js 18+** with `npx tsx` available
4. **(Optional) K6**: For load testing — install via `winget install k6 --source winget`
5. **(Optional) DATABASE_URL**: For EXPLAIN ANALYZE — direct PostgreSQL connection string in `.env.local`

---

## 🚀 Quick Start — Run All Tests

```bash
npm run test:func
```

This runs all 11 tests (7 functional + 4 non-functional) sequentially and prints a pass/fail summary table.

---

## 📋 Individual Test Commands

### Functional Tests (7)

| # | Test | Command |
|---|------|---------|
| 01 | LRS Tamper-Proof Calculation | `npx tsx tests/functional/01-lrs-calculation.ts` |
| 02 | Input Validation (CHECK constraints) | `npx tsx tests/functional/02-input-validation.ts` |
| 03 | Profile CRUD Lifecycle | `npx tsx tests/functional/03-profile-crud.ts` |
| 04 | Auth Flow (OTP Registration) | `npx tsx tests/functional/04-auth-flow.ts` |
| 05 | Leaderboard Rankings | `npx tsx tests/functional/05-leaderboard.ts` |
| 06 | Scholarship AI Evaluation | `npx tsx tests/functional/06-scholarship-ai.ts` |
| 07 | Chat API Response Shape | `npx tsx tests/functional/07-chat-api.ts` |

### Non-Functional Tests (4)

| # | Test | Command |
|---|------|---------|
| 08 | Fault Injection (AI Down) | `npx tsx tests/non-functional/08-fault-injection.ts` |
| 09 | Circuit Breaker Simulation | `npx tsx tests/non-functional/09-circuit-breaker.ts` |
| 10 | EXPLAIN ANALYZE (Query Plans) | `npx tsx tests/non-functional/10-explain-analyze.ts` |
| 11 | Cache Simulation & Latency | `npx tsx tests/non-functional/11-cache-simulation.ts` |

### Performance Tests

| Test | Command |
|------|---------|
| K6 Load Test (500–1000 VUs) | `npm run test:load` or `k6 run tests/k6/load-test.js` |
| Supavisor Pool Stress (100 parallel) | `npm run test:pool` |
| Pool Stress (custom concurrency) | `npx tsx tests/connection-pool/pool-stress.ts --concurrency=200` |

---

## 🏗️ Test Architecture

```
tests/
├── k6/
│   └── load-test.js              # K6 load test (ramp to 1000 VUs)
├── functional/
│   ├── 01-lrs-calculation.ts     # LRS tamper-proof (security)
│   ├── 02-input-validation.ts    # CHECK constraint violations
│   ├── 03-profile-crud.ts        # Full CRUD lifecycle
│   ├── 04-auth-flow.ts           # OTP registration API
│   ├── 05-leaderboard.ts         # Rankings sort + bounds
│   ├── 06-scholarship-ai.ts      # AI evaluation endpoint
│   └── 07-chat-api.ts            # Chat response shape
├── non-functional/
│   ├── 08-fault-injection.ts     # AI service failure recovery
│   ├── 09-circuit-breaker.ts     # Repeated failure stability
│   ├── 10-explain-analyze.ts     # Query plan inspection
│   └── 11-cache-simulation.ts    # Latency delta measurement
├── connection-pool/
│   └── pool-stress.ts            # Supavisor pool stress
├── run-all.ts                    # Master runner
└── README.md                     # This file
```

---

## 🔍 What Each Test Proves

### Functional Tests

| # | What It Proves | QE Interview Angle |
|---|----------------|-------------------|
| 01 | Server ignores client-sent LRS scores | **Data spoofing prevention** |
| 02 | DB rejects invalid GPA/GRE/TOEFL/IELTS | **Defense-in-depth validation** |
| 03 | JSON arrays (shortlist, docs) survive round-trip | **Schema integrity** |
| 04 | Auth API validates required fields | **Input sanitization** |
| 05 | Leaderboard is sorted, bounded [300–850] | **Business logic correctness** |
| 06 | AI returns structured output or graceful error | **Third-party resilience** |
| 07 | Chat returns reply + traces with <10s latency | **API contract validation** |

### Non-Functional Tests

| # | What It Proves | QE Interview Angle |
|---|----------------|-------------------|
| 08 | Malformed requests don't crash the server | **Fault tolerance** |
| 09 | 10 consecutive failures don't cause cascade | **Circuit breaker pattern** |
| 10 | DB queries use indexes, not full table scans | **Performance O(log N) vs O(N)** |
| 11 | Warm requests benefit from connection pooling | **Caching & CDN strategy** |

---

## 📊 Understanding Test Output

Each test prints:
- `✅` = assertion passed
- `❌` = assertion failed
- `ℹ️` = informational note (not a failure)
- `⚠️` = warning / improvement suggestion

The master runner (`run-all.ts`) prints a final ASCII table:

```
╔══════════════════════════════════════════════════════════════════════╗
║                  MARGDARSHAK AI — QE TEST SUMMARY                   ║
╠════╦══════════════════════════════════════╦════════════╦══════╦══════╣
║ ID ║ Test Name                            ║ Type       ║ Time ║ Rslt ║
╠════╬══════════════════════════════════════╬════════════╬══════╬══════╣
║ 01 ║ LRS Tamper-Proof Calculation          ║ Functional ║ 3s   ║  ✅  ║
...
╚══════════════════════════════════════════════════════════════════════╝
```

---

## 🛠️ Troubleshooting

| Issue | Fix |
|-------|-----|
| `Cannot reach localhost:3000` | Run `npm run dev` in another terminal first |
| `Missing Supabase credentials` | Add keys to `.env.local` |
| `No DATABASE_URL for EXPLAIN ANALYZE` | Test 10 gives manual instructions for Supabase SQL Editor |
| `K6 not found` | `winget install k6 --source winget` or download from [k6.io](https://k6.io/docs/get-started/installation/) |
| `AI tests return 500` | Normal if GROQ_API_KEY is not configured — tests verify graceful failure |
