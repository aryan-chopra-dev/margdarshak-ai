'use client';
import { useAppStore } from '@/lib/store';
import { universities } from '@/data/universities';
import { CheckCircle2, XCircle, ArrowRight, TrendingDown, IndianRupee, Landmark, Compass, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const lenders = [
  {
    id: 'poonawala',
    name: 'Poonawala Fincorp',
    type: 'Premium NBFC',
    icon: <Compass color="var(--primary)" size={24} />,
    color: 'var(--primary)',
    maxLimit: '₹1 Crore',
    apr: '11.25%',
    collateral: 'Zero Collateral Required',
    moratorium: 'Course + 6 Months',
    processingFee: '1% + GST',
    approvalTime: '3-5 Days',
    minLRS: 450, // Highly accessible
  },
  {
    id: 'hdfc',
    name: 'HDFC Credila',
    type: 'NBFC',
    icon: <Landmark color="#1d4ed8" size={24} />,
    color: '#1d4ed8',
    maxLimit: '₹60 Lakhs',
    apr: '11.75%',
    collateral: 'Required for > ₹40L',
    moratorium: 'Course + 6 Months',
    processingFee: '1.25% + GST',
    approvalTime: '7-10 Days',
    minLRS: 600,
  },
  {
    id: 'sbi',
    name: 'SBI Scholar',
    type: 'Public Sector Bank',
    icon: <Landmark color="#047857" size={24} />,
    color: '#047857',
    maxLimit: '₹40 Lakhs',
    apr: '9.50%', // Lower interest
    collateral: 'Required for > ₹7.5L', // High collateral demand
    moratorium: 'Course + 1 Year',
    processingFee: '₹10,000 Flat',
    approvalTime: '15-21 Days',
    minLRS: 650, // Rigorous cutoff
  },
  {
    id: 'avanse',
    name: 'Avanse Financial',
    type: 'NBFC',
    icon: <ShieldCheck color="#ea580c" size={24} />,
    color: '#ea580c',
    maxLimit: '₹50 Lakhs',
    apr: '12.50%',
    collateral: 'Required for > ₹30L',
    moratorium: 'Course duration only',
    processingFee: '1.5% + GST',
    approvalTime: '5-7 Days',
    minLRS: 500,
  }
];

export default function MarketplacePage() {
  const { profile, lrs } = useAppStore();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => { setMounted(true); }, []);

  const topUni = universities.find(u => profile.shortlistedUniversities?.includes(u.id)) || universities[0];
  const USD_TO_INR = 83;
  const targetLoanAmount = topUni.tuitionUSD * 2 * USD_TO_INR; // 2 years tuition roughly

  if (!mounted) return null;

  return (
    <div className="page-container">
      <div className="section-label"><IndianRupee size={14} /> Dynamic Loan Marketplace</div>
      <h1 className="page-title">Marketplace Comparison</h1>
      <p className="page-subtitle" style={{ marginBottom: 40 }}>
        An algorithmically ranked comparison of lender offerings based on your current Loan Readiness Score ({lrs.score}) and target tuition constraint (₹{(targetLoanAmount / 100000).toFixed(1)}L).
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {lenders.map(lender => {
          const isEligible = lrs.score >= lender.minLRS;
          const isPoonawala = lender.id === 'poonawala';

          return (
            <div key={lender.id} className="card-hover" style={{ 
              display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 2fr 200px', 
              gap: 24, padding: 32, 
              border: isPoonawala ? '2px solid var(--primary-border)' : '1px solid var(--border)',
              background: isPoonawala ? 'var(--primary-bg)' : 'var(--bg-card)',
              position: 'relative', overflow: 'hidden'
            }}>
              
              {/* Poonawala Ribbon */}
              {isPoonawala && (
                <div style={{
                  position: 'absolute', top: 16, right: -40, background: 'var(--grad-primary)',
                  color: 'white', fontSize: 11, fontWeight: 800, padding: '4px 48px',
                  transform: 'rotate(45deg)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  BEST MATCH
                </div>
              )}

              {/* Identity */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  {lender.icon}
                  <h3 style={{ fontSize: 20, fontWeight: 800 }}>{lender.name}</h3>
                </div>
                <span className="tag" style={{ background: lender.color + '15', color: lender.color, marginBottom: 16 }}>
                  {lender.type}
                </span>
                
                <div style={{ marginTop: 24 }}>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Platform Eligibility Status</p>
                  {isEligible ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--success)', fontWeight: 700, fontSize: 14 }}>
                      <CheckCircle2 size={18} /> Pre-Approved via LRS
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--danger)', fontWeight: 700, fontSize: 14 }}>
                      <XCircle size={18} /> Denied (LRS {"<"} {lender.minLRS})
                    </div>
                  )}
                </div>
              </div>

              {/* Data Table */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Max Limit</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{lender.maxLimit}</p>
                </div>
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Interest Rate (APR)</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{lender.apr}</p>
                </div>
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Collateral Constraint</p>
                  <p style={{ fontSize: 14, fontWeight: isPoonawala ? 700 : 500, color: isPoonawala ? 'var(--success)' : 'var(--text-primary)' }}>
                    {lender.collateral}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Moratorium Period</p>
                  <p style={{ fontSize: 14, color: 'var(--text-primary)' }}>{lender.moratorium}</p>
                </div>
              </div>

              {/* CTA */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', borderLeft: '1px solid var(--border)', paddingLeft: 24 }}>
                <Link href="/apply" style={{ pointerEvents: !isEligible ? 'none' : 'auto' }}>
                  <button className="btn btn-primary" disabled={!isEligible} style={{ 
                    width: '100%', padding: '12px 24px', 
                    opacity: isEligible ? 1 : 0.5,
                    filter: !isEligible ? 'grayscale(100%)' : 'none'
                  }}>
                    {isPoonawala ? 'Fast-Track Apply' : 'Standard Apply'}
                  </button>
                </Link>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
