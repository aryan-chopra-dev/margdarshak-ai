'use client';
import { useState, useMemo } from 'react';
import { universities } from '@/data/universities';
import { loanProducts, calculateEMI } from '@/data/loans';
import { useAppStore } from '@/lib/store';
import { salaryData as salaries, indianBaselineSalary } from '@/data/salaries';
import {
  Calculator, IndianRupee, TrendingUp, ArrowRight,
  BarChart3, PieChart, Info
} from 'lucide-react';

const USD_TO_INR = 83;

// --- Financial Math Helpers ---
function calculateIRR(cashFlows: number[], guess = 0.1): number {
  const maxTries = 100;
  let rate = guess;
  for (let i = 0; i < maxTries; i++) {
    let npv = 0;
    let dNpv = 0;
    for (let t = 0; t < cashFlows.length; t++) {
      npv += cashFlows[t] / Math.pow(1 + rate, t);
      if (t > 0) dNpv -= (t * cashFlows[t]) / Math.pow(1 + rate, t + 1);
    }
    if (Math.abs(npv) < 1e-5) return rate;
    const newRate = rate - npv / dNpv;
    if (Math.abs(newRate - rate) < 1e-5) return newRate;
    rate = newRate;
  }
  return rate;
}

function calculateNPV(rate: number, cashFlows: number[]): number {
  return cashFlows.reduce((npv, cf, t) => npv + cf / Math.pow(1 + rate, t), 0);
}

const SCENARIOS = {
  optimistic: { name: 'Optimistic', salaryGrowthMult: 1.2, taxUS: 0.25, taxIN: 0.15, inflation: 0.02, discountRate: 0.08 },
  realistic:  { name: 'Realistic', salaryGrowthMult: 1.0, taxUS: 0.30, taxIN: 0.20, inflation: 0.03, discountRate: 0.10 },
  conservative: { name: 'Conservative', salaryGrowthMult: 0.7, taxUS: 0.35, taxIN: 0.25, inflation: 0.04, discountRate: 0.12 },
};

