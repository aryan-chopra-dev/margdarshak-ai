'use client';
import { useState, useMemo } from 'react';
import { universities } from '@/data/universities';
import { salaryData as salaries } from '@/data/salaries';
import { loanProducts, calculateEMI } from '@/data/loans';
import { useAppStore } from '@/lib/store';
import {
  Calculator, DollarSign, TrendingUp, ArrowRight, IndianRupee,
  BarChart3, PieChart, Info
} from 'lucide-react';

const USD_TO_INR = 83;

export default function ROICalculatorPage() {
  const { profile } = useAppStore();
  const [selectedUni, setSelectedUni] = useState(profile.shortlistedUniversities?.[0] || 'mit');
  const [selectedField, setSelectedField] = useState(profile.targetField || 'Computer Science');
  const [loanRate, setLoanRate] = useState(11.25);
  const [loanTenure, setLoanTenure] = useState(10);
  const [scholarshipPct, setScholarshipPct] = useState(0);

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

  // Salary projections
  const preDegree = 4820; // Indian baseline from PLFS
  const postDegreeEntry = salary.entryLevelUSD;
  const postDegreeMid = salary.midCareerUSD;
  const postDegreeSenior = salary.seniorLevelUSD;

  // ROI
  const earningsGain10yr = (postDegreeEntry * 3 + postDegreeMid * 5 + postDegreeSenior * 2) - (preDegree * 10);
  const roi = ((earningsGain10yr - afterScholarship) / afterScholarship * 100);
  const breakEvenYears = afterScholarship / (postDegreeEntry - preDegree);

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
              icon={DollarSign}
              label="Total Education Cost"
              value={`$${Math.round(afterScholarship).toLocaleString()}`}
              sub={`₹${Math.round(totalCostINR / 100000).toLocaleString()} Lakhs`}
              color="#6C3CE1"
            />
            <MetricCard
              icon={IndianRupee}
              label="Monthly EMI"
              value={`₹${emi.emi.toLocaleString()}`}
              sub={`${loanTenure}yr at ${loanRate}% p.a.`}
              color="#0EA5E9"
            />
            <MetricCard
              icon={TrendingUp}
              label="10-Year ROI"
              value={`${roi.toFixed(0)}%`}
              sub={`Break-even: ${breakEvenYears.toFixed(1)} years`}
              color={roi > 0 ? '#10B981' : '#EF4444'}
            />
            <MetricCard
              icon={BarChart3}
              label="Salary Multiplier"
              value={`${(postDegreeMid / preDegree).toFixed(1)}×`}
              sub={`₹${Math.round(preDegree * USD_TO_INR / 100000)}L → ₹${Math.round(postDegreeMid * USD_TO_INR / 100000)}L`}
              color="#F59E0B"
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
                    {item.usd < 0 ? '-' : ''}${Math.abs(item.usd).toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    ₹{Math.abs(Math.round(item.usd * USD_TO_INR / 100000)).toLocaleString()} Lakhs
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
                    ${item.salary.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    ₹{Math.round(item.salary * USD_TO_INR / 100000)} LPA
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

function MetricCard({ icon: Icon, label, value, sub, color }: { icon: typeof DollarSign, label: string, value: string, sub: string, color: string }) {
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
