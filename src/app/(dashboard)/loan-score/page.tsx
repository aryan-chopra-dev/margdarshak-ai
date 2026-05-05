'use client';
import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import Link from 'next/link';
import {
  Shield, CheckCircle2, AlertCircle, ArrowRight, FileText,
  User, GraduationCap, Upload, Sparkles
} from 'lucide-react';

const actionItems = [
  { key: 'profile', label: 'Complete your profile', desc: 'Name, email, academic scores', icon: User, href: '/onboarding', scoreKey: 'profileCompleteness' as const },
  { key: 'docs', label: 'Upload documents', desc: 'Transcripts, passport, test scores', icon: FileText, href: '#docs', scoreKey: 'documentReadiness' as const },
  { key: 'parent', label: 'Add co-applicant details', desc: 'Parent name, phone, income', icon: User, href: '/onboarding', scoreKey: 'coApplicantDetails' as const },
  { key: 'uni', label: 'Shortlist universities', desc: 'Mark favorites in Career Navigator', icon: GraduationCap, href: '/career-navigator', scoreKey: 'universityShortlist' as const },
];

export default function LoanScorePage() {
  const { lrs, updateLRS, profile, setProfile, addIntentEvent } = useAppStore();

  useEffect(() => {
    updateLRS();
    addIntentEvent(5);
  }, []);

  const circumference = 2 * Math.PI * 90;
  const pct = ((lrs.score - 300) / 550) * 100;
  const offset = circumference - (pct / 100) * circumference;
  const lrsColor = lrs.score >= 700 ? '#10B981' : lrs.score >= 500 ? '#F59E0B' : '#EF4444';
  const lrsLabel = lrs.score >= 700 ? 'Pre-Approved' : lrs.score >= 500 ? 'Getting There' : 'Just Starting';

  const getUploadedKeys = () => {
    if (!profile.docsUploaded) return [];
    if (Array.isArray(profile.docsUploaded)) return profile.docsUploaded;
    return Object.keys(profile.docsUploaded);
  };
  const uploadedKeys = getUploadedKeys();

  const handleFakeDocUpload = (docKey: string) => {
    if (!uploadedKeys.includes(docKey)) {
      const existingDocs = Array.isArray(profile.docsUploaded)
        ? profile.docsUploaded
        : profile.docsUploaded && typeof profile.docsUploaded === 'object'
          ? Object.keys(profile.docsUploaded)
          : [];

      setProfile({ docsUploaded: [...new Set([...existingDocs, docKey])] });
      addIntentEvent(10);
    }
  };

  const docs = [
    { key: 'transcript', name: 'Academic Transcript', uploaded: uploadedKeys.includes('transcript') },
    { key: 'passport', name: 'Passport Copy', uploaded: uploadedKeys.includes('passport') },
    { key: 'test_scores', name: 'Test Score Report', uploaded: uploadedKeys.includes('test_scores') || uploadedKeys.includes('test-score') },
    { key: 'admit_letter', name: 'Admit Letter', uploaded: uploadedKeys.includes('admit_letter') || uploadedKeys.includes('admit-letter') },
  ];

  return (
    <div className="page-container">
      <div className="section-label"><Shield size={14} /> Loan Readiness Score</div>
      <h1 className="page-title">Your Loan Readiness Score</h1>
      <p className="page-subtitle" style={{ marginBottom: 40 }}>
        Build your score to 700+ to unlock pre-approved loan offers from Poonawala Fincorp
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Left: Gauge */}
        <div className="card-static" style={{ padding: 40, textAlign: 'center' }}>
          <div className="lrs-gauge" style={{ width: 220, height: 220, margin: '0 auto 24px' }}>
            <svg width="220" height="220" viewBox="0 0 220 220">
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6C3CE1" />
                  <stop offset="100%" stopColor="#0EA5E9" />
                </linearGradient>
              </defs>
              <circle className="track" cx="110" cy="110" r="90" />
              <circle className="progress" cx="110" cy="110" r="90"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
              />
            </svg>
            <div className="score-text">
              <div className="score-number" style={{ fontSize: 56 }}>{lrs.score}</div>
              <div className="score-label">out of 850</div>
            </div>
          </div>

          <div style={{
            display: 'inline-flex', padding: '6px 20px', borderRadius: 'var(--radius-full)',
            fontSize: 14, fontWeight: 700,
            background: lrs.score >= 700 ? 'var(--success-bg)' : lrs.score >= 500 ? 'var(--warning-bg)' : 'var(--danger-bg)',
            color: lrsColor, marginBottom: 24,
          }}>
            {lrs.score >= 700 ? '🎉' : lrs.score >= 500 ? '📈' : '🚀'} {lrsLabel}
          </div>

          {/* Scale guide */}
          <div style={{ display: 'flex', gap: 4, borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: 12 }}>
            <div style={{ flex: 1, height: 8, background: '#EF4444' }} />
            <div style={{ flex: 1, height: 8, background: '#F59E0B' }} />
            <div style={{ flex: 1, height: 8, background: '#10B981' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
            <span>300</span><span>500</span><span>700</span><span>850</span>
          </div>

          {lrs.score >= 700 && (
            <div style={{
              marginTop: 24, padding: 20, borderRadius: 'var(--radius-md)',
              background: 'var(--success-bg)', border: '1px solid rgba(16,185,129,0.2)',
            }}>
              <Sparkles size={20} color="var(--success)" style={{ marginBottom: 8 }} />
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--success)' }}>
                You qualify for pre-approved offers!
              </p>
              <Link href="/apply" className="btn-primary" style={{ width: '100%', marginTop: 12, padding: '10px', fontSize: 14 }}>
                Apply in 60 Seconds <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>

        {/* Right: Breakdown + Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Score Breakdown */}
          <div className="card-static" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Score Breakdown</h3>
            {[
              { label: 'Profile Completeness', value: lrs.breakdown.profileCompleteness, weight: 25 },
              { label: 'Document Readiness', value: lrs.breakdown.documentReadiness, weight: 25 },
              { label: 'Co-applicant Details', value: lrs.breakdown.coApplicantDetails, weight: 20 },
              { label: 'University Shortlist', value: lrs.breakdown.universityShortlist, weight: 15 },
              { label: 'Engagement Signal', value: lrs.breakdown.engagementSignal, weight: 15 },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>{item.label}</span>
                  <span style={{ fontWeight: 700, color: item.value >= 70 ? 'var(--success)' : item.value >= 40 ? 'var(--warning)' : 'var(--danger)' }}>
                    {item.value}% <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>({item.weight}% weight)</span>
                  </span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: 'var(--bg-subtle)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 4,
                    background: item.value >= 70 ? 'var(--success)' : item.value >= 40 ? 'var(--warning)' : 'var(--danger)',
                    width: `${item.value}%`,
                    transition: 'width 1s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Action Items */}
          <div className="card-static" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Boost Your Score</h3>
            {actionItems.map((a, i) => (
              <Link key={i} href={a.href} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0',
                borderBottom: i < actionItems.length - 1 ? '1px solid var(--border-light)' : 'none',
                textDecoration: 'none', color: 'var(--text)',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: lrs.breakdown[a.scoreKey] >= 70 ? 'var(--success-bg)' : 'var(--primary-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {lrs.breakdown[a.scoreKey] >= 70
                    ? <CheckCircle2 size={18} color="var(--success)" />
                    : <a.icon size={18} color="var(--primary)" />
                  }
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{a.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.desc}</div>
                </div>
                <ArrowRight size={16} color="var(--text-muted)" />
              </Link>
            ))}
          </div>

          {/* Document Uploads */}
          <div className="card-static" style={{ padding: 28 }} id="docs">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
              <Upload size={16} style={{ marginRight: 8 }} />
              Document Upload
            </h3>
            {docs.map((d, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: i < docs.length - 1 ? '1px solid var(--border-light)' : 'none',
              }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{d.name}</span>
                {d.uploaded ? (
                  <span className="tag tag-success">✓ Uploaded</span>
                ) : (
                  <button
                    onClick={() => handleFakeDocUpload(d.key)}
                    className="btn-secondary"
                    style={{ padding: '6px 14px', fontSize: 12 }}
                  >
                    Upload
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
