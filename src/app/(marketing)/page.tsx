'use client';
import Link from 'next/link';
import {
  ArrowRight, Globe, Calculator, Target,
  Shield, Users, Sparkles, CheckCircle2, BarChart3, Zap
} from 'lucide-react';

const stats = [
  { value: '₹2 Cr',  label: 'Max Loan Amount',   sub: 'Partner Lenders',    color: '#6366F1' },
  { value: '8.50%',  label: 'Starting Rate p.a.', sub: 'Reducing balance',     color: '#8B5CF6' },
  { value: '30+',    label: 'Universities',        sub: 'Across 8 countries',   color: '#06B6D4' },
  { value: '60s',    label: 'Time to Apply',       sub: 'AI auto-fill OCR',     color: '#10B981' },
];

const journey = [
  { step: '01', title: 'Discover',  desc: 'Explore verified universities across 8 countries with real tuition and earnings data.', icon: Globe,      color: '#6366F1' },
  { step: '02', title: 'Calculate', desc: 'Project ROI with salary, EMI, and break-even using government data.', icon: Calculator, color: '#8B5CF6' },
  { step: '03', title: 'Predict',   desc: 'Get admission probability from an ML model trained on real applicant data.', icon: Target,    color: '#06B6D4' },
  { step: '04', title: 'Prepare',   desc: 'Build your Loan Readiness Score and generate a parent investment case.', icon: Shield,    color: '#10B981' },
  { step: '05', title: 'Apply',     desc: 'Upload your admit letter — AI extracts details and auto-fills the form.', icon: Sparkles,  color: '#F59E0B' },
];

const features = [
  { icon: Globe,     color: '#6366F1', title: 'AI Career Navigator',  desc: 'Search, filter, and compare universities with College Scorecard and QS Rankings data.' },
  { icon: BarChart3, color: '#8B5CF6', title: 'ROI Calculator',       desc: 'Cost breakdown, salary trajectory, and EMI projections using BLS & HESA salary data.' },
  { icon: Target,    color: '#06B6D4', title: 'Admission Predictor',  desc: 'XGBoost model (R²=0.89) trained on Kaggle Graduate Admissions dataset.' },
  { icon: Shield,    color: '#10B981', title: 'Loan Readiness Score', desc: 'A credit-score metric (300–850) tracking your readiness for loan approval in real time.' },
  { icon: Users,     color: '#F59E0B', title: 'Parent Report',        desc: 'AI-generated investment dossier with ROI, EMI affordability, and trust signals — PDF ready.' },
  { icon: Sparkles,  color: '#E11D48', title: '60-Second Apply',      desc: 'Upload admit letter → AI OCR → auto-fill → submit. Powered by Tesseract.js.' },
];

const loanStats = [
  { val: '8.50%',  label: 'Starting rate p.a.', color: '#6366F1' },
  { val: '₹2 Cr',  label: 'Maximum loan',       color: '#10B981' },
  { val: 'Nil',    label: 'Zero Collateral Options',  color: '#8B5CF6' },
  { val: '15 yr',  label: 'Max tenure',          color: '#06B6D4' },
];

