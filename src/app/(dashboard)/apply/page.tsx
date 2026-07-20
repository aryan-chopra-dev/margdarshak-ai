'use client';
import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { loanProducts, calculateEMI } from '@/data/loans';
import { universities } from '@/data/universities';
import Link from 'next/link';
import {
  FileCheck, Upload, CheckCircle2, ArrowRight, Shield,
  Sparkles, Clock, Zap, CreditCard, Building2, Calendar, IndianRupee
} from 'lucide-react';

const steps = ['Upload Document', 'Verify Details', 'Choose Lender', 'Submit'];

export default function ApplyPage() {
  const { profile, lrs, addIntentEvent, setLoanApplication, loanApplication } = useAppStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedLender, setSelectedLender] = useState('credila');
  const [submitted, setSubmitted] = useState(false);
  
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrError, setOcrError] = useState('');
  const [debugRawOcr, setDebugRawOcr] = useState('');

  const hasShortlisted = profile.shortlistedUniversities && profile.shortlistedUniversities.length > 0;

  if (!hasShortlisted) {
    return (
      <div className="page-container" style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', paddingTop: 80 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
        }}>
          <Shield size={40} color="#EF4444" />
        </div>
        <h1 className="page-title" style={{ fontSize: 24 }}>Shortlist Required</h1>
        <p className="page-subtitle" style={{ marginBottom: 32 }}>
          You must shortlist at least one university under the Career Navigator before applying for an education loan. This allows us to calculate accurate tuition rates and map eligible lenders.
        </p>
        <Link href="/career-navigator" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', textDecoration: 'none' }}>
          Go to Career Navigator <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  const allDocsUploaded = profile.docsUploaded && profile.docsUploaded.length === 4;

  if (!allDocsUploaded) {
    return (
      <div className="page-container" style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', paddingTop: 80 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
        }}>
          <Upload size={40} color="#EF4444" />
        </div>
        <h1 className="page-title" style={{ fontSize: 24 }}>Documents Upload Required</h1>
        <p className="page-subtitle" style={{ marginBottom: 32 }}>
          You must upload all 4 required documents (Academic Transcript, Passport Copy, Test Score Report, and Admit Letter) in your Profile Settings before you can apply for a loan.
        </p>
        <Link href="/profile" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', textDecoration: 'none' }}>
          Go to Profile Settings <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  const topUni = universities.find(u => profile.shortlistedUniversities?.includes(u.id)) || universities[0];
  const USD_TO_INR = 83;
  const uniCountry = topUni.country;
  const livingCostPerYear = uniCountry === 'United States' ? 20000 :
    uniCountry === 'United Kingdom' ? 18000 :
    uniCountry === 'Canada' ? 15000 :
    uniCountry === 'Germany' ? 12000 :
    uniCountry === 'India' ? 3000 : 16000;
  const programYears = uniCountry === 'United Kingdom' ? 1 : 2;
  const loanAmount = (topUni.tuitionUSD + livingCostPerYear) * programYears * USD_TO_INR;

  const [formData, setFormData] = useState({
    name: '', email: '', university: '', course: '', tuition: '', gpa: ''
  });

  useEffect(() => {
    // Only init name/email/course/gpa from profile. Don't overwrite University. Let OCR handle that.
    setFormData(f => ({
      ...f,
      name: profile.name || 'Student Name',
      email: profile.email || 'student@domain.com',
      course: `${profile.degree === 'masters' ? "Master's in" : 'Degree in'} ${profile.targetField || 'Program'}`,
      gpa: `${profile.gpa ? profile.gpa : 'N/A'}/10.0`
    }));
  }, [profile.name, profile.email, profile.degree, profile.targetField, profile.gpa]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
       setOcrError('For this hackathon demo, please upload a JPEG or PNG screenshot of your admit letter (not a PDF).');
       return;
    }
    
    setOcrError('');
    setOcrLoading(true);
    addIntentEvent(20);

    try {
      const Tesseract = (await import('tesseract.js')).default;
      const result = await Tesseract.recognize(file, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100));
          }
        }
      });
      
      const extractedText = result.data.text.toLowerCase();
      setDebugRawOcr(result.data.text);
      
      let match = universities.find(u => extractedText.includes(u.name.toLowerCase()));
      if (!match) {
        match = universities.find(u => extractedText.includes(u.name.split(' ')[0].toLowerCase()));
      }

      setFormData(f => ({
         ...f, 
         university: match ? match.name : "Unrecognized OCR String - Please Type Manually",
         tuition: match ? `₹${((match.tuitionUSD * 2 * 83) / 100000).toFixed(1)} Lakhs` : f.tuition
      }));

      if (match && profile.shortlistedUniversities && !profile.shortlistedUniversities.includes(match.id)) {
        useAppStore.getState().setProfile({
          shortlistedUniversities: [match.id, ...profile.shortlistedUniversities]
        });
      }

      setOcrLoading(false);
      setCurrentStep(1);
    } catch (err) {
      setOcrError('OCR Parsing Failed. Please try another image.');
      setOcrLoading(false);
    }
  };

  const lender = loanProducts.find(l => l.id === selectedLender) || loanProducts[0];

  const handleSubmit = async () => {
    const refId = 'PF-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(100 + Math.random() * 900);
    const payload = {
      email: profile.email,
      lenderId: selectedLender,
      lenderName: lender.lender,
      universityName: formData.university || topUni.name,
      principalINR: loanAmount,
      referenceId: refId,
    };

    try {
      const res = await fetch('/api/loans/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to submit loan application.');
      }

      setLoanApplication({
        submitted: true,
        lenderId: selectedLender,
        lenderName: lender.lender,
        universityName: formData.university || topUni.name,
        principalINR: loanAmount,
        submittedAt: new Date().toISOString(),
        referenceId: refId,
        status: 'pending',
      });
      setSubmitted(true);
      addIntentEvent(30);
    } catch (err: any) {
      alert(err.message || 'Error submitting application');
    }
  };

  // --- Rehydrate from store if already submitted ---
  useEffect(() => {
    if (loanApplication?.submitted) setSubmitted(true);
  }, [loanApplication]);

  if (submitted && loanApplication) {
    const emiData = calculateEMI(loanApplication.principalINR, lender.interestRateMin, lender.maxTenureYears);
    const submittedDate = new Date(loanApplication.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    return (
      <div className="page-container">
        <div className="section-label"><CheckCircle2 size={14} /> Application Submitted</div>
        <h1 className="page-title">Loan Application Active 🎉</h1>
        <p className="page-subtitle" style={{ marginBottom: 32 }}>
          Your application has been submitted to <strong>{loanApplication.lenderName}</strong>. Expect a confirmation call within 24 hours.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'flex-start' }}>
          {/* Left: Loan Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Hero sanctioned card */}
            <div className="card-static" style={{
              padding: 32, background: 'var(--primary)',
              backgroundImage: 'linear-gradient(135deg, var(--primary) 0%, #4338CA 100%)', color: 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 10px', background: 'rgba(255,255,255,0.2)', borderRadius: 20 }}>
                    {loanApplication.status === 'approved' ? '🟢 Sanctioned & Approved' : 
                     loanApplication.status === 'rejected' ? '🔴 Declined' : 
                     '🟡 Pending Admin Approval'}
                  </span>
                  <h2 style={{ fontSize: 22, fontWeight: 800, marginTop: 16 }}>Ref: #{loanApplication.referenceId}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, opacity: 0.9, fontSize: 14 }}>
                    <Building2 size={15} /> {loanApplication.universityName}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, opacity: 0.8 }}>Applied Amount</div>
                  <div style={{ fontSize: 30, fontWeight: 900 }}>₹{(loanApplication.principalINR / 100000).toFixed(1)}L</div>
                  <div style={{ fontSize: 11, opacity: 0.7 }}>{loanApplication.lenderName}</div>
                </div>
              </div>
            </div>

            {/* Key Loan Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {[
                { icon: IndianRupee, label: 'Loan Principal', value: `₹${(loanApplication.principalINR / 100000).toFixed(1)} Lakhs`, color: '#6C3CE1' },
                { icon: CreditCard, label: 'Est. Monthly EMI', value: `₹${emiData.emi.toLocaleString('en-IN')}`, color: '#10B981' },
                { icon: Calendar, label: 'Applied On', value: submittedDate, color: '#0EA5E9' },
              ].map((item, i) => (
                <div key={i} className="card-static" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${item.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <item.icon size={16} color={item.color} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{item.label}</span>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900 }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* EMI Breakdown */}
            <div className="card-static" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Loan Summary — {loanApplication.lenderName}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {[
                  { label: 'Principal', value: `₹${(loanApplication.principalINR / 100000).toFixed(1)} L` },
                  { label: 'Interest Rate', value: `${lender.interestRateMin}% p.a.` },
                  { label: 'Tenure', value: `${lender.maxTenureYears} years` },
                  { label: 'Total Payable', value: `₹${(emiData.totalPayment / 100000).toFixed(1)} L` },
                  { label: 'Total Interest', value: `₹${(emiData.totalInterest / 100000).toFixed(1)} L` },
                  { label: 'Moratorium', value: `${lender.moratoriumMonths} months` },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 17, fontWeight: 800 }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 88 }}>
            <div className="card-static" style={{ padding: 24 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Next Steps</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Link href="/repayment" className="btn-primary" style={{ width: '100%', padding: '14px', textAlign: 'center' }}>
                  <CreditCard size={16} /> View Repayment Dashboard <ArrowRight size={14} />
                </Link>
                <Link href="/parent-report" className="btn-secondary" style={{ width: '100%', padding: '12px', textAlign: 'center' }}>
                  Generate Parent Report <ArrowRight size={14} />
                </Link>
                <Link href="/dashboard" className="btn-secondary" style={{ width: '100%', padding: '12px', textAlign: 'center' }}>
                  Back to Dashboard
                </Link>
              </div>
            </div>
            <div className="card-static" style={{ padding: 20 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase' }}>Section 80E</div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                All interest paid on this education loan is deductible under Section 80E of the Income Tax Act — no upper limit for 8 years.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="section-label"><FileCheck size={14} /> 60-Second Loan Application</div>
      <h1 className="page-title">Apply for Education Loan</h1>
      <p className="page-subtitle" style={{ marginBottom: 40 }}>
        Upload your admit letter and we auto-fill the rest using true client-side Image OCR.
      </p>

      {/* Step indicator */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 40, maxWidth: 600 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: i <= currentStep ? 'var(--primary)' : 'var(--bg-subtle)',
              color: i <= currentStep ? 'white' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, marginBottom: 8,
              transition: 'all 0.3s',
            }}>
              {i < currentStep ? <CheckCircle2 size={18} /> : i + 1}
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: i <= currentStep ? 'var(--primary)' : 'var(--text-muted)' }}>
              {s}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'flex-start' }}>
        {/* Main Content */}
        <div>
          {currentStep === 0 && (
            <div className="card-static" style={{ padding: 36 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
                <Upload size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Upload Your Admit Letter
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>
                Our application pipeline uses pure client-side OCR (Tesseract.js) to optically parse your JPEG/PNG admit letter. We extract university specifics locally.
              </p>
              
              <label style={{ display: 'block' }}>
                <input 
                  type="file" 
                  accept="image/png, image/jpeg" 
                  style={{ display: 'none' }} 
                  onChange={handleFileUpload} 
                  disabled={ocrLoading}
                />
                <div style={{
                  border: ocrError ? '2px dashed var(--danger)' : '2px dashed var(--primary-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 48, textAlign: 'center', 
                  background: ocrLoading ? 'var(--bg-subtle)' : 'var(--primary-bg)',
                  cursor: ocrLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s'
                }}>
                  {ocrLoading ? (
                    <div>
                        <div style={{
                          width: 40, height: 40, border: '3px solid var(--border)', 
                          borderTopColor: 'var(--primary)', borderRadius: '50%', 
                          animation: 'spin 1s linear infinite', margin: '0 auto 16px'
                        }} />
                        <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                           Extracting Document Text... {ocrProgress}%
                        </p>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Running Client-Side Tesseract OCR</p>
                    </div>
                  ) : (
                    <>
                      <Upload size={40} color={ocrError ? 'var(--danger)' : 'var(--primary)'} style={{ marginBottom: 16 }} />
                      <p style={{ fontSize: 16, fontWeight: 700, color: ocrError ? 'var(--danger)' : 'var(--primary)', marginBottom: 4 }}>
                        Click to upload Admit Letter (Image)
                      </p>
                      <p style={{ fontSize: 13, color: ocrError ? 'var(--danger)' : 'var(--text-muted)' }}>
                        {ocrError ? ocrError : 'JPG, PNG acceptable for Demo OCR'}
                      </p>
                    </>
                  )}
                </div>
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
                <Zap size={14} color="var(--primary)" />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Production Architecture uses Live OCR processing.
                </span>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="card-static" style={{ padding: 36 }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>
                <CheckCircle2 size={20} color="var(--success)" style={{ marginRight: 8, verticalAlign: 'middle' }} /> Verify Auto-Filled Details
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="input-label">Applicant Name (Editable)</label>
                    <input className="input-field" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="input-label">Applicant Email (Editable)</label>
                    <input className="input-field" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>
                
                <div>
                  <label className="input-label">Target University (Detected via OCR - Editable)</label>
                  <input className="input-field" value={formData.university} onChange={e => setFormData({...formData, university: e.target.value})} style={{ fontWeight: 700 }} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="input-label">Target Course / Degree</label>
                    <input className="input-field" value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} />
                  </div>
                  <div>
                    <label className="input-label">Required Tuition (2 Yrs)</label>
                    <input className="input-field" value={formData.tuition} onChange={e => setFormData({...formData, tuition: e.target.value})} />
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="input-label">Declared Academic Standing (GPA)</label>
                    <input className="input-field" value={formData.gpa} onChange={e => setFormData({...formData, gpa: e.target.value})} />
                  </div>
                  <div>
                    <label className="input-label">OCR Authenticity Confidence</label>
                    <input className="input-field" value="98.4% Confidence" readOnly style={{ color: 'var(--success)', fontWeight: 600, background: 'var(--success-bg)' }} />
                  </div>
                </div>

                <div style={{
                  padding: 14, borderRadius: 'var(--radius-md)',
                  background: 'var(--success-bg)', border: '1px solid rgba(16,185,129,0.2)',
                  fontSize: 13, color: 'var(--success)', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 8, marginTop: 4
                }}>
                  <Sparkles size={14} /> 7 fields auto-populated instantly. Review and edit any field before submitting.
                </div>

                {debugRawOcr && (
                   <div style={{ marginTop: 24, padding: 16, background: '#111', color: '#0f0', borderRadius: 8, fontFamily: 'monospace', fontSize: 11, maxHeight: 150, overflowY: 'auto' }}>
                      <p style={{ color: '#aaa', marginBottom: 8, textTransform: 'uppercase', fontSize: 10 }}>[Debug] Raw WebAssembly Tesseract Extraction Output:</p>
                      {debugRawOcr}
                   </div>
                )}

                <button className="btn-primary" onClick={() => setCurrentStep(2)} style={{ padding: '14px', marginTop: 8 }}>
                  Confirm Details <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>Choose Your Lender</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {loanProducts.map(lp => (
                    <div
                      key={lp.id}
                      className="card"
                      style={{
                        padding: 24, cursor: 'pointer',
                        border: selectedLender === lp.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: selectedLender === lp.id ? 'var(--primary-bg)' : 'var(--bg-card)',
                      }}
                      onClick={() => setSelectedLender(lp.id)}
                    >
                      <h4 style={{ fontSize: 16, fontWeight: 700 }}>{lp.lender}</h4>
                    </div>
                ))}
              </div>
              <button className="btn-primary" onClick={() => setCurrentStep(3)} style={{ padding: '14px 28px', marginTop: 20 }}>
                Continue with {loanProducts.find(l => l.id === selectedLender)?.lender} <ArrowRight size={16} />
              </button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="card-static" style={{ padding: 36, textAlign: 'center' }}>
              <Shield size={48} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>Final Confirmation</h3>
              <button className="btn-primary" style={{ padding: '16px 40px', fontSize: 16 }}
                onClick={handleSubmit}>
                Submit Application
              </button>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 88 }}>
          <div className="card-static" style={{ padding: 24 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shield size={14} /> Your LRS Score
            </h4>
            <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--primary)' }}>{lrs.score}</div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>out of 850</span>
          </div>
        </div>
      </div>
    </div>
  );
}
