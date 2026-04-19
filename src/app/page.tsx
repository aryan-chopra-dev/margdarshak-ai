'use client';
import Link from 'next/link';
import {
  ArrowRight, Globe, Calculator, Target, CalendarDays,
  Shield, Users, Sparkles, CheckCircle2, BarChart3,
  GraduationCap, TrendingUp
} from 'lucide-react';

const journey = [
  { step: '01', title: 'Discover', desc: 'Explore 30+ verified universities across 8 countries with real tuition and earnings data.', icon: Globe },
  { step: '02', title: 'Calculate', desc: 'Project your ROI with salary, EMI, and break-even analysis using government data sources.', icon: Calculator },
  { step: '03', title: 'Predict', desc: 'Get your admission probability using an ML model trained on real applicant data.', icon: Target },
  { step: '04', title: 'Prepare', desc: 'Build your Loan Readiness Score and generate a parent investment case.', icon: Shield },
  { step: '05', title: 'Apply', desc: 'Submit your education loan in 60 seconds — AI auto-fills from your admit letter.', icon: Sparkles },
];

const stats = [
  { value: '30+', label: 'Universities', sub: 'College Scorecard + NIRF' },
  { value: '₹1 Cr', label: 'Max Loan', sub: 'Poonawala Fincorp' },
  { value: '11.25%', label: 'Starting Rate', sub: 'p.a. interest' },
  { value: '60s', label: 'Loan Apply', sub: 'AI auto-fill' },
];

export default function LandingPage() {
  return (
    <div style={{ paddingTop: 56 }}>
      {/* Hero */}
      <section style={{
        maxWidth: 1200, margin: '0 auto', padding: '80px 32px 60px',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center',
      }}>
        <div>
          <div className="section-label">AI-Powered Education Platform</div>
          <h1 style={{
            fontSize: 44, fontWeight: 800, lineHeight: 1.15,
            letterSpacing: '-0.03em', marginBottom: 20,
          }}>
            Your study abroad journey,{' '}
            <span style={{ color: 'var(--primary)' }}>guided by data</span>
          </h1>
          <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
            Margdarshak AI combines real university data, salary projections, and
            Poonawala Fincorp&apos;s education loans into a single intelligent platform.
            From discovery to loan disbursement — all in one place.
          </p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link href="/onboarding" className="btn-primary" style={{ padding: '13px 28px', fontSize: 15 }}>
              Get Started <ArrowRight size={16} />
            </Link>
            <Link href="/career-navigator" className="btn-secondary" style={{ padding: '13px 28px', fontSize: 15 }}>
              Browse Universities
            </Link>
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 28 }}>
            {['US DOE Verified', 'NIRF 2024 Data', 'RBI Registered'].map(label => (
              <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
                <CheckCircle2 size={14} color="var(--success)" /> {label}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {stats.map((s, i) => (
            <div key={i} className="card-static" style={{ padding: 28 }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary)', marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Data trust bar */}
      <section style={{
        background: 'var(--bg-card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)',
        padding: '20px 32px',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'flex', justifyContent: 'center', gap: 48, alignItems: 'center',
        }}>
          {['US Dept of Education', 'QS Rankings 2025', 'NIRF India', 'Poonawala Fincorp', 'US BLS', 'Kaggle ML'].map(label => (
            <span key={label} style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* Journey */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="section-label" style={{ justifyContent: 'center' }}>How It Works</div>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 10 }}>From exploration to loan disbursement</h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto' }}>
            A 5-step journey designed to guide Indian students from &quot;I want to study abroad&quot;
            to &quot;my loan is approved.&quot;
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
          {journey.map((j, i) => {
            const Icon = j.icon;
            return (
              <div key={i} className="card-static" style={{ padding: '28px 22px', textAlign: 'center', position: 'relative' }}>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--primary)', marginBottom: 12,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}>
                  Step {j.step}
                </div>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, margin: '0 auto 14px',
                  background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={22} color="var(--primary)" />
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{j.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{j.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Key Features */}
      <section style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', padding: '80px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="section-label" style={{ justifyContent: 'center' }}>Platform Features</div>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 10 }}>Every tool a student needs</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { icon: Globe, title: 'AI Career Navigator', desc: 'Search, filter, and compare universities with verified data from College Scorecard API and QS Rankings.' },
              { icon: BarChart3, title: 'ROI Calculator', desc: 'Detailed cost breakdown, salary trajectory, and EMI projections using BLS salary data.' },
              { icon: Target, title: 'Admission Predictor', desc: 'ML model (R²=0.82) trained on Kaggle Graduate Admissions dataset predicts your chances.' },
              { icon: Shield, title: 'Loan Readiness Score', desc: 'A credit-score-like metric (300–850) that tracks your readiness for loan approval.' },
              { icon: Users, title: 'Parent Persuasion', desc: 'AI-generated investment case showing ROI, EMI affordability, and trust factors.' },
              { icon: Sparkles, title: '60-Second Apply', desc: 'Upload admit letter → AI extracts details → auto-fill → submit. That simple.' },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} style={{ padding: 28 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, marginBottom: 14,
                    background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={20} color="var(--primary)" />
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Poonawala CTA */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 32px' }}>
        <div className="card-static" style={{
          padding: 48, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center',
        }}>
          <div>
            <div className="section-label">Poonawala Fincorp Education Loans</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 14 }}>
              Education loans up to ₹1 Crore
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
              Starting at 11.25% p.a. with zero collateral up to ₹40 Lakhs, moratorium during
              study period, and tax benefits under Section 80E.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {[
                'RBI-registered NBFC with ₹25,000+ Cr AUM',
                'Up to 15-year repayment tenure',
                'Covers tuition + living + travel expenses',
                'Tax deductible interest (Section 80E)',
              ].map((point, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={16} color="var(--success)" /> {point}
                </div>
              ))}
            </div>
            <Link href="/onboarding" className="btn-primary" style={{ padding: '12px 28px' }}>
              Check Your Eligibility <ArrowRight size={16} />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="card-static" style={{ padding: 22, textAlign: 'center', border: '1px solid var(--primary-border)' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)' }}>11.25%</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Starting rate p.a.</div>
            </div>
            <div className="card-static" style={{ padding: 22, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800 }}>₹1 Cr</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Maximum loan</div>
            </div>
            <div className="card-static" style={{ padding: 22, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800 }}>₹0</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Collateral up to ₹40L</div>
            </div>
            <div className="card-static" style={{ padding: 22, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent-dark)' }}>15yr</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Max tenure</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)', padding: '32px',
        textAlign: 'center', fontSize: 13, color: 'var(--text-muted)',
      }}>
        <p>Margdarshak AI · Built for Poonawala Fincorp</p>
        <p style={{ marginTop: 4 }}>
          Data: US DOE College Scorecard · QS Rankings 2025 · NIRF 2024 · US BLS OEWS · RBI
        </p>
      </footer>
    </div>
  );
}