export default function LandingPage() {
  return (
    <div style={{ paddingTop: 56 }}>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '90px 32px 80px' }}>
        {/* Subtle ambient glows — lighter in light mode via CSS opacity */}
        <div style={{
          position: 'absolute', top: '-5%', left: '5%',
          width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '0%', right: '0%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center', position: 'relative' }}>
          {/* Left copy */}
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 14px', borderRadius: 'var(--radius-full)',
              background: 'var(--primary-bg)', border: '1px solid var(--primary-border)',
              fontSize: 11, fontWeight: 600, color: 'var(--primary)',
              letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 24,
            }}>
              <Zap size={11} /> AI-Powered Education Platform
            </div>

            <h1 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 50, fontWeight: 800, lineHeight: 1.12,
              letterSpacing: '-0.04em', marginBottom: 22, color: 'var(--heading)',
            }}>
              Your study abroad<br />journey,{' '}
              <span style={{
                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>guided by data</span>
            </h1>

            <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 36, maxWidth: 480 }}>
              Margdarshak AI combines real university data, salary projections, and
              flexible education loan options into a single intelligent platform.
            </p>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
              <Link href="/login" className="btn-primary" style={{ padding: '13px 28px', fontSize: 15 }}>
                Get Started Free <ArrowRight size={16} />
              </Link>
              <Link href="/career-navigator" className="btn-secondary" style={{ padding: '13px 28px', fontSize: 15 }}>
                Browse Universities
              </Link>
            </div>

            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {['US DOE Verified', 'NIRF 2024 Data', 'RBI Registered NBFC'].map(label => (
                <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12.5, color: 'var(--text-muted)' }}>
                  <CheckCircle2 size={13} color="var(--success)" /> {label}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {stats.map((s, i) => (
              <div key={i} className="card-static" style={{ padding: '26px 22px', borderTop: `2px solid ${s.color}` }}>
                <div style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em',
                  color: s.color, marginBottom: 6,
                }}>{s.value}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DATA TRUST BAR ── */}
      <div style={{
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-elevated)',
        padding: '12px 32px',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'flex', justifyContent: 'center', gap: 40, alignItems: 'center', flexWrap: 'wrap',
        }}>
          {['US Dept. of Education', 'QS Rankings 2025', 'NIRF India 2024', 'Lender Guidelines', 'BLS OEWS', 'Kaggle Admissions ML'].map(label => (
            <span key={label} style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div className="section-label" style={{ justifyContent: 'center', marginBottom: 12 }}>Process</div>
          <h2 style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 12, color: 'var(--heading)' }}>
            From discovery to disbursement
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto' }}>
            Five steps designed to guide Indian students all the way from university search to approved loan.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
          {journey.map((j) => {
            const Icon = j.icon;
            return (
              <div key={j.step} className="card-static" style={{ padding: '24px 18px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: j.color }} />
                <div style={{ fontSize: 10, fontWeight: 700, color: j.color, marginBottom: 14, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                  {j.step}
                </div>
                <div style={{
                  width: 40, height: 40, borderRadius: 11, margin: '0 auto 14px',
                  background: `${j.color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={19} color={j.color} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: 'var(--heading)' }}>{j.title}</h3>
                <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{j.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{
        background: 'var(--bg-elevated)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '96px 32px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div className="section-label" style={{ justifyContent: 'center', marginBottom: 12 }}>Platform</div>
            <h2 style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--heading)' }}>Everything a student needs</h2>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden',
            background: 'var(--bg-card)',
          }}>
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} style={{
                  padding: '32px 28px',
                  borderRight: i % 3 !== 2 ? '1px solid var(--border)' : 'none',
                  borderBottom: i < 3 ? '1px solid var(--border)' : 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-elevated)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, marginBottom: 16,
                    background: `${f.color}18`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={20} color={f.color} />
                  </div>
                  <h3 style={{ fontSize: 15.5, fontWeight: 700, marginBottom: 8, color: 'var(--heading)' }}>{f.title}</h3>
                  <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── LENDER / LOAN CTA ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 32px' }}>
        <div style={{
          borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          padding: '56px 60px',
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '-20%', right: '-5%',
            width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative' }}>
            <div className="section-label" style={{ marginBottom: 12 }}>Education Loans</div>
            <h2 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 14, color: 'var(--heading)' }}>
              Education loans up to{' '}
              <span style={{
                background: 'linear-gradient(135deg, #6366F1, #10B981)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>₹2 Crore</span>
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 28 }}>
              Starting at 8.50% p.a. with zero collateral options for select premier programs.
              Moratorium during study period and tax benefits under Section 80E.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
              {[
                'RBI-registered leading lenders and public banks',
                'Up to 15-year repayment tenure',
                'Covers tuition + living + travel expenses',
                'Interest deductible under Section 80E',
              ].map((point) => (
                <div key={point} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={15} color="var(--success)" style={{ flexShrink: 0 }} /> {point}
                </div>
              ))}
            </div>
            <Link href="/login" className="btn-primary" style={{ padding: '12px 28px' }}>
              Check Your Eligibility <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, position: 'relative' }}>
            {loanStats.map((item) => (
              <div key={item.label} className="card-static" style={{ padding: '22px 18px', textAlign: 'center', borderTop: `2px solid ${item.color}` }}>
                <div style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em',
                  color: item.color, marginBottom: 6,
                }}>{item.val}</div>
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '28px 32px',
        textAlign: 'center',
        background: 'var(--bg-elevated)',
      }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Margdarshak AI · Your Higher Education Companion
        </p>
        <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 4, opacity: 0.7 }}>
          Data: US DOE · QS Rankings 2025 · NIRF 2024 · BLS OEWS · RBI
        </p>
      </footer>
    </div>
  );
}
