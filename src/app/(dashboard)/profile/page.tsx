'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore, calculateLRS } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import {
  User, Mail, Phone, Calculator, Book, Save, ArrowLeft,
  AlertCircle, CheckCircle2, Upload, FileText, Users, IndianRupee,
  Briefcase, X
} from 'lucide-react';

// ============================================================================
// Validation rules — enforced on blur AND on submit
// ============================================================================
const FIELD_RULES: Record<string, { min: number; max: number; step?: number; label: string }> = {
  gpa:            { min: 0,   max: 10,  step: 0.1, label: 'GPA' },
  greScore:       { min: 260, max: 340, label: 'GRE Score' },
  toeflScore:     { min: 0,   max: 120, label: 'TOEFL Score' },
  ieltsScore:     { min: 0,   max: 9,   step: 0.5, label: 'IELTS Score' },
  workExperience: { min: 0,   max: 30,  label: 'Work Experience' },
  parentIncome:   { min: 0,   max: 100000000, label: 'Parent Income' },
};

function validateField(name: string, value: number): string | null {
  const rule = FIELD_RULES[name];
  if (!rule) return null;
  if (value !== 0 && value < rule.min) return `${rule.label} must be at least ${rule.min}`;
  if (value > rule.max) return `${rule.label} cannot exceed ${rule.max}`;
  return null;
}

// ============================================================================
// Document upload config
// ============================================================================
const DOCUMENT_TYPES = [
  { key: 'transcript',  label: 'Academic Transcript', icon: FileText },
  { key: 'passport',    label: 'Passport Copy',       icon: FileText },
  { key: 'test_scores', label: 'Test Score Report',    icon: FileText },
  { key: 'admit_letter',label: 'Admit Letter',         icon: FileText },
] as const;

