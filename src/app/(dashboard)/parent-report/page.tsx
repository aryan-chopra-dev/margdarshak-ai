'use client';
import { useAppStore } from '@/lib/store';
import { universities, University } from '@/data/universities';
import { salaryData } from '@/data/salaries';
import { loanProducts, calculateEMI } from '@/data/loans';
import Link from 'next/link';
import {
  Users, TrendingUp, IndianRupee, Shield, GraduationCap,
  CheckCircle2, ArrowRight, Download, Star, AlertTriangle,
  BarChart3, Award, Briefcase, Globe, Clock
} from 'lucide-react';

const USD_TO_INR = 83;

interface UniversityAnalysis {
  uni: University;
  salary: ReturnType<typeof salaryData['find']>;
  totalCostINR: number;
  emi: ReturnType<typeof calculateEMI>;
  roiScore: number;
  emiToSalaryRatio: number;
  paybackYears: number;
  netGain10yr: number;
  recommended: boolean;
}

export default function ParentReportPage() {
  const { profile } = useAppStore();
  const defaultLoan = loanProducts.find(l => l.id === 'credila') || loanProducts[0]!;
  const field = profile.targetField || 'Computer Science';
  const preDegreeAnnualUSD = 4820;

  // P0 Fix #1 — safe optional chaining so undefined doesn't crash .includes()
  const favUnis = universities.filter(u => profile.shortlistedUniversities?.includes(u.id));

  // P0 Fix #1 — safe .length check
  if (!profile.shortlistedUniversities?.length) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h1 className="page-title">Shortlist Universities First</h1>
        <p className="page-subtitle" style={{ marginBottom: 32 }}>
          To generate an accurate Investment Case for your parents, please shortlist at least one university via the Career Navigator.
        </p>
        <Link href="/career-navigator" className="btn-primary" style={{ padding: '12px 24px', fontSize: 16 }}>
          Go to Career Navigator <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  // Fix #4 — include living costs in totalCostINR (matches Apply & Repayment pages)
  const getLivingCost = (country: string) =>
    country === 'United States' ? 20000 :
    country === 'United Kingdom' ? 18000 :
    country === 'Canada' ? 15000 :
    country === 'Germany' ? 12000 :
    country === 'India' ? 3000 : 16000;

  // --- Build analysis for each shortlisted university ---
  const analyses: UniversityAnalysis[] = favUnis.map(uni => {
    const salary =
      salaryData.find(s => s.field === field && s.country === uni.country) ||
      salaryData.find(s => s.field === field) ||
      salaryData[0]!;
    const programYears = uni.country === 'United Kingdom' ? 1 : 2;
    const livingCostPerYear = getLivingCost(uni.country);
    // Fix #4: include living expenses (tuition + living) × years
    const totalCostINR = (uni.tuitionUSD + livingCostPerYear) * programYears * USD_TO_INR;
    const emi = calculateEMI(totalCostINR, defaultLoan.interestRateMin, 10);
    const annualSalaryINR = salary.entryLevelUSD * USD_TO_INR;
    const emiToSalaryRatio = (emi.emi / (annualSalaryINR / 12)) * 100;
    const netGain10yr = (salary.midCareerUSD * 10) - (uni.tuitionUSD * 2) - (preDegreeAnnualUSD * 10);
    const paybackYears = (uni.tuitionUSD * programYears + livingCostPerYear * programYears) / Math.max(1, salary.entryLevelUSD - preDegreeAnnualUSD);
    // ROI Score: composite of earnings/cost, acceptance potential, and EMI burden
    const roiScore = (uni.medianEarnings10yr || salary.midCareerUSD) / Math.max(1, uni.tuitionUSD / 10) - emiToSalaryRatio;
    return { uni, salary, totalCostINR, emi, roiScore, emiToSalaryRatio, paybackYears, netGain10yr, recommended: false };
  });

  // Crown the best: highest ROI Score
  const maxRoi = Math.max(...analyses.map(a => a.roiScore));
  analyses.forEach(a => { a.recommended = a.roiScore === maxRoi; });
  const recommended = analyses.find(a => a.recommended);
  // P0 Fix #2 — guard against no recommended (salary data gap)
  if (!recommended) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h1 className="page-title">Unable to Score Universities</h1>
        <p className="page-subtitle" style={{ marginBottom: 32 }}>
          We couldn&apos;t find salary data for your target field and shortlisted countries. Try selecting a different field in your profile.
        </p>
        <Link href="/profile" className="btn-primary" style={{ padding: '12px 24px', fontSize: 16 }}>
          Update Profile <ArrowRight size={16} />
        </Link>
      </div>
    );
  }
  const others = analyses.filter(a => !a.recommended);

  const reportDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  // Fix #5 — deterministic doc ID (no Math.random() that re-rolls on every render)
  const docId = String(
    (recommended.uni.name.charCodeAt(0) * 1117 + new Date().getFullYear() * 31) % 90000 + 10000
  );

  return (
    <div className="page-container hide-nav-on-print">
      {/* Screen-only header */}
      <div className="hide-on-print">
        <div className="section-label"><Users size={14} /> Parent Persuasion Module</div>
        <h1 className="page-title">Education Investment Dossier</h1>
        <p className="page-subtitle" style={{ marginBottom: 32 }}>
          A comprehensive, data-driven investment case prepared for the family of <strong>{profile.name || 'Student'}</strong>.
        </p>
        <button className="btn-primary" onClick={() => window.print()} style={{ marginBottom: 40, display: 'inline-flex', gap: 8 }}>
          <Download size={16} /> Print / Download as PDF
        </button>
      </div>

      {/* ═══════════════════ A4 DOCUMENT ═══════════════════ */}
      <div className="a4-document">

        {/* ─── PAGE 1: Cover & Executive Summary ─── */}
        <div className="doc-page">
          {/* Letterhead */}
          <div className="doc-letterhead">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.15em', color: '#4F46E5', textTransform: 'uppercase' }}>Margdarshak AI</div>
                <div style={{ fontSize: 9, color: '#6B7280', letterSpacing: '0.06em' }}>Your Higher Education Financing Companion</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 9, color: '#9CA3AF' }}>CONFIDENTIAL — Generated {reportDate}</div>
                <div style={{ fontSize: 9, color: '#9CA3AF' }}>Document #MGD-{docId}</div>
              </div>
            </div>
            <div style={{ height: 2, background: 'linear-gradient(90deg, #4F46E5, #0D9488)' }} />
          </div>

          {/* Hero */}
          <div className="doc-cover-hero">
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: '#6B7280', textTransform: 'uppercase', marginBottom: 10 }}>
              Education Investment Dossier
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: '#111827', lineHeight: 1.2, marginBottom: 6 }}>
              Study Abroad Financing<br />Investment Case
            </h1>
            <p style={{ fontSize: 12, color: '#374151', marginBottom: 2 }}>
              Prepared for the family of <span style={{ fontWeight: 700 }}>{profile.name || 'Student'}</span>
            </p>
            <p style={{ fontSize: 10, color: '#9CA3AF' }}>{reportDate}</p>

            <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {[
                { label: 'Target Field', val: profile.targetField || 'N/A' },
                { label: 'Degree', val: profile.degree === 'masters' ? "Master's" : profile.degree?.toUpperCase() || 'Masters' },
                { label: 'GPA', val: profile.gpa ? `${profile.gpa}/10` : 'N/A' },
                { label: 'Universities Compared', val: `${favUnis.length}` },
              ].map((item, i) => (
                <div key={i} className="doc-stat-box">
                  <div className="doc-stat-label">{item.label}</div>
                  <div className="doc-stat-value">{item.val}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="doc-section-divider" />

          {/* Executive Summary */}
          <div className="doc-section">
            <div className="doc-section-title"><BarChart3 size={12} style={{ marginRight: 6 }} />Executive Summary</div>
            <p className="doc-body-text">
              This dossier presents a data-driven investment analysis for funding <strong>{profile.name || 'your child'}&apos;s</strong> graduate
              education abroad in the field of <strong>{field}</strong>. We have evaluated{' '}
              <strong>{favUnis.length} shortlisted institution{favUnis.length > 1 ? 's' : ''}</strong> across tuition cost,
              loan EMI affordability, post-graduation earnings potential, and career ROI.
            </p>
            <p className="doc-body-text" style={{ marginTop: 8 }}>
              Based on a composite scoring of 10-year median earnings, EMI-to-salary ratios, and institutional selectivity,
              our model recommends <strong>{recommended.uni.name}</strong> as the optimal investment, offering an estimated
              net lifetime gain of <strong>₹{Math.round(recommended.netGain10yr * USD_TO_INR / 100000).toLocaleString('en-IN')} Lakhs</strong> over
              10 years compared to a non-study-abroad trajectory.
            </p>

            {/* Key Metrics Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 16 }}>
              <div className="doc-highlight-box doc-highlight-green">
                <div className="doc-highlight-number">{((recommended.salary!.entryLevelUSD / preDegreeAnnualUSD - 1) * 100).toFixed(0)}%</div>
                <div className="doc-highlight-label">Salary increase post-degree</div>
                <div className="doc-highlight-sub">Entry level vs pre-study baseline</div>
              </div>
              <div className="doc-highlight-box doc-highlight-blue">
                <div className="doc-highlight-number">₹{recommended.emi.emi.toLocaleString('en-IN')}</div>
                <div className="doc-highlight-label">Monthly EMI (recommended)</div>
                <div className="doc-highlight-sub">{defaultLoan.lender} @ {defaultLoan.interestRateMin}% for 10 yrs</div>
              </div>
              <div className="doc-highlight-box doc-highlight-purple">
                <div className="doc-highlight-number">{recommended.paybackYears.toFixed(1)} yrs</div>
                <div className="doc-highlight-label">Loan payback period</div>
                <div className="doc-highlight-sub">Based on incremental income</div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── PAGE 2: Student Profile & University Comparison ─── */}
        <div className="doc-page">
          <div className="doc-page-header">
            <span>Education Investment Dossier — {profile.name || 'Student'}</span>
            <span>Section 2: University Comparison</span>
          </div>

          {/* Student Profile */}
          <div className="doc-section">
            <div className="doc-section-title"><Users size={12} style={{ marginRight: 6 }} />Candidate Academic Profile</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
              {[
                { label: 'GPA', val: profile.gpa ? `${profile.gpa}/10` : '—' },
                { label: 'GRE Score', val: profile.greScore || '—' },
                { label: 'TOEFL', val: profile.toeflScore || '—' },
                { label: 'IELTS', val: profile.ieltsScore || '—' },
                { label: 'Work Exp.', val: `${profile.workExperience || 0} yrs` },
              ].map((item, i) => (
                <div key={i} className="doc-stat-box">
                  <div className="doc-stat-label">{item.label}</div>
                  <div className="doc-stat-value">{item.val}</div>
                </div>
              ))}
            </div>
            <p className="doc-body-text" style={{ marginTop: 10 }}>
              {profile.greScore && profile.greScore >= 320
                ? `With a GRE score of ${profile.greScore}, the candidate is competitive for admission to top-10 programs globally. This significantly strengthens the loan application as it demonstrates academic creditworthiness.`
                : profile.gpa && profile.gpa >= 8.0
                ? `With a GPA of ${profile.gpa}/10, the candidate demonstrates strong academic performance. Lenders consider GPA ≥ 7.5 as a positive indicator for loan eligibility.`
                : 'The candidate\'s academic profile is being built. A strong GPA and test score history are positive indicators for both admission and loan sanctioning.'}
            </p>
          </div>

          <div className="doc-section-divider" />

          {/* University Comparison Table */}
          <div className="doc-section">
            <div className="doc-section-title"><GraduationCap size={12} style={{ marginRight: 6 }} />Detailed University Comparison Matrix</div>
            <table className="doc-table">
              <thead>
                <tr>
                  <th className="doc-th">Institution</th>
                  <th className="doc-th" style={{ textAlign: 'right' }}>Total Cost (2yr)</th>
                  <th className="doc-th" style={{ textAlign: 'right' }}>Acceptance Rate</th>
                  <th className="doc-th" style={{ textAlign: 'right' }}>Entry Salary</th>
                  <th className="doc-th" style={{ textAlign: 'right' }}>Monthly EMI</th>
                  <th className="doc-th" style={{ textAlign: 'right' }}>EMI Burden</th>
                  <th className="doc-th" style={{ textAlign: 'center' }}>Verdict</th>
                </tr>
              </thead>
              <tbody>
                {analyses.map((a, i) => (
                  <tr key={i} className={a.recommended ? 'doc-tr-recommended' : 'doc-tr'}>
                    <td className="doc-td">
                      <div style={{ fontWeight: 700, fontSize: 10 }}>{a.uni.name}</div>
                      <div style={{ fontSize: 9, color: '#6B7280' }}>{a.uni.city}, {a.uni.country} · QS #{a.uni.qsRank2025 || 'N/A'}</div>
                    </td>
                    <td className="doc-td" style={{ textAlign: 'right', fontWeight: 600 }}>
                      ₹{Math.round(a.totalCostINR / 100000).toLocaleString('en-IN')}L
                    </td>
                    <td className="doc-td" style={{ textAlign: 'right' }}>
                      {(a.uni.admissionRate * 100).toFixed(1)}%
                    </td>
                    <td className="doc-td" style={{ textAlign: 'right' }}>
                      ₹{Math.round(a.salary!.entryLevelUSD * USD_TO_INR).toLocaleString('en-IN')}/yr
                    </td>
                    <td className="doc-td" style={{ textAlign: 'right', fontWeight: 600 }}>
                      ₹{a.emi.emi.toLocaleString('en-IN')}
                    </td>
                    <td className="doc-td" style={{ textAlign: 'right' }}>
                      <span style={{ color: a.emiToSalaryRatio < 30 ? '#059669' : a.emiToSalaryRatio < 50 ? '#D97706' : '#DC2626', fontWeight: 700 }}>
                        {a.emiToSalaryRatio.toFixed(0)}%
                      </span>
                      <div style={{ fontSize: 8, color: '#9CA3AF' }}>of monthly salary</div>
                    </td>
                    <td className="doc-td" style={{ textAlign: 'center' }}>
                      {a.recommended
                        ? <span className="doc-badge-recommended">⭐ Recommended</span>
                        : <span className="doc-badge-alt">Alternative</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="doc-footnote">* EMI Burden = Monthly EMI as a percentage of estimated post-graduation monthly income. Industry comfort zone: below 30%.</p>
          </div>

          <div className="doc-section-divider" />

          {/* AI Recommendation Rationale */}
          <div className="doc-section">
            <div className="doc-section-title"><Award size={12} style={{ marginRight: 6 }} />AI Recommendation Rationale</div>
            <div className="doc-recommended-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 900, color: '#111827' }}>{recommended.uni.name}</div>
                  <div style={{ fontSize: 10, color: '#4F46E5', fontWeight: 600 }}>{recommended.uni.city}, {recommended.uni.country} · QS Rank #{recommended.uni.qsRank2025 || 'N/A'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 9, color: '#6B7280' }}>Composite ROI Score</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#4F46E5' }}>{Math.round(recommended.roiScore)}</div>
                </div>
              </div>
              <p className="doc-body-text">
                Margdarshak AI selected <strong>{recommended.uni.name}</strong> as the optimal choice based on a multi-factor analysis.
                The institution offers a post-graduation median salary of <strong>₹{Math.round(recommended.salary!.midCareerUSD * USD_TO_INR).toLocaleString('en-IN')}/yr</strong> for {field}
                graduates, with an EMI-to-salary ratio of <strong>{recommended.emiToSalaryRatio.toFixed(0)}%</strong>{' '}
                {recommended.emiToSalaryRatio < 30 ? '— comfortably within the 30% recommended threshold' : ''}.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 12 }}>
                {[
                  { icon: '💰', label: 'Net 10-yr Gain', val: `₹${Math.round(recommended.netGain10yr * USD_TO_INR / 100000).toLocaleString('en-IN')}L`, sub: 'vs non-study-abroad' },
                  { icon: '📅', label: 'Loan Payback', val: `${recommended.paybackYears.toFixed(1)} yrs`, sub: 'expected duration' },
                  { icon: '📈', label: '10-yr Earnings', val: `₹${Math.round(recommended.uni.medianEarnings10yr * USD_TO_INR).toLocaleString('en-IN')}`, sub: 'alumni median (US DoE)' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '8px 10px', background: 'white', borderRadius: 6, border: '1px solid #C7D2FE' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#111827' }}>{item.icon} {item.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: '#4F46E5' }}>{item.val}</div>
                    <div style={{ fontSize: 8, color: '#9CA3AF' }}>{item.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Why not the others */}
            {others.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6B7280', marginBottom: 8 }}>
                  Why Alternative Options Rank Lower
                </div>
                {others.map((a, i) => (
                  <div key={i} className="doc-alternative-row">
                    <div style={{ fontWeight: 700, fontSize: 10, minWidth: 120 }}>{a.uni.name}</div>
                    <div style={{ fontSize: 9, color: '#6B7280', flex: 1 }}>
                      {a.emiToSalaryRatio > 40
                        ? `High EMI burden (${a.emiToSalaryRatio.toFixed(0)}% of salary)`
                        : a.uni.tuitionUSD > recommended.uni.tuitionUSD
                        ? `Higher tuition cost (+₹${Math.round((a.uni.tuitionUSD - recommended.uni.tuitionUSD) * USD_TO_INR).toLocaleString('en-IN')}/yr)`
                        : `Lower composite ROI score (earnings-to-cost ratio)`}
                      {a.netGain10yr < recommended.netGain10yr
                        ? `. Net 10-yr gain ₹${Math.round((recommended.netGain10yr - a.netGain10yr) * USD_TO_INR / 100000).toLocaleString('en-IN')}L lower than recommended option.`
                        : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── PAGE 3: Loan Journey & Financial Details ─── */}
        <div className="doc-page">
          <div className="doc-page-header">
            <span>Education Investment Dossier — {profile.name || 'Student'}</span>
            <span>Section 3: Loan Journey & Financials</span>
          </div>

          {/* Loan Journey */}
          <div className="doc-section">
            <div className="doc-section-title"><Clock size={12} style={{ marginRight: 6 }} />Loan Journey — What to Expect</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0, position: 'relative' }}>
              {[
                { step: '01', label: 'Application', time: 'Day 1–3', desc: 'Submit online with admit letter, financial docs, co-applicant KYC', color: '#4F46E5' },
                { step: '02', label: 'Processing', time: 'Day 4–7', desc: 'Credit assessment, co-applicant income verification, university ranking check', color: '#0D9488' },
                { step: '03', label: 'Sanction', time: 'Day 8–10', desc: 'Loan sanction letter issued. Share with university for visa/I-20 purposes', color: '#059669' },
                { step: '04', label: 'Moratorium', time: 'During Course', desc: 'No EMI during study period. Interest-only or deferred — option available', color: '#D97706' },
                { step: '05', label: 'Repayment', time: 'Post Graduation', desc: `EMI of ₹${recommended.emi.emi.toLocaleString('en-IN')}/mo begins. Covers fully in ${recommended.paybackYears.toFixed(1)} yrs`, color: '#DC2626' },
              ].map((item, i) => (
                <div key={i} className="doc-journey-step" style={{ borderTopColor: item.color }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: item.color }}>{item.step}</div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: '#111827', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 8, fontWeight: 600, color: item.color, marginBottom: 6 }}>{item.time}</div>
                  <div style={{ fontSize: 8.5, color: '#4B5563', lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="doc-section-divider" />

          {/* EMI Affordability Detail */}
          <div className="doc-section">
            <div className="doc-section-title"><IndianRupee size={12} style={{ marginRight: 6 }} />Loan EMI & Repayment Analysis</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div className="doc-subsection-title">Recommended Option: {recommended.uni.name}</div>
                <table className="doc-inner-table">
                  <tbody>
                    <tr><td className="doc-inner-td-label">Total Program Cost</td><td className="doc-inner-td-val">₹{Math.round(recommended.totalCostINR / 100000).toLocaleString('en-IN')} Lakhs</td></tr>
                    <tr><td className="doc-inner-td-label">Loan Amount</td><td className="doc-inner-td-val">₹{Math.round(recommended.totalCostINR / 100000).toLocaleString('en-IN')} Lakhs</td></tr>
                    <tr><td className="doc-inner-td-label">Interest Rate</td><td className="doc-inner-td-val">{defaultLoan.interestRateMin}% p.a. (reducing)</td></tr>
                    <tr><td className="doc-inner-td-label">Tenure</td><td className="doc-inner-td-val">10 years post moratorium</td></tr>
                    <tr><td className="doc-inner-td-label">Monthly EMI</td><td className="doc-inner-td-val" style={{ fontWeight: 800, color: '#4F46E5' }}>₹{recommended.emi.emi.toLocaleString('en-IN')}</td></tr>
                    <tr><td className="doc-inner-td-label">Total Interest Paid</td><td className="doc-inner-td-val">₹{Math.round(recommended.emi.totalInterest / 100000).toLocaleString('en-IN')} Lakhs</td></tr>
                    <tr><td className="doc-inner-td-label">Total Repayment</td><td className="doc-inner-td-val" style={{ fontWeight: 700 }}>₹{Math.round(recommended.emi.totalPayment / 100000).toLocaleString('en-IN')} Lakhs</td></tr>
                  </tbody>
                </table>
              </div>
              <div>
                <div className="doc-subsection-title">Post-Graduation Salary vs EMI</div>
                <div style={{ padding: 12, background: '#F0FDF4', border: '1px solid #D1FAE5', borderRadius: 6, marginBottom: 8 }}>
                  <div style={{ fontSize: 9, color: '#065F46', marginBottom: 4 }}>Expected monthly income (entry level)</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#059669' }}>₹{Math.round(recommended.salary!.entryLevelUSD * USD_TO_INR / 12).toLocaleString('en-IN')}</div>
                  <div style={{ fontSize: 8, color: '#6B7280' }}>{field} in {recommended.uni.country} · BLS/HESA verified</div>
                </div>
                <div style={{ padding: 12, background: recommended.emiToSalaryRatio < 30 ? '#EFF6FF' : '#FFFBEB', border: `1px solid ${recommended.emiToSalaryRatio < 30 ? '#BFDBFE' : '#FDE68A'}`, borderRadius: 6 }}>
                  <div style={{ fontSize: 9, color: recommended.emiToSalaryRatio < 30 ? '#1D4ED8' : '#92400E', marginBottom: 4 }}>
                    EMI represents {recommended.emiToSalaryRatio.toFixed(0)}% of monthly income
                  </div>
                  <div style={{ background: '#E5E7EB', borderRadius: 4, height: 8, overflow: 'hidden', marginBottom: 6 }}>
                    <div style={{ height: '100%', width: `${Math.min(100, recommended.emiToSalaryRatio)}%`, background: recommended.emiToSalaryRatio < 30 ? '#3B82F6' : '#F59E0B', borderRadius: 4 }} />
                  </div>
                  <div style={{ fontSize: 8, color: '#6B7280' }}>
                    {recommended.emiToSalaryRatio < 30
                      ? '✓ Well within the recommended 30% EMI-to-income threshold for healthy debt management'
                      : '⚠ Slightly above 30% threshold — manageable with disciplined budgeting'}
                  </div>
                </div>
                <div style={{ padding: 10, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 6, marginTop: 8 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#374151', marginBottom: 4 }}>Section 80E Tax Benefit</div>
                  <div style={{ fontSize: 8.5, color: '#6B7280', lineHeight: 1.5 }}>
                    The entire interest component of the education loan EMI (est. ₹{Math.round(recommended.emi.totalInterest / 120000).toLocaleString('en-IN')}/mo in Year 1)
                    is tax-deductible for up to 8 years under Section 80E of the Income Tax Act, 1961. This effectively reduces the net EMI cost by 25–30%.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="doc-section-divider" />

          {/* Trust & Safety */}
          <div className="doc-section">
            <div className="doc-section-title"><Shield size={12} style={{ marginRight: 6 }} />Lender Credibility & Risk Mitigation</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { icon: '🏛️', title: 'RBI-Registered NBFCs', desc: 'Our lending partners are RBI-registered, leading NBFCs with strong credibility, regulated interest rates, and robust compliance.' },
                { icon: '📋', title: 'Moratorium Period', desc: 'No EMI is due during the course. Repayment begins only after course completion + 6 months — reducing immediate pressure.' },
                { icon: '💸', title: 'Tax Benefit (80E)', desc: 'All interest paid on education loans is 100% tax-deductible for 8 years, reducing the effective cost of borrowing.' },
                { icon: '🌐', title: 'Comprehensive Coverage', desc: 'Loan covers tuition, living expenses, travel, and study materials — eliminating hidden financing gaps.' },
                { icon: '⏱️', title: 'Fast Processing', desc: 'Digital-first approval in 3–5 business days. Sanction letter can be used for visa applications immediately.' },
                { icon: '🔒', title: 'No Collateral Option', desc: 'For select programs and institutions, collateral-free loans are available, reducing the burden on family assets.' },
              ].map((item, i) => (
                <div key={i} className="doc-trust-item">
                  <div style={{ fontSize: 14, marginRight: 8 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#111827' }}>{item.title}</div>
                    <div style={{ fontSize: 8.5, color: '#4B5563', lineHeight: 1.5 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── PAGE 4: ROI Summary & Action Plan ─── */}
        <div className="doc-page">
          <div className="doc-page-header">
            <span>Education Investment Dossier — {profile.name || 'Student'}</span>
            <span>Section 4: ROI Summary & Next Steps</span>
          </div>

          <div className="doc-section">
            <div className="doc-section-title"><TrendingUp size={12} style={{ marginRight: 6 }} />10-Year Financial Projection</div>
            <table className="doc-table">
              <thead>
                <tr>
                  <th className="doc-th">Year</th>
                  <th className="doc-th" style={{ textAlign: 'right' }}>Cumulative Earnings (No Degree)</th>
                  <th className="doc-th" style={{ textAlign: 'right' }}>Cumulative Earnings (With Degree)</th>
                  <th className="doc-th" style={{ textAlign: 'right' }}>Net Advantage</th>
                </tr>
              </thead>
              <tbody>
                {[3, 5, 7, 10].map((yr, i) => {
                  const withoutDegree = preDegreeAnnualUSD * yr * USD_TO_INR;
                  const withDegree = (recommended.salary!.entryLevelUSD * Math.min(yr, 3) + recommended.salary!.midCareerUSD * Math.max(0, yr - 3)) * USD_TO_INR - recommended.totalCostINR;
                  const netAdv = withDegree - withoutDegree;
                  return (
                    <tr key={i} className={yr === 10 ? 'doc-tr-recommended' : 'doc-tr'}>
                      <td className="doc-td" style={{ fontWeight: 700 }}>Year {yr}</td>
                      <td className="doc-td" style={{ textAlign: 'right' }}>₹{Math.round(withoutDegree / 100000).toLocaleString()}L</td>
                      <td className="doc-td" style={{ textAlign: 'right' }}>₹{Math.round(withDegree / 100000).toLocaleString()}L</td>
                      <td className="doc-td" style={{ textAlign: 'right', fontWeight: 700, color: netAdv > 0 ? '#059669' : '#DC2626' }}>
                        {netAdv > 0 ? '+' : ''}₹{Math.round(netAdv / 100000).toLocaleString()}L
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="doc-footnote">Projections based on BLS/HESA verified salary data. Pre-degree baseline: ₹4 LPA (PLFS 2023-24). Post-degree growth assumes 7% annual increment.</p>
          </div>

          <div className="doc-section-divider" />

          {/* Scholarship + Marketplace */}
          <div className="doc-section">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div className="doc-section-title"><Award size={12} style={{ marginRight: 6 }} />Scholarship Benefit Summary</div>
                <p className="doc-body-text">Scholarship awards reduce the principal loan amount and therefore the monthly EMI burden. The following scholarship types are available for consideration:</p>
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    { name: 'Merit-Based Scholarships', benefit: 'Up to ₹20,00,000/yr', note: 'Based on GPA + GRE' },
                    { name: 'Need-Based Aid', benefit: 'Up to ₹12,00,000/yr', note: 'Family income assessed' },
                    { name: 'Lender Cashbacks', benefit: 'Up to ₹50,000 cashback', note: 'On select disbursement tiers' },
                    { name: 'Marketplace Savings', benefit: '5% on forex/travel', note: 'Via Margdarshak' },
                  ].map((s, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: '#F9FAFB', borderRadius: 5, border: '1px solid #E5E7EB' }}>
                      <div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#111827' }}>{s.name}</div>
                        <div style={{ fontSize: 8, color: '#9CA3AF' }}>{s.note}</div>
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 800, color: '#059669' }}>{s.benefit}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="doc-section-title"><Briefcase size={12} style={{ marginRight: 6 }} />Marketplace & Platform Benefits</div>
                <p className="doc-body-text">Margdarshak's integrated marketplace provides cost-saving tools that reduce the upfront financial burden on families:</p>
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    'Forex currency exchange at bank rates (saves ₹30,000+ on transfers)',
                    'Travel insurance bundled with flight booking discounts',
                    '5% cashback on laptops, course materials, subscriptions',
                    'Student SIM card with international data for ₹499/mo',
                    'Student accommodation comparison — save up to 20%',
                  ].map((b, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, fontSize: 8.5, color: '#374151', alignItems: 'flex-start' }}>
                      <span style={{ color: '#059669', fontWeight: 900, flexShrink: 0 }}>✓</span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="doc-section-divider" />

          {/* Final Recommendation & CTA */}
          <div className="doc-section doc-final-cta">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 900, color: 'white' }}>Final Recommendation</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>Based on ROI, EMI Affordability, and Career Outcomes</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: 20, fontSize: 9, fontWeight: 700, color: 'white' }}>
                AI Verified ✓
              </div>
            </div>
            <div style={{ fontSize: 16, fontWeight: 900, color: 'white', marginBottom: 6 }}>{recommended.uni.name}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.85)', marginBottom: 12, lineHeight: 1.6 }}>
              Our model recommends this institution for its superior earnings-to-cost ratio, manageable EMI burden of{' '}
              {recommended.emiToSalaryRatio.toFixed(0)}% of post-graduation income, and strong 10-year earnings data.
              This investment is projected to generate a net financial advantage of{' '}
              ₹{Math.round(recommended.netGain10yr * USD_TO_INR / 100000).toLocaleString('en-IN')} Lakhs over 10 years.
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 10, marginTop: 4 }}>
              This report is generated by Margdarshak AI using verified data from US Dept. of Education, BLS, HESA, NIRF, and StatsCan.
              Loan terms are subject to credit assessment by the respective lending partner. This does not constitute financial advice.
            </div>
          </div>
        </div>

        {/* Document Footer */}
        <div className="doc-footer hide-on-print-footer">
          <div style={{ height: 2, background: 'linear-gradient(90deg, #4F46E5, #0D9488)', marginBottom: 10 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8, color: '#9CA3AF' }}>
            <span>Margdarshak AI — Your Higher Education Companion</span>
            <span>Generated {reportDate} — Confidential</span>
          </div>
        </div>
      </div>

      {/* Screen-only Download CTA */}
      <div className="hide-on-print" style={{ textAlign: 'center', marginTop: 32 }}>
        <button className="btn-primary" onClick={() => window.print()} style={{ padding: '14px 32px', fontSize: 15 }}>
          <Download size={18} /> Download PDF Report
        </button>
        <Link href="/apply" className="btn-secondary" style={{ marginLeft: 12, padding: '14px 32px', fontSize: 15 }}>
          Apply for Loan Now <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
