'use client';
import { useState } from 'react';
import { predictAdmission, universityTiers, datasetStats } from '@/data/admissions';
import { useAppStore } from '@/lib/store';
import {
  Target, Sparkles, TrendingUp, AlertTriangle, CheckCircle2,
  XCircle, Info, BookOpen
} from 'lucide-react';

export default function AdmissionPredictorPage() {
  const { profile, addIntentEvent } = useAppStore();
  const [form, setForm] = useState({
    greScore: profile.greScore || 315,
    toeflScore: profile.toeflScore || 100,
    ieltsScore: profile.ieltsScore || 0,
    cgpa: profile.gpa || 8.0,
    universityRating: 3,
    sopStrength: 3,
    lorStrength: 3,
    hasResearch: profile.hasResearch || false,
    workExperienceYears: profile.workExperience || 0,
  });
  const [result, setResult] = useState<ReturnType<typeof predictAdmission> | null>(null);

  const handlePredict = () => {
    const prediction = predictAdmission(form);
    setResult(prediction);
    addIntentEvent(8);
  };

  const probColor = result
    ? result.probability >= 0.7 ? '#10B981'
    : result.probability >= 0.4 ? '#F59E0B'
    : '#EF4444'
    : '#6C3CE1';

  return (
    <div className="page-container">
      <div className="section-label"><Target size={14} /> Admission Predictor</div>
      <h1 className="page-title">Predict Your Admission Chances</h1>
      <p className="page-subtitle" style={{ marginBottom: 32 }}>
        Multiple Linear Regression model trained on Kaggle Graduate Admissions dataset (Acharya et al., 2019) — R² = 0.82, N = 500
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: 24, alignItems: 'flex-start' }}>
        {/* Inputs */}
        <div className="card-static" style={{ padding: 28, position: 'sticky', top: 88 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Your Profile</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="input-label">GRE Score (260-340)</label>
              <input className="input-field" type="number" min="260" max="340" value={form.greScore}
                onChange={e => setForm(f => ({ ...f, greScore: Math.min(340, Math.max(260, parseInt(e.target.value) || 260)) }))} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Dataset avg: {datasetStats.greScore.mean}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="input-label">TOEFL (0-120)</label>
                <input className="input-field" type="number" min="0" max="120" value={form.toeflScore}
                  onChange={e => setForm(f => ({ ...f, toeflScore: Math.min(120, Math.max(0, parseInt(e.target.value) || 0)) }))} />
              </div>
              <div>
                <label className="input-label">IELTS (0-9) alt.</label>
                <input className="input-field" type="number" min="0" max="9" step="0.5" value={form.ieltsScore}
                  onChange={e => setForm(f => ({ ...f, ieltsScore: Math.min(9, Math.max(0, parseFloat(e.target.value) || 0)) }))} />
              </div>
            </div>
            <div>
              <label className="input-label">CGPA (out of 10)</label>
              <input className="input-field" type="number" min="0" max="10" step="0.1" value={form.cgpa}
                onChange={e => setForm(f => ({ ...f, cgpa: Math.min(10, Math.max(0, parseFloat(e.target.value) || 0)) }))} />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Dataset avg: {datasetStats.cgpa.mean}</span>
            </div>
            <div>
              <label className="input-label">Target University Tier</label>
              <select className="input-field" value={form.universityRating}
                onChange={e => setForm(f => ({ ...f, universityRating: parseInt(e.target.value) }))}>
                {universityTiers.map(t => (
                  <option key={t.rating} value={t.rating}>{t.label}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="input-label">SOP Strength (1-5)</label>
                <input className="input-field" type="number" min="1" max="5" value={form.sopStrength}
                  onChange={e => setForm(f => ({ ...f, sopStrength: Math.min(5, Math.max(1, parseInt(e.target.value) || 1)) }))} />
              </div>
              <div>
                <label className="input-label">LOR Strength (1-5)</label>
                <input className="input-field" type="number" min="1" max="5" value={form.lorStrength}
                  onChange={e => setForm(f => ({ ...f, lorStrength: Math.min(5, Math.max(1, parseInt(e.target.value) || 1)) }))} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="input-label">Work Experience (yrs)</label>
                <input className="input-field" type="number" min="0" max="10" value={form.workExperienceYears}
                  onChange={e => setForm(f => ({ ...f, workExperienceYears: Math.min(20, Math.max(0, parseInt(e.target.value) || 0)) }))} />
              </div>
              <label style={{
                display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                background: form.hasResearch ? 'var(--primary-bg)' : 'var(--bg-card)',
                borderColor: form.hasResearch ? 'var(--primary)' : 'var(--border)',
                fontSize: 13, fontWeight: 600, alignSelf: 'flex-end',
              }}>
                <input type="checkbox" checked={form.hasResearch}
                  onChange={e => setForm(f => ({ ...f, hasResearch: e.target.checked }))}
                  style={{ accentColor: 'var(--primary)' }} />
                Research
              </label>
            </div>

            <button className="btn-primary" onClick={handlePredict} style={{ width: '100%', padding: '14px', marginTop: 4 }}>
              <Sparkles size={16} /> Predict My Chances
            </button>
          </div>
        </div>

        {/* Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {result ? (
            <>
              {/* Main result */}
              <div className="card-static" style={{ padding: 36, textAlign: 'center' }}>
                <div style={{
                  width: 160, height: 160, borderRadius: '50%', margin: '0 auto 20px',
                  background: `conic-gradient(${probColor} ${result.probability * 360}deg, var(--bg-subtle) 0deg)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    width: 130, height: 130, borderRadius: '50%', background: 'var(--bg-card)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{ fontSize: 40, fontWeight: 900, color: probColor }}>
                      {(result.probability * 100).toFixed(0)}%
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Admission Chance</div>
                  </div>
                </div>
                <div className={`tag ${result.probability >= 0.7 ? 'tag-success' : result.probability >= 0.4 ? 'tag-warning' : 'tag-primary'}`}
                  style={{ fontSize: 14, padding: '6px 20px' }}>
                  {result.percentile}
                </div>
              </div>

              {/* Strong & Weak */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="card-static" style={{ padding: 24 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--success)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={16} /> Strong Points
                  </h4>
                  {result.strongPoints.length > 0 ? (
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {result.strongPoints.map((p, i) => (
                        <li key={i} style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <CheckCircle2 size={14} color="var(--success)" /> {p}
                        </li>
                      ))}
                    </ul>
                  ) : <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Fill in your profile to see strengths</p>}
                </div>
                <div className="card-static" style={{ padding: 24 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--danger)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AlertTriangle size={16} /> Weak Points
                  </h4>
                  {result.weakPoints.length > 0 ? (
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {result.weakPoints.map((p, i) => (
                        <li key={i} style={{ fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <XCircle size={14} color="var(--danger)" /> {p}
                        </li>
                      ))}
                    </ul>
                  ) : <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No major concerns identified</p>}
                </div>
              </div>

              {/* Tips */}
              {result.tips.length > 0 && (
                <div className="card-static" style={{ padding: 24 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-dark)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <BookOpen size={16} /> Personalized Tips
                  </h4>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {result.tips.map((t, i) => (
                      <li key={i} style={{ fontSize: 14, color: 'var(--text-secondary)', display: 'flex', gap: 8 }}>
                        <Sparkles size={14} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Source citation */}
              <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, padding: '0 4px', marginTop: 12 }}>
                <span className="tag" style={{ background: 'var(--blue-50)', color: 'var(--blue-700)', border: '1px solid var(--blue-200)', marginRight: 6 }}>
                  Model: MLR (R²=0.82)
                </span>
                <Info size={14} />
                Multiple Linear Regression on Kaggle Graduate Admissions dataset (Acharya et al., 2019, N=500)
                <a href="https://www.kaggle.com/datasets/mohansacharya/graduate-admissions" target="_blank" rel="noopener" style={{ color: 'var(--primary)' }}>
                  Verify source →
                </a>
              </div>
            </>
          ) : (
            <div className="card-static" style={{ padding: 48, textAlign: 'center' }}>
              <Target size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Configure your profile</h3>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
                Enter your academic details on the left and click "Predict My Chances" to see your admission probability.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