export default function ROICalculatorPage() {
  const { profile } = useAppStore();
  const [selectedUni, setSelectedUni] = useState(profile.shortlistedUniversities?.[0] || 'mit');
  const [selectedField, setSelectedField] = useState(profile.targetField || 'Computer Science');
  const [loanRate, setLoanRate] = useState(11.25);
  const [loanTenure, setLoanTenure] = useState(10);
  const [scholarshipPct, setScholarshipPct] = useState(0);
  const [scenarioKey, setScenarioKey] = useState<keyof typeof SCENARIOS>('realistic');

  const scenario = SCENARIOS[scenarioKey];

  const uni = universities.find(u => u.id === selectedUni) || universities[0];
  const country = uni.country;

  // Find salary data for this field
  const salary = salaries.find(s => s.field === selectedField && s.country === country) ||
                 salaries.find(s => s.field === selectedField && s.country === 'United States') ||
                 salaries[0];

  // Fixed costs
  const tuitionPerYear = uni.tuitionUSD;
  const programYears = uni.type === 'domestic' && uni.id.startsWith('iim') ? 2 : (country === 'United Kingdom' ? 1 : 2);
  const livingCostPerYear = country === 'United States' ? 20000 :
    country === 'United Kingdom' ? 18000 :
    country === 'Canada' ? 15000 :
    country === 'Germany' ? 12000 :
    country === 'India' ? 3000 : 16000;

  const totalCost = (tuitionPerYear + livingCostPerYear) * programYears;
  const afterScholarship = totalCost * (1 - scholarshipPct / 100);
  const totalCostINR = afterScholarship * USD_TO_INR;

  // Loan EMI
  const emi = calculateEMI(totalCostINR, loanRate, loanTenure);

  // Pre-degree baseline from PLFS data, keyed on work experience.
  const preDegree =
    profile.workExperience >= 3 ? indianBaselineSalary.withExperience3to5 :
    profile.workExperience >= 1 ? indianBaselineSalary.withExperience1to3 :
    indianBaselineSalary.freshGraduate;

  const postDegreeEntry = salary.entryLevelUSD * scenario.salaryGrowthMult;
  const postDegreeMid = salary.midCareerUSD * scenario.salaryGrowthMult;
  const postDegreeSenior = salary.seniorLevelUSD * scenario.salaryGrowthMult;

  // Generate 10-Year Unlevered Cash Flows for Project IRR
  const cashFlows: number[] = [];
  let cumulativeUnlevered = 0;
  let breakEvenYears = -1;

  for (let t = 0; t < programYears + 10; t++) {
    let cf = 0;
    // Pre-degree trajectory (Opportunity cost)
    const preDegreeGrowth = 0.08 * scenario.salaryGrowthMult;
    const currentPreDegree = preDegree * Math.pow(1 + preDegreeGrowth, t);
    const preDegreeNet = currentPreDegree * (1 - scenario.taxIN);

    if (t < programYears) {
      // During study years: Outflow is Net Tuition + Lost Wages (Net)
      cf = -preDegreeNet - (afterScholarship / programYears);
    } else {
      // Working years
      const workYear = t - programYears;
      let currentSalary = postDegreeEntry * Math.pow(1 + (salary.annualGrowthPct / 100) * scenario.salaryGrowthMult, workYear);
      if (currentSalary > postDegreeSenior) currentSalary = postDegreeSenior;

      const postDegreeNet = currentSalary * (1 - scenario.taxUS);
      cf = postDegreeNet - preDegreeNet;
    }

    cashFlows.push(cf);
    cumulativeUnlevered += cf;
    if (breakEvenYears === -1 && cumulativeUnlevered > 0) {
      const prev = cumulativeUnlevered - cf;
      breakEvenYears = t - 1 + Math.abs(prev) / cf;
    }
  }

  const irr = calculateIRR(cashFlows) * 100;
  const npv = calculateNPV(scenario.discountRate, cashFlows);

  return (
    <div className="page-container">
      <div className="section-label"><Calculator size={14} /> ROI Calculator</div>
      <h1 className="page-title">Education Investment ROI</h1>
      <p className="page-subtitle" style={{ marginBottom: 32 }}>
        Project your return on investment using real salary data from US BLS, NIRF, and PayScale
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, alignItems: 'flex-start' }}>
        {/* Left: Inputs */}
        <div className="card-static" style={{ padding: 28, position: 'sticky', top: 88 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Configure</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label className="input-label">Economic Scenario</label>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                {(Object.keys(SCENARIOS) as Array<keyof typeof SCENARIOS>).map(key => (
                  <button
                    key={key}
                    onClick={() => setScenarioKey(key)}
                    style={{
                      flex: 1,
                      padding: '8px 4px',
                      fontSize: 12,
                      fontWeight: scenarioKey === key ? 700 : 500,
                      borderRadius: 'var(--radius-md)',
                      border: scenarioKey === key ? '1px solid var(--primary)' : '1px solid var(--border)',
                      background: scenarioKey === key ? 'var(--primary-bg)' : 'transparent',
                      color: scenarioKey === key ? 'var(--primary)' : 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {SCENARIOS[key].name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="input-label">University</label>
              <select className="input-field" value={selectedUni} onChange={e => setSelectedUni(e.target.value)}>
                {universities.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.country})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="input-label">Field of Study</label>
              <select className="input-field" value={selectedField} onChange={e => setSelectedField(e.target.value)}>
                {[...new Set(salaries.map(s => s.field))].map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="input-label">Scholarship / Aid: {scholarshipPct}%</label>
              <input type="range" min="0" max="80" step="5" value={scholarshipPct}
                onChange={e => setScholarshipPct(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary)' }}
              />
            </div>

            <div>
              <label className="input-label">Loan Interest Rate: {loanRate}% p.a.</label>
              <input type="range" min="8" max="16" step="0.25" value={loanRate}
                onChange={e => setLoanRate(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary)' }}
              />
            </div>

            <div>
              <label className="input-label">Loan Repayment Tenure: {loanTenure} years</label>
              <input type="range" min="3" max="15" step="1" value={loanTenure}
                onChange={e => setLoanTenure(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary)' }}
              />
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Top metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <MetricCard
              icon={IndianRupee}
              label="Total Net Cost"
              value={`₹${Math.round(afterScholarship * USD_TO_INR).toLocaleString('en-IN')}`}
              sub={`Approx. ₹${Math.round(totalCostINR / 100000).toLocaleString('en-IN')} Lakhs`}
              color="#6C3CE1"
            />
            <MetricCard
              icon={TrendingUp}
              label="Net Present Value (NPV)"
              value={`$${Math.round(npv).toLocaleString()}`}
              sub={`Discounted at ${scenario.discountRate * 100}%`}
              color={npv > 0 ? '#10B981' : '#EF4444'}
            />
            <MetricCard
              icon={BarChart3}
              label="10-Year Project IRR"
              value={`${irr.toFixed(1)}%`}
              sub={breakEvenYears > 0 ? `Payback: ${breakEvenYears.toFixed(1)} years` : `No Payback in 10yrs`}
              color={irr > 0 ? '#10B981' : '#EF4444'}
            />
            <MetricCard
              icon={IndianRupee}
              label="Monthly EMI"
              value={`₹${emi.emi.toLocaleString('en-IN')}`}
              sub={`${loanTenure}yr at ${loanRate}% p.a.`}
              color="#0EA5E9"
            />
          </div>

          {/* Cost Breakdown */}
          <div className="card-static" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Cost Breakdown</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { label: 'Tuition × ' + programYears + ' years', usd: tuitionPerYear * programYears },
                { label: 'Living Costs × ' + programYears + ' years', usd: livingCostPerYear * programYears },
                { label: 'Scholarship/Aid', usd: -(totalCost * scholarshipPct / 100) },
                { label: 'Net Cost', usd: afterScholarship, bold: true },
              ].map((item, i) => (
                <div key={i} style={{
                  padding: '14px 18px', borderRadius: 'var(--radius-md)',
                  background: item.bold ? 'var(--primary-bg)' : 'var(--bg-elevated)',
                  border: item.bold ? '1px solid var(--primary-border)' : 'none',
                }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 20, fontWeight: item.bold ? 800 : 700, color: item.usd < 0 ? 'var(--success)' : 'var(--text)' }}>
                    {item.usd < 0 ? '-' : ''}₹{Math.abs(Math.round(item.usd * USD_TO_INR)).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Approx. ₹{Math.abs(Math.round(item.usd * USD_TO_INR / 100000)).toLocaleString('en-IN')} Lakhs
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Salary Trajectory */}
          <div className="card-static" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Salary Trajectory ({salary.dataSource})</h3>
            <div style={{ display: 'flex', gap: 16 }}>
              {[
                { label: 'Pre-Degree (India)', salary: preDegree, phase: 'Before' },
                { label: 'Entry Level (0-2yr)', salary: postDegreeEntry, phase: 'After', growth: ((postDegreeEntry / preDegree - 1) * 100).toFixed(0) + '%' },
                { label: 'Mid-Career (5-8yr)', salary: postDegreeMid, phase: 'After' },
                { label: 'Senior (10-15yr)', salary: postDegreeSenior, phase: 'After' },
              ].map((item, i) => (
                <div key={i} style={{
                  flex: 1, padding: 16, borderRadius: 'var(--radius-md)',
                  background: i === 0 ? 'var(--bg-elevated)' : 'var(--primary-bg)',
                  border: i > 0 ? '1px solid var(--primary-border)' : 'none',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>{item.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: i > 0 ? 'var(--primary)' : 'var(--text)' }}>
                    ₹{Math.round(item.salary * USD_TO_INR).toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    ₹{Math.round(item.salary * USD_TO_INR / 100000).toLocaleString('en-IN')} LPA
                  </div>
                  {item.growth && (
                    <div style={{ fontSize: 11, color: 'var(--success)', fontWeight: 700, marginTop: 4 }}>
                      +{item.growth} increase
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Info size={12} />
              Source: {salary.sourceUrl}
            </div>
          </div>

          {/* EMI Details */}
          <div className="card-static" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Loan EMI Summary (Poonawala Fincorp)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
              <div style={{ padding: 14, borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Principal</div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>₹{(totalCostINR / 100000).toFixed(1)}L</div>
              </div>
              <div style={{ padding: 14, borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Monthly EMI</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>₹{emi.emi.toLocaleString()}</div>
              </div>
              <div style={{ padding: 14, borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Interest</div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>₹{(emi.totalInterest / 100000).toFixed(1)}L</div>
              </div>
              <div style={{ padding: 14, borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Payable</div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>₹{(emi.totalPayment / 100000).toFixed(1)}L</div>
              </div>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>
              Rate from poonawallafincorp.com/education-loan.php — starting at 11.25% p.a.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, sub, color }: { icon: typeof IndianRupee, label: string, value: string, sub: string, color: string }) {
  return (
    <div className="card-static" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: `${color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={16} color={color} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{label}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 900, color, letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>
    </div>
  );
}