export default function ProfilePage() {
  const router = useRouter();
  const { profile, setProfile, intentScore } = useAppStore();

  const [formData, setFormData] = useState({
    name: profile.name || '',
    email: profile.email || '',
    phone: profile.phone || '',
    gpa: profile.gpa || 0,
    greScore: profile.greScore || 0,
    toeflScore: profile.toeflScore || 0,
    ieltsScore: profile.ieltsScore || 0,
    workExperience: profile.workExperience || 0,
    targetCountry: profile.targetCountry || '',
    targetField: profile.targetField || '',
    stage: profile.stage || 'explorer',
    // Co-applicant fields
    parentName: profile.parentName || '',
    parentPhone: profile.parentPhone || '',
    parentIncome: profile.parentIncome || 0,
    parentOccupation: profile.parentOccupation || '',
  });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Document upload state
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, { name: string; url: string }>>(
    // Restore from profile.docsUploaded if it's an object map
    (profile.docsUploaded && typeof profile.docsUploaded === 'object' && !Array.isArray(profile.docsUploaded))
      ? profile.docsUploaded as Record<string, { name: string; url: string }>
      : {}
  );
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [requestingAdmin, setRequestingAdmin] = useState(false);

  const handleRequestAdmin = async () => {
    setRequestingAdmin(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          role: 'admin',
          roleStatus: 'pending'
        })
      });
      const data = await res.json();
      if (res.ok) {
        const isDev = process.env.NODE_ENV === 'development';
        setProfile({
          role: 'admin',
          roleStatus: isDev ? 'approved' : 'pending'
        });
        if (isDev) {
          alert('Admin access granted and approved automatically (development bypass).');
        } else {
          alert('Admin access request submitted to admin queue.');
        }
      } else {
        alert(data.message || 'Request failed');
      }
    } catch (err) {
      console.error(err);
      alert('Request error');
    } finally {
      setRequestingAdmin(false);
    }
  };

  // ---- Validation on blur ----
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (FIELD_RULES[name]) {
      const err = validateField(name, Number(value));
      setFieldErrors(prev => {
        if (err) return { ...prev, [name]: err };
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // ---- Validated change handler ----
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      const numVal = Number(value);
      const rule = FIELD_RULES[name];
      // Clamp to max on input (prevent typing beyond range)
      const clamped = rule ? Math.min(rule.max, numVal) : numVal;
      setFormData(prev => ({ ...prev, [name]: clamped }));
      // Clear error if now valid
      if (fieldErrors[name]) {
        const err = validateField(name, clamped);
        if (!err) setFieldErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // ---- Full validation on submit ----
  const validateAll = (): boolean => {
    const errors: Record<string, string> = {};
    for (const [field, rule] of Object.entries(FIELD_RULES)) {
      const val = (formData as Record<string, unknown>)[field] as number;
      if (val !== undefined && val !== 0) {
        const err = validateField(field, val);
        if (err) errors[field] = err;
      }
    }
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (formData.phone) {
      const cleanPhone = formData.phone.replace(/[\s\-\+]/g, '');
      const last10 = cleanPhone.slice(-10);
      if (last10.length !== 10 || !/^[6-9]\d{9}$/.test(last10)) {
        errors.phone = 'Please enter a valid 10-digit Indian phone number';
      }
    }
    if (formData.parentPhone) {
      const cleanPhone = formData.parentPhone.replace(/[\s\-\+]/g, '');
      const last10 = cleanPhone.slice(-10);
      if (last10.length !== 10 || !/^[6-9]\d{9}$/.test(last10)) {
        errors.parentPhone = 'Please enter a valid 10-digit Indian phone number';
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ---- Document upload handler ----
  const handleDocUpload = async (docKey: string, file: File) => {
    setUploadingDoc(docKey);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${formData.email}/${docKey}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      setUploadedDocs(prev => ({
        ...prev,
        [docKey]: { name: file.name, url: urlData.publicUrl }
      }));
    } catch (err) {
      console.error('Document upload error:', err);
      setSaveError(`Failed to upload ${file.name}. Please try again.`);
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleRemoveDoc = (docKey: string) => {
    setUploadedDocs(prev => {
      const next = { ...prev };
      delete next[docKey];
      return next;
    });
  };

  // ---- Submit ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;

    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      const fullProfileDraft = { ...profile, ...formData, docsUploaded: uploadedDocs as any };
      const calculatedLrs = calculateLRS(fullProfileDraft, intentScore);

      const payload = {
        ...formData,
        email: formData.email,
        docsUploaded: uploadedDocs,
        lrsScore: calculatedLrs.score,
      };

      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || data.message || 'Failed to save profile.');
      }

      setProfile({ ...formData, docsUploaded: uploadedDocs as unknown as string[] });
      setSaveSuccess(true);
      setTimeout(() => router.push('/dashboard'), 800);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save profile. Please try again.';
      setSaveError(message);
      setProfile(formData);
    } finally {
      setSaving(false);
    }
  };

  // ---- Inline error display helper ----
  const FieldError = ({ field }: { field: string }) => {
    if (!fieldErrors[field]) return null;
    return (
      <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 600, marginTop: 4, display: 'block' }}>
        {fieldErrors[field]}
      </span>
    );
  };

  return (
    <div className="page-container" style={{ maxWidth: 700, margin: '0 auto', paddingTop: 60 }}>
      <button
        onClick={() => router.back()}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: 20 }}
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <h1 className="page-title">Edit Your Profile</h1>
      <p className="page-subtitle" style={{ marginBottom: 32 }}>
        Update your personal and academic details. This data is used to customize your study timeline and predict admission chances.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── Personal Information ── */}
        <div className="card-static" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={18} color="var(--primary)" /> Personal Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="input-label">Full Name *</label>
              <input name="name" className={`input-field ${fieldErrors.name ? 'error' : ''}`} value={formData.name} onChange={handleChange} required />
              <FieldError field="name" />
            </div>
            <div>
              <label className="input-label">Email Address *</label>
              <input name="email" type="email" className={`input-field ${fieldErrors.email ? 'error' : ''}`} value={formData.email} onChange={handleChange} required />
              <FieldError field="email" />
            </div>
            <div>
              <label className="input-label">Phone Number</label>
              <input name="phone" className={`input-field ${fieldErrors.phone ? 'error' : ''}`} value={formData.phone} onChange={handleChange} />
              <FieldError field="phone" />
            </div>
            <div>
              <label className="input-label">Current Stage</label>
              <select name="stage" className="input-field" value={formData.stage} onChange={handleChange}>
                <option value="explorer">The Explorer (Researching)</option>
                <option value="planner">The Planner (Preparing Tests/Docs)</option>
                <option value="converter">The Converter (Applying/Admitted)</option>
              </select>
            </div>
            <div style={{ gridColumn: 'span 2', marginTop: 12, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
              <label className="input-label" style={{ marginBottom: 8 }}>Access Level</label>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-elevated)', padding: '12px 16px', borderRadius: 8 }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Current Role: {profile.role || 'user'}
                  </span>
                  {profile.role === 'admin' && profile.roleStatus === 'pending' && (
                    <span className="tag tag-warning" style={{ marginLeft: 10 }}>Pending Approval</span>
                  )}
                  {profile.role === 'admin' && profile.roleStatus === 'approved' && (
                    <span className="tag tag-success" style={{ marginLeft: 10 }}>Approved</span>
                  )}
                </div>
                {(!profile.role || profile.role === 'user') && (
                  <button
                    type="button"
                    onClick={handleRequestAdmin}
                    disabled={requestingAdmin}
                    className="btn btn-secondary"
                    style={{ padding: '6px 14px', fontSize: 12 }}
                  >
                    {requestingAdmin ? 'Submitting...' : 'Request Admin Access'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Academic Profile (with validation) ── */}
        <div className="card-static" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calculator size={18} color="var(--accent)" /> Academic Profile
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div>
              <label className="input-label">GPA (0–10)</label>
              <input name="gpa" type="number" step="0.1" min="0" max="10"
                className={`input-field ${fieldErrors.gpa ? 'error' : ''}`}
                value={formData.gpa} onChange={handleChange} onBlur={handleBlur} />
              <FieldError field="gpa" />
            </div>
            <div>
              <label className="input-label">GRE Score (260–340)</label>
              <input name="greScore" type="number" min="260" max="340"
                className={`input-field ${fieldErrors.greScore ? 'error' : ''}`}
                value={formData.greScore} onChange={handleChange} onBlur={handleBlur} />
              <FieldError field="greScore" />
            </div>
            <div>
              <label className="input-label">Work Exp (0–30 yrs)</label>
              <input name="workExperience" type="number" min="0" max="30"
                className={`input-field ${fieldErrors.workExperience ? 'error' : ''}`}
                value={formData.workExperience} onChange={handleChange} onBlur={handleBlur} />
              <FieldError field="workExperience" />
            </div>
            <div>
              <label className="input-label">TOEFL (0–120)</label>
              <input name="toeflScore" type="number" min="0" max="120"
                className={`input-field ${fieldErrors.toeflScore ? 'error' : ''}`}
                value={formData.toeflScore} onChange={handleChange} onBlur={handleBlur} />
              <FieldError field="toeflScore" />
            </div>
            <div>
              <label className="input-label">IELTS (0–9)</label>
              <input name="ieltsScore" type="number" step="0.5" min="0" max="9"
                className={`input-field ${fieldErrors.ieltsScore ? 'error' : ''}`}
                value={formData.ieltsScore} onChange={handleChange} onBlur={handleBlur} />
              <FieldError field="ieltsScore" />
            </div>
          </div>
        </div>

        {/* ── Study Goals ── */}
        <div className="card-static" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Book size={18} color="var(--success)" /> Study Goals
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="input-label">Target Country</label>
              <input name="targetCountry" className="input-field" value={formData.targetCountry} onChange={handleChange} placeholder="e.g. United States" />
            </div>
            <div>
              <label className="input-label">Target Field</label>
              <input name="targetField" className="input-field" value={formData.targetField} onChange={handleChange} placeholder="e.g. Computer Science" />
            </div>
          </div>
        </div>

        {/* ── Co-Applicant / Parent Details ── */}
        <div className="card-static" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={18} color="var(--primary)" /> Co-Applicant Details
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
            Adding parent/co-applicant info improves your Loan Readiness Score and enables the Parent Persuasion Report.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="input-label">Parent / Guardian Name</label>
              <input name="parentName" className="input-field" value={formData.parentName} onChange={handleChange} placeholder="e.g. Ramesh Sharma" />
            </div>
            <div>
              <label className="input-label">Parent Phone</label>
              <input name="parentPhone" type="tel" className={`input-field ${fieldErrors.parentPhone ? 'error' : ''}`} value={formData.parentPhone} onChange={handleChange} placeholder="+91 98765 43210" />
              <FieldError field="parentPhone" />
            </div>
            <div>
              <label className="input-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  Annual Income (₹)
                </span>
              </label>
              <div style={{ position: 'relative' }}>
                <IndianRupee size={14} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input name="parentIncome" type="number" min="0" max="100000000"
                  className={`input-field ${fieldErrors.parentIncome ? 'error' : ''}`}
                  style={{ paddingLeft: 32 }}
                  value={formData.parentIncome} onChange={handleChange} onBlur={handleBlur}
                  placeholder="e.g. 1200000" />
              </div>
              <FieldError field="parentIncome" />
            </div>
            <div>
              <label className="input-label">Occupation</label>
              <select name="parentOccupation" className="input-field" value={formData.parentOccupation} onChange={handleChange}>
                <option value="">Select occupation</option>
                <option value="salaried">Salaried (Govt/Private)</option>
                <option value="business">Business / Self-employed</option>
                <option value="professional">Professional (Doctor/Lawyer/CA)</option>
                <option value="agriculture">Agriculture</option>
                <option value="retired">Retired / Pensioner</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          {/* LRS hint */}
          <div style={{
            marginTop: 16, padding: '10px 14px', borderRadius: 8,
            background: 'var(--accent-bg)', border: '1px solid rgba(13,148,136,0.15)',
            fontSize: 12, color: 'var(--accent-dark)', lineHeight: 1.5,
          }}>
            <strong>LRS Boost:</strong> Completing co-applicant details adds up to 20% to your Loan Readiness Score.
            Industry data shows 60% of loan applications stall because parents aren&apos;t involved early.
          </div>
        </div>

        {/* ── Document Upload ── */}
        <div className="card-static" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Upload size={18} color="var(--primary)" /> Document Upload
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>
            Upload your documents to strengthen your profile. Accepted formats: PDF, JPG, PNG (max 10MB each).
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {DOCUMENT_TYPES.map(doc => {
              const uploaded = uploadedDocs[doc.key];
              const isUploading = uploadingDoc === doc.key;
              return (
                <div key={doc.key} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 16px', borderRadius: 10,
                  border: `1px solid ${uploaded ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
                  background: uploaded ? 'rgba(16,185,129,0.04)' : 'var(--bg-card)',
                  transition: 'all 0.2s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: uploaded ? 'rgba(16,185,129,0.1)' : 'var(--bg-subtle)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {uploaded
                        ? <CheckCircle2 size={18} color="var(--success)" />
                        : <doc.icon size={18} color="var(--text-muted)" />}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{doc.label}</div>
                      {uploaded && (
                        <div style={{ fontSize: 11, color: 'var(--success)', fontWeight: 500, marginTop: 2 }}>
                          ✓ {uploaded.name}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {uploaded && (
                      <button type="button" onClick={() => handleRemoveDoc(doc.key)}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--text-muted)', padding: 4,
                        }}
                        title="Remove document">
                        <X size={14} />
                      </button>
                    )}
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      ref={el => { fileInputRefs.current[doc.key] = el; }}
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 10 * 1024 * 1024) {
                            setSaveError(`${file.name} exceeds 10MB limit.`);
                            return;
                          }
                          handleDocUpload(doc.key, file);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[doc.key]?.click()}
                      disabled={isUploading}
                      style={{
                        padding: '6px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                        cursor: isUploading ? 'wait' : 'pointer',
                        background: uploaded ? 'var(--bg-subtle)' : 'var(--primary)',
                        color: uploaded ? 'var(--text-secondary)' : 'white',
                        border: uploaded ? '1px solid var(--border)' : '1px solid var(--primary)',
                        transition: 'all 0.2s',
                      }}
                    >
                      {isUploading ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ width: 12, height: 12, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                          Uploading...
                        </span>
                      ) : uploaded ? 'Replace' : 'Upload'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Upload progress bar */}
          {(() => {
            const uploadedCount = Object.keys(uploadedDocs).length;
            const total = DOCUMENT_TYPES.length;
            const pct = Math.round((uploadedCount / total) * 100);
            const allDone = uploadedCount === total;
            return (
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: allDone ? 'var(--success)' : 'var(--text-secondary)' }}>
                    {uploadedCount} of {total} documents uploaded
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: allDone ? 'var(--success)' : 'var(--primary)' }}>
                    {pct}%
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: 'var(--bg-subtle)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: allDone ? 'var(--success)' : 'var(--primary)',
                    borderRadius: 99,
                    transition: 'width 0.4s ease',
                  }} />
                </div>
                {!allDone && (
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
                    ⚠️ Upload all {total} documents to unlock loan applications.
                  </p>
                )}
                {allDone && (
                  <p style={{ fontSize: 11, color: 'var(--success)', marginTop: 8, fontWeight: 600 }}>
                    ✓ All documents verified — you are eligible to apply for a loan.
                  </p>
                )}
              </div>
            );
          })()}
        </div>

        {/* ── Error / Success Banners ── */}
        {saveError && (
          <div style={{
            padding: '12px 16px', borderRadius: 10,
            background: 'rgba(239,68,68,0.08)', color: '#EF4444',
            fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
            border: '1px solid rgba(239,68,68,0.2)',
          }}>
            <AlertCircle size={15} /> {saveError}
          </div>
        )}
        {saveSuccess && (
          <div style={{
            padding: '12px 16px', borderRadius: 10,
            background: 'rgba(16,185,129,0.08)', color: 'var(--success)',
            fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
            border: '1px solid rgba(16,185,129,0.2)',
          }}>
            <CheckCircle2 size={15} /> Profile saved successfully! Redirecting...
          </div>
        )}

        {/* Validation summary */}
        {Object.keys(fieldErrors).length > 0 && (
          <div style={{
            padding: '12px 16px', borderRadius: 10,
            background: 'rgba(245,158,11,0.08)', color: '#D97706',
            fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
            border: '1px solid rgba(245,158,11,0.2)',
          }}>
            <AlertCircle size={15} /> Please fix {Object.keys(fieldErrors).length} field error{Object.keys(fieldErrors).length > 1 ? 's' : ''} above before saving.
          </div>
        )}

        <button type="submit" className="btn-primary"
          disabled={saving || Object.keys(fieldErrors).length > 0}
          style={{ padding: 16, fontSize: 16, display: 'flex', justifyContent: 'center' }}>
          {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
        </button>
      </form>
    </div>
  );
}
