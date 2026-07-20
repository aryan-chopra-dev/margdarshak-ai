'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import {
  Phone, Key, User, Mail, ArrowRight, ShieldCheck,
  CheckCircle2, RefreshCw, AlertCircle
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAppStore();

  const [step, setStep] = useState<'details' | 'otp' | 'done'>('details');
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [delivery, setDelivery] = useState<'email' | 'demo'>('demo');
  const [countdown, setCountdown] = useState(0);

  // Resend countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }
    if (!isLogin) {
      if (!name.trim() || !phone.trim()) {
        setError('Name, email, and phone number are required for registration.');
        return;
      }
      const cleanPhone = phone.replace(/[\s\-\+]/g, '');
      const last10 = cleanPhone.slice(-10);
      if (last10.length !== 10 || !/^[6-9]\d{9}$/.test(last10)) {
        setError('Please enter a valid 10-digit Indian phone number.');
        return;
      }
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name || 'Student', email, phone, isLogin }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP.');

      setDelivery(data.delivery || 'demo');
      // [FIX NEW-1]: demoOtp is no longer returned in the API response for security.
      // In demo mode, the OTP is only visible in the server console (npm run dev output).
      setStep('otp');
      setCountdown(30);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send OTP.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) { setError('Enter the 6-digit OTP.'); return; }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name || 'Student', email, phone, otp, isLogin }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed.');

      if (data.registered) {
        // Registration complete: clear fields, set Sign In tab, and redirect back to login step
        setSuccess('Account created successfully! Please sign in using your email.');
        setIsLogin(true);
        setStep('details');
        setOtp('');
        setName('');
        setPhone('');
        setLoading(false);
        return;
      }

      // Step 1: Set auth identity in Zustand
      login(data.profile.name, data.profile.email, data.profile.phone || phone);

      // Step 2: [FIX NEW-2] Hydrate the full profile from the database.
      // Without this, returning users log in to a blank local slate, and the
      // first subsequent save would destructively overwrite their cloud profile.
      try {
        const profileRes = await fetch(`/api/profile?email=${encodeURIComponent(data.profile.email)}`);
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.profile) {
            const { setProfile, setOnboarded, setLoanApplication } = useAppStore.getState();
            setProfile({
              gpa: profileData.profile.gpa || 0,
              greScore: profileData.profile.greScore || 0,
              toeflScore: profileData.profile.toeflScore || 0,
              ieltsScore: profileData.profile.ieltsScore || 0,
              workExperience: profileData.profile.workExperience || 0,
              budget: profileData.profile.budget || 0,
              targetCountry: profileData.profile.targetCountry || '',
              targetField: profileData.profile.targetField || '',
              degree: profileData.profile.degree || 'masters',
              stage: profileData.profile.stage || 'explorer',
              hasResearch: profileData.profile.hasResearch || false,
              shortlistedUniversities: profileData.profile.shortlistedUniversities || [],
              docsUploaded: profileData.profile.docsUploaded || [],
              parentName: profileData.profile.parentName || '',
              parentPhone: profileData.profile.parentPhone || '',
              parentIncome: profileData.profile.parentIncome || 0,
              parentOccupation: profileData.profile.parentOccupation || '',
              kycVerified: profileData.profile.kycVerified || false,
              role: profileData.profile.role || 'user',
              roleStatus: profileData.profile.roleStatus || 'approved',
            });
            setLoanApplication(profileData.profile.loanApplication || null);
            // Mark as onboarded if the saved profile has meaningful data
            if (profileData.profile.targetCountry || profileData.profile.gpa > 0) {
              setOnboarded(true);
            }
          }
        }
      } catch (hydrateErr) {
        // Non-fatal: user can still proceed; local state will be blank for new users
        console.warn('Profile hydration failed (non-fatal for new users):', hydrateErr);
      }

      setStep('done');

      // Check if user has already completed onboarding (returning user)
      const { isOnboarded } = useAppStore.getState();

      setTimeout(() => {
        router.push(isOnboarded ? '/dashboard' : '/onboarding');
      }, 800);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Verification failed.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--bg-main)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Decorative orbs */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: 500, height: 500, background: 'var(--primary)', filter: 'blur(120px)', opacity: 0.08, borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: 400, height: 400, background: 'var(--accent)', filter: 'blur(120px)', opacity: 0.08, borderRadius: '50%', pointerEvents: 'none' }} />

      <div className="card-static" style={{ width: '100%', maxWidth: 440, padding: '40px', position: 'relative', zIndex: 10 }}>
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            background: 'var(--grad-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 32px var(--primary-border)',
          }}>
            <ShieldCheck color="white" size={30} />
          </div>
        </div>

        <h1 style={{ textAlign: 'center', fontSize: 24, fontWeight: 800, marginBottom: 6, color: 'var(--heading)' }}>
          Welcome to Margdarshak
        </h1>
        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.6 }}>
          {step === 'details' && 'Enter your details to unlock your Loan Readiness Score.'}
          {step === 'otp' && (
            delivery === 'email'
              ? `Check your inbox — OTP sent to ${email}`
              : 'Enter the verification code shown below.'
          )}
          {step === 'done' && 'All set! Redirecting...'}
        </p>

        {/* Login / Register Toggle Tabs */}
        {step === 'details' && (
          <div style={{
            display: 'flex',
            background: 'var(--bg-elevated)',
            padding: 4,
            borderRadius: 'var(--radius-md)',
            marginBottom: 24,
            border: '1.5px solid var(--border)'
          }}>
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
              style={{
                flex: 1,
                padding: '10px 0',
                border: 'none',
                borderRadius: 'calc(var(--radius-md) - 2px)',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 700,
                background: isLogin ? 'var(--primary)' : 'transparent',
                color: isLogin ? 'white' : 'var(--text-secondary)',
                transition: 'all 0.2s',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
              style={{
                flex: 1,
                padding: '10px 0',
                border: 'none',
                borderRadius: 'calc(var(--radius-md) - 2px)',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 700,
                background: !isLogin ? 'var(--primary)' : 'transparent',
                color: !isLogin ? 'white' : 'var(--text-secondary)',
                transition: 'all 0.2s',
              }}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Success message banner */}
        {success && (
          <div style={{
            padding: '12px 16px', marginBottom: 20, borderRadius: 10,
            background: 'rgba(16,185,129,0.1)', color: 'var(--success)',
            fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
            border: '1px solid rgba(16,185,129,0.2)',
          }}>
            <CheckCircle2 size={15} /> {success}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            padding: '12px 16px', marginBottom: 20, borderRadius: 10,
            background: 'rgba(239,68,68,0.1)', color: '#EF4444',
            fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
            border: '1px solid rgba(239,68,68,0.2)',
          }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

         {/* ── Step 1: Details ── */}
        {step === 'details' && (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {!isLogin && (
              <div>
                <label style={labelStyle}>Your Name <span style={{ color: '#EF4444' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <User size={17} color="var(--text-muted)" style={iconStyle} />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Rahul Sharma" required={!isLogin} style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
                </div>
              </div>
            )}

            <div>
              <label style={labelStyle}>Email Address <span style={{ color: '#EF4444' }}>*</span></label>
              <div style={{ position: 'relative' }}>
                <Mail size={17} color="var(--text-muted)" style={iconStyle} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@example.com" required style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label style={labelStyle}>Mobile Number <span style={{ color: '#EF4444' }}>*</span></label>
                <div style={{ position: 'relative' }}>
                  <Phone size={17} color="var(--text-muted)" style={iconStyle} />
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210" required={!isLogin} style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                    onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                  OTP will be sent to your email. Phone is saved for your profile.
                </p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary"
              style={{ width: '100%', height: 48, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, fontSize: 15, marginTop: 4 }}>
              {loading
                ? <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Sending OTP...</>
                : <><Mail size={16} /> Send OTP to Email <ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        {/* ── Step 2: OTP ── */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Delivery badge */}
            <div style={{
              padding: '12px 16px', borderRadius: 10,
              background: delivery === 'email' ? 'rgba(16,185,129,0.08)' : 'rgba(79,70,229,0.08)',
              border: `1px solid ${delivery === 'email' ? 'rgba(16,185,129,0.2)' : 'rgba(79,70,229,0.2)'}`,
              display: 'flex', alignItems: 'center', gap: 10,
              fontSize: 13, color: delivery === 'email' ? 'var(--success)' : 'var(--primary)', fontWeight: 600,
            }}>
              {delivery === 'email'
                ? <><CheckCircle2 size={16} /> OTP sent to {email}</>
                : <><Key size={16} /> Demo Mode — check the server console for your OTP</>}
            </div>

            {/* Demo mode instruction — OTP is server-side only for security */}
            {delivery === 'demo' && (
              <div style={{
                padding: '16px', borderRadius: 12, textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(79,70,229,0.06), rgba(139,92,246,0.06))',
                border: '2px dashed rgba(79,70,229,0.3)',
              }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Demo Mode
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Your OTP is printed to the <strong>server console</strong>.<br />
                  Open your terminal running <code style={{ background: 'var(--bg-elevated)', padding: '1px 6px', borderRadius: 4 }}>npm run dev</code> to find it.
                </p>
              </div>
            )}
            <div>
              <label style={labelStyle}>6-Digit OTP</label>
              <div style={{ position: 'relative' }}>
                <Key size={17} color="var(--text-muted)" style={iconStyle} />
                <input
                  type="text" inputMode="numeric" value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="· · · · · ·" required maxLength={6} autoFocus
                  style={{ ...inputStyle, letterSpacing: '10px', fontWeight: 800, fontSize: 22, textAlign: 'center', paddingLeft: '14px' }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
                  onBlur={(e) => (e.target.style.borderColor = 'var(--border)')} />
              </div>
            </div>

            {/* Progress dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
              {[...Array(6)].map((_, i) => (
                <div key={i} style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: i < otp.length ? 'var(--primary)' : 'var(--border)',
                  transition: 'background 0.2s',
                }} />
              ))}
            </div>

            <button type="submit" disabled={loading || otp.length < 6} className="btn btn-primary"
              style={{ width: '100%', height: 48, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, fontSize: 15 }}>
              {loading
                ? <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Verifying...</>
                : <><CheckCircle2 size={16} /> Verify & Continue</>}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button type="button" onClick={() => { setStep('details'); setError(''); setOtp(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}>
                ← Change details
              </button>
              <button type="button"
                onClick={() => { setStep('details'); setTimeout(() => handleSendOtp({ preventDefault: () => {} } as any), 100); }}
                disabled={countdown > 0}
                style={{ background: 'none', border: 'none', fontSize: 13,
                  color: countdown > 0 ? 'var(--text-muted)' : 'var(--primary)',
                  fontWeight: 600, cursor: countdown > 0 ? 'not-allowed' : 'pointer' }}>
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}

        {/* ── Done ── */}
        {step === 'done' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0' }}>
            <CheckCircle2 color="var(--success)" size={56} style={{ marginBottom: 16 }} />
            <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--success)', marginBottom: 6 }}>Verified!</h3>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Redirecting to your dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600,
  color: 'var(--text-primary)', marginBottom: 8,
};

const iconStyle: React.CSSProperties = {
  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px 12px 42px',
  borderRadius: 'var(--radius-md)',
  border: '1.5px solid var(--border)',
  fontSize: 15,
  outline: 'none',
  transition: 'border-color 0.2s',
  background: 'var(--bg-main)',
  color: 'var(--text-primary)',
};
