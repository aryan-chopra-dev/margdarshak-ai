/**
 * ============================================================
 * Master Test Runner — Margdarshak AI QE Suite
 * ============================================================
 * Runs all functional and non-functional tests sequentially,
 * captures pass/fail results, and prints a summary table.
 *
 * HOW TO RUN:
 *   npx tsx tests/run-all.ts
 *
 * NOTE: The dev server must be running (npm run dev) on
 * localhost:3000 before running this.
 * ============================================================
 */

import { execSync } from 'child_process';
import path from 'path';

interface TestResult {
  id:        string;
  name:      string;
  type:      'Functional' | 'Non-Functional';
  passed:    boolean;
  durationS: number;
  output:    string;
}

const tests = [
  // Functional Tests
  { id: '01', name: 'LRS Tamper-Proof Calculation',   type: 'Functional' as const,     file: 'functional/01-lrs-calculation.ts' },
  { id: '02', name: 'Input Validation (CHECK)',       type: 'Functional' as const,     file: 'functional/02-input-validation.ts' },
  { id: '03', name: 'Profile CRUD Lifecycle',         type: 'Functional' as const,     file: 'functional/03-profile-crud.ts' },
  { id: '04', name: 'Auth Flow (OTP)',                type: 'Functional' as const,     file: 'functional/04-auth-flow.ts' },
  { id: '05', name: 'Leaderboard Rankings',           type: 'Functional' as const,     file: 'functional/05-leaderboard.ts' },
  { id: '06', name: 'Scholarship AI Evaluation',      type: 'Functional' as const,     file: 'functional/06-scholarship-ai.ts' },
  { id: '07', name: 'Chat API Response Shape',        type: 'Functional' as const,     file: 'functional/07-chat-api.ts' },
  // Non-Functional Tests
  { id: '08', name: 'Fault Injection (AI Down)',       type: 'Non-Functional' as const, file: 'non-functional/08-fault-injection.ts' },
  { id: '09', name: 'Circuit Breaker Simulation',     type: 'Non-Functional' as const, file: 'non-functional/09-circuit-breaker.ts' },
  { id: '10', name: 'EXPLAIN ANALYZE (Query Plan)',   type: 'Non-Functional' as const, file: 'non-functional/10-explain-analyze.ts' },
  { id: '11', name: 'Cache Simulation & Latency',     type: 'Non-Functional' as const, file: 'non-functional/11-cache-simulation.ts' },
];

function runTest(testDef: typeof tests[0]): TestResult {
  const filePath = path.resolve(__dirname, testDef.file);
  const start    = Date.now();
  let output     = '';
  let passed     = false;

  try {
    output = execSync(`npx tsx "${filePath}"`, {
      cwd:      path.resolve(__dirname, '..'),
      encoding: 'utf-8',
      timeout:  120_000,  // 2 minute timeout per test
      stdio:    ['pipe', 'pipe', 'pipe'],
      env:      { ...process.env, FORCE_COLOR: '0' },
    });
    passed = true;
  } catch (err: any) {
    output = (err.stdout || '') + '\n' + (err.stderr || '');
    passed = false;
  }

  return {
    id:        testDef.id,
    name:      testDef.name,
    type:      testDef.type,
    passed,
    durationS: Math.round((Date.now() - start) / 1000),
    output,
  };
}

// ── Pretty-print helpers ───────────────────────────────────
function pad(str: string, len: number) {
  return str.length >= len ? str.slice(0, len) : str + ' '.repeat(len - str.length);
}

function printSummary(results: TestResult[]) {
  const totalPassed = results.filter(r => r.passed).length;
  const totalFailed = results.filter(r => !r.passed).length;

  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════╗');
  console.log('║                  MARGDARSHAK AI — QE TEST SUMMARY                   ║');
  console.log('╠════╦══════════════════════════════════════╦════════════╦══════╦══════╣');
  console.log('║ ID ║ Test Name                            ║ Type       ║ Time ║ Rslt ║');
  console.log('╠════╬══════════════════════════════════════╬════════════╬══════╬══════╣');

  for (const r of results) {
    const icon   = r.passed ? '✅' : '❌';
    const id     = pad(r.id, 2);
    const name   = pad(r.name, 36);
    const type   = pad(r.type === 'Functional' ? 'Functional' : 'Non-Func', 10);
    const time   = pad(`${r.durationS}s`, 4);
    console.log(`║ ${id} ║ ${name} ║ ${type} ║ ${time} ║  ${icon}  ║`);
  }

  console.log('╠════╩══════════════════════════════════════╩════════════╩══════╩══════╣');
  console.log(`║  Total: ${results.length} tests | ✅ Passed: ${totalPassed} | ❌ Failed: ${totalFailed}${' '.repeat(27 - String(totalPassed).length - String(totalFailed).length - String(results.length).length)}║`);
  console.log('╚══════════════════════════════════════════════════════════════════════╝');

  // Print failed test outputs for debugging
  const failedTests = results.filter(r => !r.passed);
  if (failedTests.length > 0) {
    console.log('\n\n🔍 FAILED TEST DETAILS:');
    console.log('═'.repeat(70));
    for (const r of failedTests) {
      console.log(`\n── Test ${r.id}: ${r.name} ──`);
      console.log(r.output.trim().split('\n').map(l => `   ${l}`).join('\n'));
    }
  }

  console.log('\n');
}

// ── Main ───────────────────────────────────────────────────
async function main() {
  console.log('\n🚀 Margdarshak AI — Running Full QE Test Suite');
  console.log('━'.repeat(55));
  console.log(`   Tests to run: ${tests.length}`);
  console.log('   Make sure dev server is running (npm run dev)\n');

  // Quick health check
  try {
    const healthCheck = await fetch('http://localhost:3000/api/leaderboard');
    if (!healthCheck.ok) throw new Error(`Status ${healthCheck.status}`);
    console.log('   ✅ Dev server is reachable\n');
  } catch {
    console.error('   ❌ Cannot reach http://localhost:3000');
    console.error('   Start the dev server first: npm run dev\n');
    process.exit(1);
  }

  const results: TestResult[] = [];

  for (const testDef of tests) {
    console.log(`\n   ▶ Running Test ${testDef.id}: ${testDef.name}...`);
    const result = runTest(testDef);
    results.push(result);

    const icon = result.passed ? '✅' : '❌';
    console.log(`   ${icon} Test ${testDef.id} — ${result.passed ? 'PASSED' : 'FAILED'} (${result.durationS}s)`);
  }

  printSummary(results);

  // Exit with error code if any test failed
  const anyFailed = results.some(r => !r.passed);
  process.exit(anyFailed ? 1 : 0);
}

main();
