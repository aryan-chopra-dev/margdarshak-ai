'use client';
import { useAppStore } from '@/lib/store';
import { universities } from '@/data/universities';
import { calculateEMI } from '@/data/loans';
import { 
  Building2, Calendar, CheckCircle2, ChevronRight, 
  Circle, Clock, CreditCard, PlaneTakeoff, 
  Receipt, ShieldCheck, IndianRupee, AlertCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';

const USD_TO_INR = 83;

export default function RepaymentDashboardPage() {
  const { profile } = useAppStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => { setMounted(true); }, []);

  const topUni = universities.find(u => profile.shortlistedUniversities?.includes(u.id)) || universities[0];
  const uniCountry = topUni.country;

  // Loan principal = Tuition + Living Costs across program duration
  // Uses the same per-country living cost lookup as the ROI Calculator for consistency
  const livingCostPerYear = uniCountry === 'United States' ? 20000 :
    uniCountry === 'United Kingdom' ? 18000 :
    uniCountry === 'Canada' ? 15000 :
    uniCountry === 'Germany' ? 12000 :
    uniCountry === 'India' ? 3000 : 16000;
  const programYears = uniCountry === 'United Kingdom' ? 1 : 2;
  const totalCostUSD = (topUni.tuitionUSD + livingCostPerYear) * programYears;
  const principal = totalCostUSD * USD_TO_INR;

  // Poonawala Fincorp default loan terms
  const LOAN_RATE = 11.25; // % p.a.
  const LOAN_TENURE = 10;  // years
  const emiData = calculateEMI(principal, LOAN_RATE, LOAN_TENURE);

  const emiStart = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 2.5); // 2.5 years from now
  const nextDisbursement = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days from now

  if (!mounted) return null;

  return (
    <div className="page-container">
      <div className="section-label"><ShieldCheck size={14} /> Active Application Phase</div>
      <h1 className="page-title">Post-Sanction Dashboard</h1>
      <p className="page-subtitle" style={{ marginBottom: 40 }}>
        Manage your Poonawala Fincorp loan disbursement, track your pre-departure checklist, and monitor your upcoming repayment schedule.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 2fr) minmax(300px, 1fr)', gap: 24 }}>
        
        {/* Left Column: Loan Status & Checklists */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Hero Status Card */}
          <div className="card-static" style={{ 
            background: 'var(--primary)', color: 'white', padding: 32,
            backgroundImage: 'linear-gradient(135deg, var(--primary) 0%, #4338CA 100%)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, padding: '4px 10px', background: 'rgba(255,255,255,0.2)', borderRadius: 20 }}>
                  Active Moratorium
                </span>
                <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 16 }}>Loan ID: #PF-8842-991</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, opacity: 0.9 }}>
                  <Building2 size={16} />
                  <span style={{ fontSize: 14 }}>{topUni.name}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, opacity: 0.9 }}>Total Sanctioned</div>
                <div style={{ fontSize: 28, fontWeight: 900 }}>₹{(principal / 100000).toFixed(1)}L</div>
              </div>
            </div>

            <div style={{ padding: 16, background: 'rgba(255,255,255,0.1)', borderRadius: 12, display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Next Disbursement</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>{nextDisbursement.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>Amount</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>₹{Math.round(principal * 0.4).toLocaleString('en-IN')}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>To</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>University Bursar</div>
              </div>
            </div>
          </div>

          {/* Visa & Departure Checklist */}
          <div className="card-static" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <PlaneTakeoff size={20} color="var(--primary)" /> Pre-Departure Journey
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { title: 'Loan Sanction Letter Printed', date: 'Done', status: 'done' },
                { title: 'University I-20 / CAS Received', date: 'Done', status: 'done' },
                { title: 'Visa Appointment Scheduled', date: 'Upcoming: 12th May', status: 'current' },
                { title: 'Proof of Funds (Blocked Account / Solvency)', date: 'Action needed', status: 'pending' },
                { title: 'Forex Card Activation', date: 'Pending', status: 'pending' },
              ].map((step, i, arr) => (
                <div key={i} style={{ display: 'flex', gap: 16, position: 'relative' }}>
                  {/* Timeline connector */}
                  {i !== arr.length - 1 && (
                    <div style={{ position: 'absolute', left: 11, top: 24, bottom: -8, width: 2, background: step.status === 'done' ? 'var(--primary)' : 'var(--border)' }} />
                  )}
                  
                  <div style={{ marginTop: 2 }}>
                    {step.status === 'done' ? <CheckCircle2 size={24} color="var(--primary)" fill="var(--primary-bg)" /> :
                     step.status === 'current' ? <AlertCircle size={24} color="#F59E0B" fill="#FEF3C7" /> :
                     <Circle size={24} color="var(--text-muted)" />}
                  </div>
                  
                  <div style={{ paddingBottom: 24 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: step.status === 'pending' ? 'var(--text-secondary)' : 'var(--text)' }}>
                      {step.title}
                    </div>
                    <div style={{ fontSize: 13, color: step.status === 'current' ? '#D97706' : 'var(--text-muted)', marginTop: 4 }}>
                      {step.date}
                    </div>
                  </div>
                  
                  {step.status === 'current' && (
                    <div style={{ marginLeft: 'auto' }}>
                      <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: 12 }}>Manage</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: EMI Tracker */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <div className="card-static" style={{ padding: 24 }}>
             <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
               <Calendar size={20} color="#059669" /> EMI Schedule
             </h3>

             <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px', background: '#F0FDF4', borderRadius: 12, border: '1px solid #BBF7D0', marginBottom: 24 }}>
                <div style={{ width: 48, height: 48, background: '#059669', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={24} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#065F46', textTransform: 'uppercase', letterSpacing: 0.5 }}>Grace Period</div>
                  <div style={{ fontSize: 14, color: '#064E3B', marginTop: 2 }}>Payments begin {emiStart.toLocaleDateString('en-IN', { month: 'short', year: 'numeric'})}</div>
                </div>
             </div>

             <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 16 }}>Projected Schedule (Post-Study)</h4>
             <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[1, 2, 3].map(month => {
                  const date = new Date(emiStart);
                  date.setMonth(date.getMonth() + month);
                  return (
                    <div key={month} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ background: 'var(--bg-elevated)', padding: '8px 12px', borderRadius: 8, textAlign: 'center' }}>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{date.toLocaleDateString('en-IN', { month: 'short' })}</div>
                          <div style={{ fontSize: 15, fontWeight: 800 }}>{date.getDate()}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>EMI Payment #{month}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Auto-debit scheduled</div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 700 }}>
                        ₹{(emiData.emi).toLocaleString('en-IN')}
                      </div>
                    </div>
                  );
                })}
             </div>

             <button style={{ width: '100%', padding: '14px', marginTop: 24, background: 'var(--bg-elevated)', border: '1px dashed var(--border)', borderRadius: 8, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Receipt size={16} /> View Full Amortization Schedule
             </button>
          </div>

          <div className="card-static" style={{ padding: 24, background: '#F8FAFC' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ background: '#E0E7FF', padding: 8, borderRadius: 8 }}><CreditCard size={20} color="#4338CA" /></div>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Section 80E Tax Cert</h3>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 16 }}>
              Your interest certificate for claiming tax deductions under Section 80E will be generated automatically at the end of the financial year.
            </p>
            <button className="btn btn-secondary" style={{ width: '100%', fontSize: 13 }} disabled>
              Generate Certificate (FY 26-27)
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
