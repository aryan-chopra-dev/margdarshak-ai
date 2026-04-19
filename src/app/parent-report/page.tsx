'use client';
import { useAppStore } from '@/lib/store';
import { universities } from '@/data/universities';
import { salaryData } from '@/data/salaries';
import { loanProducts, calculateEMI } from '@/data/loans';
import Link from 'next/link';
import {
  Users, TrendingUp, IndianRupee, Shield, GraduationCap,
  CheckCircle2, ArrowRight, Download, BarChart3, DollarSign
} from 'lucide-react';

const USD_TO_INR = 83;

export default function ParentReportPage() {
  const { profile } = useAppStore();
  const favUnis = universities.filter(u => profile.shortlistedUniversities.includes(u.id));
  const topUni = favUnis[0] || universities.find(u => u.id === 'mit') || universities[0];
  const field = profile.targetField || 'Computer Science';
  const salary = salaryData.find(s => s.field === field && s.country === topUni.country) ||
                 salaryData.find(s => s.field === field) || salaryData[0];

  const totalCost = topUni.tuitionUSD * 2; // 2 year program
  const totalCostINR = totalCost * USD_TO_INR;
  const poonawala = loanProducts.find(l => l.id === 'poonawala')!;
  const emi = calculateEMI(totalCostINR, poonawala.interestRateMin, 10);

  const preDegree = 4820;
  const salaryGrowth = ((salary.entryLevelUSD / preDegree - 1) * 100).toFixed(0);
  const roiMultiple = (salary.midCareerUSD / preDegree).toFixed(1);

  return (
    <div className="page-container">
      <div className="section-label"><Users size={14} /> Parent Persuasion Module</div>
      <h1 className="page-title">Investment Case for Parents</h1>
      <p className="page-subtitle" style={{ marginBottom: 40 }}>
        AI-generated report to help your parents understand the ROI of your education investment.
        Share this with them to address their concerns with real data.
      </p>

      {/* The Report */}
      <div style={{
        maxWidth: 800, margin: '0 auto',
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)', padding: 48,
        boxShadow: 'var(--shadow-xl)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16, margin: '0 auto 16px',
            background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <GraduationCap size={32} color="white" />
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 4 }}>
            Education Investment Case
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)' }}>
            Prepared for the family of <strong>{profile.name || 'Student'}</strong>
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '32px 0' }} />

        {/* University Summary */}
        <div style={{ marginBottom: 36 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <GraduationCap size={20} color="var(--primary)" /> Target University
          </h3>
          <div style={{
            padding: 24, borderRadius: 'var(--radius-lg)', background: 'var(--bg-elevated)',
            border: '1px solid var(--border-light)',
          }}>
            <h4 style={{ fontSize: 20, fontWeight: 800 }}>{topUni.name}</h4>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>
              {topUni.city}, {topUni.country} · QS Rank #{topUni.qsRank2025 || 'N/A'}
            </p>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tuition/year</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>${topUni.tuitionUSD.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Acceptance</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{(topUni.admissionRate * 100).toFixed(1)}%</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>10yr Earnings</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>${topUni.medianEarnings10yr.toLocaleString()}/yr</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>
              Data: {topUni.dataSource}
            </div>
          </div>
        </div>

        {/* Why This is a Good Investment */}
        <div style={{ marginBottom: 36 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={20} color="var(--success)" /> Why This Is a Smart Investment
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div style={{
              padding: 20, borderRadius: 'var(--radius-md)', textAlign: 'center',
              background: 'var(--success-bg)', border: '1px solid rgba(16,185,129,0.2)',
            }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--success)' }}>{salaryGrowth}%</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Salary increase post-degree</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Entry level vs current Indian avg</div>
            </div>
            <div style={{
              padding: 20, borderRadius: 'var(--radius-md)', textAlign: 'center',
              background: 'var(--primary-bg)', border: '1px solid var(--primary-border)',
            }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--primary)' }}>{roiMultiple}×</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Mid-career salary multiplier</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Compared to pre-degree salary</div>
            </div>
            <div style={{
              padding: 20, borderRadius: 'var(--radius-md)', textAlign: 'center',
              background: 'var(--accent-bg)', border: '1px solid rgba(14,165,233,0.2)',
            }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--accent-dark)' }}>{salary.demandIndex}%</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Job market demand index</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>For {field} globally</div>
            </div>
          </div>
        </div>

        {/* EMI Affordability */}
        <div style={{ marginBottom: 36 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <IndianRupee size={20} color="var(--accent-dark)" /> Loan EMI Affordability
          </h3>
          <div style={{
            padding: 24, borderRadius: 'var(--radius-lg)', background: 'var(--bg-elevated)',
            border: '1px solid var(--border-light)',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Monthly EMI</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--primary)' }}>₹{emi.emi.toLocaleString()}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  via Poonawala Fincorp @ {poonawala.interestRateMin}% p.a. for {10} years
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Post-degree monthly salary</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--success)' }}>
                  ₹{Math.round(salary.entryLevelUSD * USD_TO_INR / 12).toLocaleString()}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Entry-level {field} in {topUni.country}
                </div>
              </div>
            </div>
            <div style={{
              marginTop: 16, padding: 14, borderRadius: 'var(--radius-md)',
              background: 'var(--success-bg)', border: '1px solid rgba(16,185,129,0.2)',
            }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--success)' }}>
                <CheckCircle2 size={16} style={{ marginRight: 6 }} />
                EMI is only {((emi.emi / (salary.entryLevelUSD * USD_TO_INR / 12)) * 100).toFixed(0)}% of
                expected post-degree monthly income — well within the recommended 30% comfort zone.
              </p>
            </div>
          </div>
        </div>

        {/* Safety / Trust */}
        <div style={{ marginBottom: 36 }}>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Shield size={20} color="var(--primary)" /> Safety & Trust Factors
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              'Poonawala Fincorp is an RBI-registered NBFC with ₹25,000+ Cr AUM',
              'Moratorium period — no EMI during course duration',
              'Education loan interest is tax-deductible under Section 80E (up to 8 years)',
              `Median alumni from ${topUni.name} earn $${topUni.medianEarnings10yr.toLocaleString()}/yr within 10 years`,
              'Loan covers tuition + living + travel — no hidden costs',
              'Flexible repayment tenure up to 15 years',
            ].map((point, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={16} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} />
                {point}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{
          padding: 28, borderRadius: 'var(--radius-lg)',
          background: 'var(--grad-primary)', textAlign: 'center', color: 'white',
        }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Ready to take the next step?</h3>
          <p style={{ fontSize: 14, opacity: 0.85, marginBottom: 20 }}>
            Start your loan application in 60 seconds — all from this platform.
          </p>
          <Link href="/apply" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'white', color: 'var(--primary)', fontWeight: 700,
            padding: '12px 32px', borderRadius: 'var(--radius-full)',
            textDecoration: 'none', fontSize: 15,
          }}>
            Apply Now <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Share / Print */}
      <div style={{ maxWidth: 800, margin: '24px auto 0', textAlign: 'center' }}>
        <button className="btn-secondary" onClick={() => window.print()} style={{ padding: '10px 24px', fontSize: 14 }}>
          <Download size={16} /> Download / Print Report
        </button>
      </div>
    </div>
  );
}
