'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';
import {
  LayoutDashboard, Globe, Calculator, Target, CalendarDays,
  Shield, Users, Medal, ArrowRight, Flame, Edit3
} from 'lucide-react';

const quickActions = [
  { label: 'Career Navigator', desc: 'Find your best-fit university', href: '/career-navigator', icon: Globe, color: '#4F46E5' },
  { label: 'ROI Calculator', desc: 'Project your return on investment', href: '/roi-calculator', icon: Calculator, color: '#0D9488' },
  { label: 'Admission Predictor', desc: 'Score your admission chances', href: '/admission-predictor', icon: Target, color: '#D97706' },
  { label: 'Study Timeline', desc: 'Your action plan', href: '/timeline', icon: CalendarDays, color: '#059669' },
  { label: 'Loan Readiness', desc: 'Check your LRS score', href: '/loan-score', icon: Shield, color: '#DC2626' },
  { label: 'Parent Report', desc: 'Generate investment case', href: '/parent-report', icon: Users, color: '#7C3AED' },
];

export default function DashboardPage() {
  const router = useRouter();
  const { profile, lrs, updateLRS, streakDays, intentScore, checkStreak, isOnboarded } = useAppStore();

  useEffect(() => {
    if (!isOnboarded) {
      router.replace('/onboarding');
      return;
    }
    updateLRS();
    checkStreak();
  }, [isOnboarded]);

  if (!isOnboarded) return null;

  const circumference = 2 * Math.PI * 80;
  const pct = Math.max(0, (lrs.score - 300) / 550) * 100;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>Welcome back, {profile.name.split(' ')[0]} 👋</h1>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 4 }}>
            Your personalized study abroad dashboard
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {streakDays > 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px',
              borderRadius: 'var(--radius-full)', background: 'var(--warning-bg)',
              border: '1px solid rgba(217,119,6,0.15)',
              fontSize: 13, fontWeight: 600, color: 'var(--warning)',
            }}>
              <Flame size={14} /> {streakDays}-day streak
            </span>
          )}
          <Link href="/profile" className="btn-secondary" style={{ fontSize: 13, padding: '6px 14px' }}>
            <Edit3 size={14} /> Edit Profile
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'flex-start' }}>
        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Quick actions grid */}
          <div>
            <div className="section-label" style={{ marginBottom: 12 }}>
              <LayoutDashboard size={14} /> Quick Actions
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {quickActions.map(a => (
                <Link key={a.href} href={a.href} className="card" style={{
                  padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14,
                  textDecoration: 'none', color: 'var(--text)',
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: `${a.color}1A`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <a.icon size={18} color={a.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{a.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.desc}</div>
                  </div>
                  <ArrowRight size={14} color="var(--text-muted)" />
                </Link>
              ))}
            </div>
          </div>

          {/* Academic profile card */}
          <div className="card-static" style={{ padding: 24 }}>
            <div className="section-label" style={{ marginBottom: 14 }}>
              <Target size={14} /> Academic Profile
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
              {[
                { label: 'GPA', value: profile.gpa || '—', max: '/10' },
                { label: 'GRE', value: profile.greScore || '—', max: '/340' },
                { label: 'TOEFL', value: profile.toeflScore || '—', max: '/120' },
                { label: 'IELTS', value: profile.ieltsScore || '—', max: '/9.0' },
                { label: 'Work Exp.', value: profile.workExperience, max: 'years' },
              ].map((item, i) => (
                <div key={i} style={{
                  padding: 14, borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{item.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.max}</div>
                </div>
              ))}
            </div>
            {profile.hasResearch && (
              <span className="tag tag-accent" style={{ marginTop: 12 }}>
                Research Experience ✓
              </span>
            )}
          </div>

          {/* Targets */}
          <div className="card-static" style={{ padding: 24 }}>
            <div className="section-label" style={{ marginBottom: 14 }}>
              <Globe size={14} /> Your Target
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              {profile.targetCountry && (
                <span className="tag tag-primary">{profile.targetCountry}</span>
              )}
              {profile.targetField && (
                <span className="tag tag-accent">{profile.targetField}</span>
              )}
              <span className="tag" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                {profile.degree === 'masters' ? "Master's" : profile.degree === 'mba' ? 'MBA' : profile.degree === 'phd' ? 'PhD' : "Bachelor's"}
              </span>
            </div>
            {profile.shortlistedUniversities.length > 0 && (
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 10 }}>
                {profile.shortlistedUniversities.length} universities shortlisted
              </p>
            )}
          </div>

          {/* Gamification Hub - Badges & Leaderboard */}
          <div className="card-static" style={{ padding: 24 }}>
            <div className="section-label" style={{ marginBottom: 20 }}>
              <Medal size={14} /> Achievements & Peer Leaderboard
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
              {/* Badges */}
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--text-secondary)' }}>UNLOCKED BADGES</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                  <div className="tag tag-primary" style={{ padding: '8px 12px', fontSize: 12 }}><Target size={14}/> Early Applicant</div>
                  {profile.shortlistedUniversities.length > 0 && (
                     <div className="tag tag-accent" style={{ padding: '8px 12px', fontSize: 12 }}><Globe size={14}/> Target Locked</div>
                  )}
                  {lrs.score > 600 && (
                     <div className="tag tag-success" style={{ padding: '8px 12px', fontSize: 12 }}><Shield size={14}/> LRS Elite</div>
                  )}
                  {streakDays > 2 && (
                     <div className="tag tag-warning" style={{ padding: '8px 12px', fontSize: 12 }}><Flame size={14}/> Consistent Scholar</div>
                  )}
                </div>
              </div>

              {/* Leaderboard */}
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--text-secondary)' }}>LRS GLOBAL RANKING</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: 8, fontSize: 13 }}>
                     <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#143. Arjun K.</span>
                     <span style={{ fontWeight: 700 }}>805 LRS</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-subtle)', borderRadius: 8, fontSize: 13 }}>
                     <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>#144. Neha P.</span>
                     <span style={{ fontWeight: 700 }}>792 LRS</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--primary-bg)', border: '1px solid var(--primary-border)', borderRadius: 8, fontSize: 13 }}>
                     <span style={{ fontWeight: 800, color: 'var(--primary)' }}>#145. {profile.name || 'You'}</span>
                     <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{lrs.score} LRS</span>
                   </div>
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, textAlign: 'right' }}>Top 15% of all applicants</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: LRS sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 88 }}>
          <div className="card-static" style={{ padding: 24 }}>
            <div className="section-label" style={{ marginBottom: 16 }}>
              <Shield size={14} /> Loan Readiness Score
            </div>
            <div className="lrs-gauge" style={{ width: 180, height: 180, margin: '0 auto 16px' }}>
              <svg width="180" height="180" viewBox="0 0 180 180">
                <defs>
                  <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#4F46E5" />
                    <stop offset="100%" stopColor="#0D9488" />
                  </linearGradient>
                </defs>
                <circle className="track" cx="90" cy="90" r="80" />
                <circle className="progress" cx="90" cy="90" r="80"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                />
              </svg>
              <div className="score-text">
                <div className="score-number" style={{ fontSize: 42 }}>{lrs.score}</div>
                <div className="score-label">out of 850</div>
              </div>
            </div>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <span style={{
                display: 'inline-block', padding: '4px 14px',
                borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600,
                background: lrs.score >= 700 ? 'var(--success-bg)' : lrs.score >= 500 ? 'var(--warning-bg)' : 'var(--primary-bg)',
                color: lrs.score >= 700 ? 'var(--success)' : lrs.score >= 500 ? 'var(--warning)' : 'var(--primary)',
              }}>
                {lrs.score >= 700 ? 'Pre-Approved ✓' : lrs.score >= 500 ? 'Getting There' : 'Just Starting'}
              </span>
            </div>
            <Link href="/loan-score" className="btn-primary" style={{ width: '100%', fontSize: 13, padding: '10px', color: '#FFFFFF' }}>
              View Full Breakdown <ArrowRight size={14} />
            </Link>
          </div>

          {/* Score Breakdown mini */}
          <div className="card-static" style={{ padding: 20 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Score Breakdown</h4>
            {[
              { label: 'Profile', val: lrs.breakdown.profileCompleteness },
              { label: 'Documents', val: lrs.breakdown.documentReadiness },
              { label: 'Co-applicant', val: lrs.breakdown.coApplicantDetails },
              { label: 'Universities', val: lrs.breakdown.universityShortlist },
              { label: 'Engagement', val: lrs.breakdown.engagementSignal },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span style={{ fontWeight: 600 }}>{item.val}%</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-subtle)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 2, transition: 'width 0.8s ease',
                    background: item.val >= 70 ? 'var(--success)' : item.val >= 30 ? 'var(--warning)' : 'var(--border)',
                    width: `${item.val}%`,
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Intent */}
          <div className="card-static" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Intent Score</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>{intentScore}%</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: 'var(--bg-subtle)', overflow: 'hidden', marginTop: 8 }}>
              <div style={{
                height: '100%', borderRadius: 2, background: 'var(--primary)',
                width: `${intentScore}%`, transition: 'width 0.8s ease',
              }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
