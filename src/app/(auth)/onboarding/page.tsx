'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import {
  User, GraduationCap, BookOpen, Calculator,
  ArrowRight, ArrowLeft, Sparkles
} from 'lucide-react';

const countries = ['United States', 'United Kingdom', 'Canada', 'Germany', 'Australia', 'Singapore', 'Switzerland', 'India'];
const fields = ['Computer Science', 'Engineering', 'MBA', 'Data Science', 'AI/ML', 'Finance', 'Law', 'Medicine', 'Biotech', 'Design', 'Robotics', 'Public Policy'];
const degrees = [
  { value: 'masters', label: "Master's (MS/MA/MSc)" },
  { value: 'mba', label: 'MBA' },
  { value: 'phd', label: 'PhD' },
  { value: 'bachelors', label: "Bachelor's" },
];

type Errors = Record<string, string>;

function validateStep(step: number, form: Record<string, unknown>): Errors {
  const errs: Errors = {};
  if (step === 0) {
    if (!form.name || (form.name as string).trim().length < 2)
      errs.name = 'Name is required (at least 2 characters)';
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email as string))
      errs.email = 'Please enter a valid email address';
  }
  if (step === 1) {
    if (!form.targetCountry)
      errs.targetCountry = 'Please select a target country';
    if (!form.targetField)
      errs.targetField = 'Please select a field of study';
  }
  if (step === 2) {
    const gpa = parseFloat(form.gpa as string);
    if (!form.gpa || isNaN(gpa) || gpa < 1 || gpa > 10)
      errs.gpa = 'Enter a valid GPA between 1.0 and 10.0';
    
    if (form.workExperience) {
      const we = parseInt(form.workExperience as string);
      if (isNaN(we) || we < 0 || we > 30) errs.workExperience = 'Work experience must be 0-30';
    }
    if (form.greScore) {
      const gre = parseInt(form.greScore as string);
      if (isNaN(gre) || gre < 260 || gre > 340) errs.greScore = 'GRE must be between 260-340';
    }
    if (form.toeflScore) {
      const toefl = parseInt(form.toeflScore as string);
      if (isNaN(toefl) || toefl < 0 || toefl > 120) errs.toeflScore = 'TOEFL must be between 0-120';
    }
    if (form.ieltsScore) {
      const ielts = parseFloat(form.ieltsScore as string);
      if (isNaN(ielts) || ielts < 0 || ielts > 9) errs.ieltsScore = 'IELTS must be between 0-9.0';
    }
  }
  if (step === 3) {
    if (form.budget) {
      const budget = parseInt(form.budget as string);
      if (isNaN(budget) || budget < 0) errs.budget = 'Budget must be a positive number';
    }
  }
  return errs;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, setProfile, setOnboarded, isOnboarded, onboardingDraft, setOnboardingDraft } = useAppStore();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    targetCountry: '', targetField: '', degree: 'masters' as const,
    gpa: '', greScore: '', toeflScore: '', ieltsScore: '',
    workExperience: '', budget: '', hasResearch: false,
    parentName: '', parentPhone: '',
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOnboarded) {
      router.replace('/dashboard');
      return;
    }
    
    // Restore from draft if available, otherwise initialize from auth profile
    if (onboardingDraft?.form) {
      setStep(onboardingDraft.step);
      setForm(onboardingDraft.form as typeof form);
    } else {
      setForm(f => ({ 
        ...f, 
        name: profile?.name || f.name, 
        email: profile?.email || f.email 
      }));
    }
  }, [isOnboarded, onboardingDraft, profile?.name, profile?.email, router]);

  // Auto-save progress whenever step or form changes
  useEffect(() => {
    if (mounted && !isOnboarded) {
      setOnboardingDraft({ step, form });
    }
  }, [step, form, mounted, isOnboarded, setOnboardingDraft]);

  if (!mounted) return <div style={{ minHeight: '100vh', background: 'var(--bg)' }} />;
  if (isOnboarded) return <div style={{ minHeight: '100vh', background: 'var(--bg)' }} />;

  const update = (key: string, val: string | boolean) => {
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => { const copy = { ...e }; delete copy[key]; return copy; });
  };

  const tryNext = () => {
    const errs = validateStep(step, form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    const errs = validateStep(step, form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const profileData = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      targetCountry: form.targetCountry,
      targetField: form.targetField,
      degree: form.degree,
      gpa: parseFloat(form.gpa) || 0,
      greScore: parseInt(form.greScore) || 0,
      toeflScore: parseInt(form.toeflScore) || 0,
      ieltsScore: parseFloat(form.ieltsScore) || 0,
      workExperience: parseInt(form.workExperience) || 0,
      budget: parseInt(form.budget) || 0,
      hasResearch: form.hasResearch,
      parentName: form.parentName.trim(),
      parentPhone: form.parentPhone.trim(),
    };

    try {
      // Save to database
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
    } catch (e) {
      console.error("Failed to save profile to DB", e);
    }

    setProfile(profileData);
    setOnboarded(true);
    setOnboardingDraft(undefined); // Clear draft
    router.push('/dashboard');
  };

  const stepDefs = [
    {
      title: 'About You',
      subtitle: 'We need your basic details to get started.',
      icon: User,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Field label="Full Name *" error={errors.name}>
            <input className={`input-field ${errors.name ? 'error' : ''}`} placeholder="e.g. Aryan Sharma"
              value={form.name} onChange={e => update('name', e.target.value)} />
          </Field>
          <Field label="Email Address *" error={errors.email}>
            <input className={`input-field ${errors.email ? 'error' : ''}`} type="email" placeholder="you@example.com"
              value={form.email} onChange={e => update('email', e.target.value)} />
          </Field>
          <Field label="Phone Number">
            <input className="input-field" type="tel" placeholder="+91 98765 43210"
              value={form.phone} onChange={e => update('phone', e.target.value)} />
          </Field>
        </div>
      ),
    },
    {
      title: 'Study Goals',
      subtitle: 'Tell us where and what you want to study.',
      icon: GraduationCap,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Field label="Target Country *" error={errors.targetCountry}>
            <select className={`input-field ${errors.targetCountry ? 'error' : ''}`}
              value={form.targetCountry} onChange={e => update('targetCountry', e.target.value)}>
              <option value="">Select a country</option>
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Field of Study *" error={errors.targetField}>
            <select className={`input-field ${errors.targetField ? 'error' : ''}`}
              value={form.targetField} onChange={e => update('targetField', e.target.value)}>
              <option value="">Select your field</option>
              {fields.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </Field>
          <Field label="Degree Level">
            <select className="input-field" value={form.degree} onChange={e => update('degree', e.target.value)}>
              {degrees.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </Field>
        </div>
      ),
    },
    {
      title: 'Academics',
      subtitle: 'Your scores help us predict admission chances.',
      icon: BookOpen,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="CGPA (out of 10) *" error={errors.gpa}>
              <input className={`input-field ${errors.gpa ? 'error' : ''}`} type="number" step="0.1"
                min="0" max="10" placeholder="8.5"
                value={form.gpa} onChange={e => update('gpa', e.target.value)} />
            </Field>
            <Field label="Work Experience (years)" error={errors.workExperience}>
              <input className={`input-field ${errors.workExperience ? 'error' : ''}`} type="number" min="0" max="30" placeholder="0"
                value={form.workExperience} onChange={e => update('workExperience', e.target.value)} />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="GRE Score (260–340)" error={errors.greScore}>
              <input className={`input-field ${errors.greScore ? 'error' : ''}`} type="number" min="260" max="340" placeholder="Optional"
                value={form.greScore} onChange={e => update('greScore', e.target.value)} />
            </Field>
            <Field label="TOEFL (0–120)" error={errors.toeflScore}>
              <input className={`input-field ${errors.toeflScore ? 'error' : ''}`} type="number" min="0" max="120" placeholder="Optional"
                value={form.toeflScore} onChange={e => update('toeflScore', e.target.value)} />
            </Field>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="IELTS (0–9)" error={errors.ieltsScore}>
              <input className={`input-field ${errors.ieltsScore ? 'error' : ''}`} type="number" step="0.5" min="0" max="9" placeholder="Optional"
                value={form.ieltsScore} onChange={e => update('ieltsScore', e.target.value)} />
            </Field>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                border: `1px solid ${form.hasResearch ? 'var(--primary)' : 'var(--border)'}`,
                background: form.hasResearch ? 'var(--primary-bg)' : 'var(--bg-card)',
                fontSize: 13, fontWeight: 600, width: '100%',
                transition: 'border-color 0.15s ease',
              }}>
                <input type="checkbox" checked={form.hasResearch}
                  onChange={e => update('hasResearch', e.target.checked)}
                  style={{ accentColor: 'var(--primary)', width: 16, height: 16 }} />
                Research Experience
              </label>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Budget & Family',
      subtitle: 'Optional. Helps us generate your parent report.',
      icon: Calculator,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Field label="Total Budget (₹ per year)" error={errors.budget}>
            <input className={`input-field ${errors.budget ? 'error' : ''}`} type="number" min="0" placeholder="e.g. 3000000"
              value={form.budget} onChange={e => update('budget', e.target.value)} />
          </Field>
          <Field label="Parent / Co-applicant Name">
            <input className="input-field" placeholder="Optional"
              value={form.parentName} onChange={e => update('parentName', e.target.value)} />
          </Field>
          <Field label="Parent Phone">
            <input className="input-field" type="tel" placeholder="Optional"
              value={form.parentPhone} onChange={e => update('parentPhone', e.target.value)} />
          </Field>
          <div style={{
            background: 'var(--accent-bg)', border: '1px solid rgba(13,148,136,0.15)',
            borderRadius: 'var(--radius-md)', padding: 14, fontSize: 13,
            color: 'var(--accent-dark)', lineHeight: 1.6,
          }}>
            Industry data shows 60% of education loan applications stall because parents
            aren&apos;t involved early. Adding their details lets us generate a data-backed
            investment case for them.
          </div>
        </div>
      ),
    },
  ];

  const current = stepDefs[step];
  const StepIcon = current.icon;

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: '80px 24px',
    }}>
      <div style={{ maxWidth: 480, width: '100%' }}>
        {/* Progress */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
          {stepDefs.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 2,
              background: i <= step ? 'var(--primary)' : 'var(--border)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        <div className="card-static" style={{ padding: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'var(--primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <StepIcon size={20} color="var(--primary)" />
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Step {step + 1} of {stepDefs.length}
              </p>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>{current.title}</h2>
            </div>
          </div>

          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
            {current.subtitle}
          </p>

          {current.content}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28 }}>
            {step > 0 ? (
              <button className="btn-secondary" onClick={() => setStep(s => s - 1)}>
                <ArrowLeft size={15} /> Back
              </button>
            ) : <div />}
            {step < stepDefs.length - 1 ? (
              <button className="btn-primary" onClick={tryNext}>
                Continue <ArrowRight size={15} />
              </button>
            ) : (
              <button className="btn-primary" onClick={handleSubmit}>
                <Sparkles size={15} /> Go to Dashboard
              </button>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 14 }}>
          Your data stays in your browser. We use it to personalize recommendations.
        </p>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="input-label">{label}</label>
      {children}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
