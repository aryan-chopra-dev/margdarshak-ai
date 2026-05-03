'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { User, Mail, Phone, Calculator, Book, Save, ArrowLeft } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { profile, setProfile } = useAppStore();
  
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
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Save to Zustand store
    setProfile(formData);
    
    // In the future this will sync to PostgreSQL via an API route
    // await fetch('/api/profile', { method: 'POST', body: JSON.stringify(formData) });
    
    setTimeout(() => {
      setSaving(false);
      router.push('/dashboard');
    }, 500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // Map number fields correctly
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
        <div className="card-static" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={18} color="var(--primary)" /> Personal Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="input-label">Full Name</label>
              <input name="name" className="input-field" value={formData.name} onChange={handleChange} required />
            </div>
            <div>
              <label className="input-label">Email Address</label>
              <input name="email" type="email" className="input-field" value={formData.email} onChange={handleChange} required />
            </div>
            <div>
              <label className="input-label">Phone Number</label>
              <input name="phone" className="input-field" value={formData.phone} onChange={handleChange} />
            </div>
            <div>
              <label className="input-label">Current Stage</label>
              <select name="stage" className="input-field" value={formData.stage} onChange={handleChange}>
                <option value="explorer">The Explorer (Researching)</option>
                <option value="planner">The Planner (Preparing Tests/Docs)</option>
                <option value="converter">The Converter (Applying/Admitted)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card-static" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Calculator size={18} color="var(--accent)" /> Academic Profile
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div>
              <label className="input-label">GPA (out of 10)</label>
              <input name="gpa" type="number" step="0.1" className="input-field" value={formData.gpa} onChange={handleChange} />
            </div>
            <div>
              <label className="input-label">GRE Score</label>
              <input name="greScore" type="number" className="input-field" value={formData.greScore} onChange={handleChange} />
            </div>
            <div>
              <label className="input-label">Work Exp (Years)</label>
              <input name="workExperience" type="number" className="input-field" value={formData.workExperience} onChange={handleChange} />
            </div>
            <div>
              <label className="input-label">TOEFL Score</label>
              <input name="toeflScore" type="number" className="input-field" value={formData.toeflScore} onChange={handleChange} />
            </div>
            <div>
              <label className="input-label">IELTS Score</label>
              <input name="ieltsScore" type="number" step="0.5" className="input-field" value={formData.ieltsScore} onChange={handleChange} />
            </div>
          </div>
        </div>

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

        <button type="submit" className="btn-primary" disabled={saving} style={{ padding: 16, fontSize: 16, display: 'flex', justifyContent: 'center' }}>
          {saving ? 'Saving...' : <><Save size={18} /> Save Changes</>}
        </button>
      </form>
    </div>
  );
}
