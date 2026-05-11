'use client';
import { useAppStore } from '@/lib/store';
import { universities } from '@/data/universities';
import { loanProducts, calculateEMI, generateRepaymentSchedule } from '@/data/loans';
import Link from 'next/link';
import {
  Building2, Calendar, CheckCircle2,
  Circle, Clock, CreditCard, PlaneTakeoff,
  Receipt, ShieldCheck, IndianRupee, AlertCircle,
  ArrowRight, X, Stamp
} from 'lucide-react';
import { useState, useEffect } from 'react';

const USD_TO_INR = 83;

export default function RepaymentDashboardPage() {
  const { profile, loanApplication } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [showAmortization, setShowAmortization] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  // === GATE: redirect users who haven't applied yet ===
  if (!loanApplication?.submitted) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: 160 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', margin: '0 auto 24px',
          background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <CreditCard size={40} color="var(--text-muted)" />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 12 }}>No Active Loan Application</h1>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 440, margin: '0 auto 32px', lineHeight: 1.6 }}>
          Once you submit a loan application, your Post-Sanction Dashboard will appear here with your repayment schedule, disbursement tracker, and pre-departure checklist.
        </p>
        <Link href="/apply" className="btn-primary" style={{ padding: '14px 32px', fontSize: 15 }}>
          Apply for Education Loan <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  // === Derive all values from the persisted loanApplication ===
  const topUni = universities.find(u => profile.shortlistedUniversities?.includes(u.id))
    || universities.find(u => u.name === loanApplication.universityName)
    || universities[0];
  const uniCountry = topUni.country;
  const programYears = uniCountry === 'United Kingdom' ? 1 : 2;

  const lender = loanProducts.find(l => l.id === loanApplication.lenderId) || loanProducts[0];
  const principal = loanApplication.principalINR;
  const emiData = calculateEMI(principal, lender.interestRateMin, lender.maxTenureYears);

  // Anchor all dates to submittedAt, not Date.now()
  const submittedAt = new Date(loanApplication.submittedAt);

  // Disbursement: first tranche 30 days after submission
  const nextDisbursement = new Date(submittedAt);
  nextDisbursement.setDate(nextDisbursement.getDate() + 30);

  // Disbursement amount: 50% at enrollment, 50% at year 2 (100% for 1-year programs)
  const trancheAmount = programYears === 1 ? principal : Math.round(principal * 0.5);

  // EMI start: submittedAt + programYears + moratoriumMonths
  const emiStart = new Date(submittedAt);
  emiStart.setMonth(emiStart.getMonth() + programYears * 12 + lender.moratoriumMonths);

  // FY for 80E: determine financial year of EMI start
  const fy = emiStart.getMonth() >= 3  // April = month 3
    ? `${emiStart.getFullYear()}-${String(emiStart.getFullYear() + 1).slice(2)}`
    : `${emiStart.getFullYear() - 1}-${String(emiStart.getFullYear()).slice(2)}`;

  // Visa appointment: 60 days after submission (typical slot booking timeline)
  const visaApptDate = new Date(submittedAt);
  visaApptDate.setDate(visaApptDate.getDate() + 60);
  const visaApptStr = visaApptDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });

  // Pre-departure checklist: dynamically determine status relative to today
  const today = new Date();
  const loanSanctionDone = true; // submitting = sanction pending, but letter is issued same day
  const i20Done = today >= new Date(submittedAt.getTime() + 14 * 24 * 60 * 60 * 1000); // 2 weeks out
  const visaApptPassed = today >= visaApptDate;

  const checklistSteps = [
    {
      title: 'Loan Sanction Letter Issued',
      date: submittedAt.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      status: 'done' as const,
    },
    {
      title: `University ${uniCountry === 'United States' ? 'I-20' : 'CAS / Offer Letter'} Received`,
      date: i20Done ? 'Done' : 'Awaiting from university',
      status: i20Done ? 'done' as const : 'current' as const,
    },
    {
      title: 'Visa Appointment Scheduled',
      date: visaApptPassed ? 'Done' : `Upcoming: ${visaApptStr}`,
      status: visaApptPassed ? 'done' as const : 'current' as const,
      link: '/visa',
    },
    {
      title: uniCountry === 'Germany'
        ? 'Blocked Account (Sperrkonto) Funded'
        : uniCountry === 'Canada'
        ? 'GIC Account Funded'
        : 'Proof of Funds Submitted to Embassy',
      date: 'Action needed',
      status: 'pending' as const,
    },
    {
      title: 'Forex Card Activation & Travel Insurance',
      date: 'Pending',
      status: 'pending' as const,
    },
  ];

  // Amortization schedule
  const schedule = generateRepaymentSchedule(principal, lender.interestRateMin, lender.maxTenureYears);

  return (
    <div className="page-container">
      <div className="section-label"><ShieldCheck size={14} /> Active Application Phase</div>
      <h1 className="page-title">Post-Sanction Dashboard</h1>
      <p className="page-subtitle" style={{ marginBottom: 40 }}>
        Manage your {lender.lender} loan disbursement, track your pre-departure checklist, and monitor your upcoming repayment schedule.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 2fr) minmax(300px, 1fr)', gap: 24 }}>

        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Hero Status Card */}
          <div className="card-static" style={{
            background: 'var(--primary)', color: 'white', padding: 32,
            backgroundImage: 'linear-gradient(135deg, var(--primary) 0%, #4338CA 100%)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, padding: '4px 10px', background: 'rgba(255,255,255,0.2)', borderRadius: 20 }}>
                  🟢 Moratorium Active — EMIs begin {emiStart.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </span>
                <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 16 }}>
                  Ref: #{loanApplication.referenceId}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, opacity: 0.9 }}>
                  <Building2 size={16} />
                  <span style={{ fontSize: 14 }}>{loanApplication.universityName}</span>
                </div>
                <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>{lender.lender} · {lender.interestRateMin}% p.a. · {lender.maxTenureYears}-year tenure</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, opacity: 0.9 }}>Total Sanctioned</div>
                <div style={{ fontSize: 28, fontWeight: 900 }}>₹{(principal / 100000).toFixed(1)}L</div>
              </div>
            </div>

            <div style={{ padding: 16, background: 'rgba(255,255,255,0.1)', borderRadius: 12, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Next Disbursement</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>
                  {nextDisbursement.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Amount (Tranche {programYears === 1 ? '1/1' : '1/2'})</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>₹{trancheAmount.toLocaleString('en-IN')}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>To</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>University Bursar</div>
              </div>
            </div>
          </div>

          {/* Pre-Departure Checklist */}
          <div className="card-static" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <PlaneTakeoff size={20} color="var(--primary)" /> Pre-Departure Journey
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {checklistSteps.map((step, i, arr) => (
                <div key={i} style={{ display: 'flex', gap: 16, position: 'relative' }}>
                  {i !== arr.length - 1 && (
                    <div style={{
                      position: 'absolute', left: 11, top: 24, bottom: -8, width: 2,
                      background: step.status === 'done' ? 'var(--primary)' : 'var(--border)'
                    }} />
                  )}
                  <div style={{ marginTop: 2 }}>
                    {step.status === 'done'
                      ? <CheckCircle2 size={24} color="var(--primary)" fill="var(--primary-bg)" />
                      : step.status === 'current'
                      ? <AlertCircle size={24} color="#F59E0B" fill="#FEF3C7" />
                      : <Circle size={24} color="var(--text-muted)" />}
                  </div>
                  <div style={{ paddingBottom: 24, flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: step.status === 'pending' ? 'var(--text-secondary)' : 'var(--text)' }}>
                      {step.title}
                    </div>
                    <div style={{ fontSize: 13, color: step.status === 'current' ? '#D97706' : 'var(--text-muted)', marginTop: 4 }}>
                      {step.date}
                    </div>
                  </div>
                  {step.status === 'current' && (
                    <div style={{ marginLeft: 'auto', paddingBottom: 24 }}>
                      {step.link
                        ? <Link href={step.link} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12, textDecoration: 'none' }}>
                            <Stamp size={12} /> View Guide
                          </Link>
                        : <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>Manage</button>
                      }
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* EMI Schedule */}
          <div className="card-static" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={20} color="#059669" /> EMI Schedule
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px', background: '#F0FDF4', borderRadius: 12, border: '1px solid #BBF7D0', marginBottom: 24 }}>
              <div style={{ width: 48, height: 48, background: '#059669', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={24} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#065F46', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {lender.moratoriumMonths}-Month Moratorium ({programYears}-yr program)
                </div>
                <div style={{ fontSize: 14, color: '#064E3B', marginTop: 2 }}>
                  Payments begin {emiStart.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>

            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 16 }}>Projected Schedule (Post-Study)</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1, 2, 3].map(month => {
                const date = new Date(emiStart);
                date.setMonth(date.getMonth() + month - 1);
                return (
                  <div key={month} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ background: 'var(--bg-elevated)', padding: '8px 12px', borderRadius: 8, textAlign: 'center', minWidth: 48 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{date.toLocaleDateString('en-IN', { month: 'short' })}</div>
                        <div style={{ fontSize: 15, fontWeight: 800 }}>{date.getDate()}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{date.getFullYear()}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>EMI Payment #{month}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Auto-debit via {lender.lender}</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 700 }}>₹{emiData.emi.toLocaleString('en-IN')}</div>
                  </div>
                );
              })}
            </div>

            {/* Summary row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 16, padding: 12, background: 'var(--bg-elevated)', borderRadius: 8 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Monthly EMI</div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>₹{emiData.emi.toLocaleString('en-IN')}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total Payable</div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>₹{(emiData.totalPayment / 100000).toFixed(1)}L</div>
              </div>
            </div>

            <button
              onClick={() => setShowAmortization(true)}
              style={{
                width: '100%', padding: '14px', marginTop: 16,
                background: 'var(--bg-elevated)', border: '1px dashed var(--border)',
                borderRadius: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}
            >
              <Receipt size={16} /> View Full Amortization Schedule
            </button>
          </div>

          {/* Section 80E */}
          <div className="card-static" style={{ padding: 24, background: 'var(--bg-elevated)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ background: '#E0E7FF', padding: 8, borderRadius: 8 }}><IndianRupee size={20} color="#4338CA" /></div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Section 80E Tax Certificate</h3>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 8 }}>
              All interest paid on this loan is deductible under Section 80E — no upper limit, for up to 8 consecutive assessment years.
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
              📅 Certificate for <strong>FY {fy}</strong> will auto-generate at year end (April {emiStart.getFullYear() >= new Date().getFullYear() ? emiStart.getFullYear() + 1 : new Date().getFullYear() + 1}).
            </p>
            <button className="btn btn-secondary" style={{ width: '100%', fontSize: 13 }} disabled>
              Certificate Available From April {emiStart.getFullYear() >= new Date().getFullYear() ? emiStart.getFullYear() + 1 : new Date().getFullYear() + 1}
            </button>
          </div>
        </div>
      </div>

      {/* Amortization Modal */}
      {showAmortization && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
        }} onClick={() => setShowAmortization(false)}>
          <div style={{
            background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
            width: '100%', maxWidth: 720, maxHeight: '80vh',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 800 }}>Full Amortization Schedule</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  ₹{(principal / 100000).toFixed(1)}L · {lender.interestRateMin}% p.a. · {lender.maxTenureYears} years
                </p>
              </div>
              <button onClick={() => setShowAmortization(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-elevated)' }}>
                  <tr>
                    {['Year', 'Opening Balance', 'Principal Paid', 'Interest Paid', 'Closing Balance'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'var(--bg-elevated)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>{row.year}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>₹{Math.round(row.openingBalance).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--success)', fontWeight: 600 }}>₹{Math.round(row.principalPaid).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#EF4444' }}>₹{Math.round(row.interestPaid).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700 }}>₹{Math.round(row.closingBalance).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: 'var(--primary-bg)', borderTop: '2px solid var(--primary-border)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 800, textAlign: 'right' }}>Total</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>—</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--success)', fontWeight: 800 }}>₹{(principal / 100000).toFixed(1)}L</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', color: '#EF4444', fontWeight: 800 }}>₹{(emiData.totalInterest / 100000).toFixed(1)}L</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800 }}>₹0</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
