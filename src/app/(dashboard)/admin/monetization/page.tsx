'use client';
import { 
  BarChart, LineChart, PieChart, TrendingUp, IndianRupee, 
  Users, Briefcase, FileCheck, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function B2BMonetizationDashboard() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <div className="page-container" style={{ maxWidth: 1200 }}>
      <div className="section-label"><BarChart size={14} /> B2B Admin Console</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 className="page-title">Revenue & Monetization</h1>
          <p className="page-subtitle">Platform metrics, lead generation performance, and affiliate tracking.</p>
        </div>
        <div style={{ padding: '8px 16px', background: 'var(--primary-bg)', color: 'var(--primary)', borderRadius: 8, fontWeight: 700, fontSize: 13, border: '1px solid var(--primary-border)' }}>
          FY 2026 Q2 Total: ₹14.8 Cr
        </div>
      </div>

      {/* Core Revenue KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
        <KpiCard title="Qualified Loan Leads" value="8,402" icon={Users} trend={+14.2} subtext="Sent to Poonawala Fincorp" />
        <KpiCard title="Projected Commission" value="₹12.4 Cr" icon={IndianRupee} trend={+22.5} subtext="At 1.5% disbursement avg" />
        <KpiCard title="Premium Subscribers" value="3,205" icon={Briefcase} trend={+8.4} subtext="₹1,499/mo Tier" />
        <KpiCard title="B2B Affiliates (Ancillary)" value="₹2.4 Cr" icon={FileCheck} trend={-2.1} subtext="Test Prep, Insurance, Forex" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 32 }}>
        
        {/* Loan Funnel Visualization */}
        <div className="card-static" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={18} color="var(--primary)" /> Margdarshak → Poonawala Funnel
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { stage: 'Platform Users (MAU)', count: 125000, color: '#94A3B8' },
              { stage: 'LRS Active (>500 Score)', count: 48000, color: '#3B82F6' },
              { stage: 'WhatsApp Parent Persuasion', count: 32500, color: '#10B981' },
              { stage: 'Hot Leads (LRS > 700 + Intent)', count: 8402, color: '#8B5CF6' },
              { stage: 'Disbursed (Est. 30% Convs)', count: 2520, color: '#EC4899' },
            ].map((funnel, i, arr) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                  <span>{funnel.stage}</span>
                  <span>{funnel.count.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ width: '100%', height: 12, background: 'var(--bg-elevated)', borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{ width: `${(funnel.count / arr[0].count) * 100}%`, height: '100%', background: funnel.color, borderRadius: 6, transition: 'width 1s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Affiliate Breakdown */}
        <div className="card-static" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
            <PieChart size={18} color="#0EA5E9" /> Tertiary Revenue
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
             {[
               { partner: 'Magoosh / ETS (Test Prep)', revenue: '₹85L', leads: 4200 },
               { partner: 'Student Health Insurance', revenue: '₹95L', leads: 3800 },
               { partner: 'Thomas Cook Forex Cards', revenue: '₹60L', leads: 6000 },
             ].map((b2b, i) => (
               <div key={i} style={{ paddingBottom: i !== 2 ? 20 : 0, borderBottom: i !== 2 ? '1px solid var(--border)' : 'none' }}>
                 <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>{b2b.partner}</div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 }}>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Leads Generated</div>
                      <div style={{ fontSize: 15, fontWeight: 800 }}>{b2b.leads.toLocaleString('en-IN')}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Commission YTD</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#059669' }}>{b2b.revenue}</div>
                    </div>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
      
      {/* Platform Subscriptions */}
      <div className="card-static" style={{ padding: 24 }}>
         <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <LineChart size={18} color="#D97706" /> Premium Services (B2C)
         </h3>
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
           <div style={{ padding: 16, background: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#B45309' }}>SOP/Essay AI Review Pro</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#92400E', marginTop: 8 }}>1,240</div>
              <div style={{ fontSize: 11, color: '#B45309', marginTop: 4 }}>₹999/one-time</div>
           </div>
           <div style={{ padding: 16, background: '#EEF2FF', border: '1px solid #E0E7FF', borderRadius: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#4338CA' }}>Unlimited Mentor Chat</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#3730A3', marginTop: 8 }}>1,550</div>
              <div style={{ fontSize: 11, color: '#4338CA', marginTop: 4 }}>₹1,499/mo</div>
           </div>
           <div style={{ padding: 16, background: '#F0FDF4', border: '1px solid #D1FAE5', borderRadius: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#047857' }}>Priority Visa Coaching</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#065F46', marginTop: 8 }}>415</div>
              <div style={{ fontSize: 11, color: '#047857', marginTop: 4 }}>₹4,999/session</div>
           </div>
           <div style={{ padding: 16, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Total B2C Revenue YTD</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', marginTop: 8 }}>₹55 Lakhs</div>
           </div>
         </div>
      </div>

    </div>
  );
}

function KpiCard({ title, value, icon: Icon, trend, subtext }: any) {
  const isPositive = trend > 0;
  return (
    <div className="card-static" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-bg)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: isPositive ? 'var(--success)' : 'var(--danger)', background: isPositive ? '#F0FDF4' : '#FEF2F2', padding: '4px 8px', borderRadius: 20 }}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(trend)}%
        </div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{title}</div>
      <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', marginTop: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{subtext}</div>
    </div>
  );
}
