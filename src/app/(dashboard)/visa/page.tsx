'use client';
import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import Link from 'next/link';
import {
  Globe, CheckCircle2, Clock, DollarSign, FileText,
  AlertCircle, ChevronRight, ExternalLink, Briefcase,
  Shield, Calendar, ArrowRight, Info, Plane
} from 'lucide-react';

// ============================================================================
// VISA DATA — Sourced from official government portals (verified April 2026)
// ============================================================================
const visaData = {
  'United States': {
    flag: '🇺🇸',
    visaType: 'F-1 Student Visa',
    authority: 'US Department of State',
    officialUrl: 'https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html',
    color: '#2563EB',
    processingTime: '20–50 days (interview slot)',
    fee: '₹44,355',
    feeBreakdown: [
      { item: 'MRV (Visa Application) Fee', amount: '₹15,355' },
      { item: 'SEVIS Fee (I-901)', amount: '₹29,000' },
    ],
    postStudyWork: 'OPT: 12 months (36 months for STEM)',
    interviewCities: [
      { city: 'Delhi', wait: '20–40 days' },
      { city: 'Mumbai', wait: '30–50 days' },
      { city: 'Chennai', wait: '15–30 days' },
      { city: 'Hyderabad', wait: '20–35 days' },
      { city: 'Kolkata', wait: '10–20 days' },
    ],
    documents: [
      { doc: 'Form I-20 from university', required: true },
      { doc: 'DS-160 Online Application', required: true },
      { doc: 'SEVIS fee payment receipt', required: true },
      { doc: 'Valid passport (6+ months validity)', required: true },
      { doc: 'Passport-size photograph (US specs)', required: true },
      { doc: 'Proof of financial support (1st year costs)', required: true },
      { doc: 'Academic transcripts and test scores', required: true },
      { doc: 'Poonawala Fincorp Sanction Letter', required: true, isBankDoc: true },
      { doc: 'University acceptance letter', required: true },
      { doc: 'Visa interview appointment confirmation', required: true },
    ],
    tips: [
      'Book your DS-160 + interview slot as soon as you receive your I-20 — slots fill 4–6 weeks out',
      'The Poonawala sanction letter directly counts as proof of financial support at the embassy',
      'STEM OPT extension (36 months total) requires employer sponsorship — plan early',
      'Bring original documents + 2 complete sets of photocopies to the interview',
    ],
    loanBenefit: 'The Poonawala Fincorp sanction letter is accepted by the US Embassy as Proof of Funds, eliminating the need to show a large balance in your bank account.',
  },
  'United Kingdom': {
    flag: '🇬🇧',
    visaType: 'UK Student Visa',
    authority: 'UK Home Office (UKVI)',
    officialUrl: 'https://www.gov.uk/student-visa',
    color: '#DC2626',
    processingTime: '3–8 weeks',
    fee: '₹64,380',
    feeBreakdown: [
      { item: 'Visa Application Fee', amount: '₹40,740 (£490)' },
      { item: 'Immigration Health Surcharge (IHS)', amount: '₹23,640 (£284/yr est.)' },
    ],
    postStudyWork: 'Graduate Route: 2 years (3 years for PhD)',
    interviewCities: [],
    documents: [
      { doc: 'CAS (Confirmation of Acceptance for Studies)', required: true },
      { doc: 'Valid passport', required: true },
      { doc: 'Proof of funds — £1,334/month London, £1,023/month elsewhere', required: true },
      { doc: 'IELTS Academic (6.0–7.0 depending on university)', required: true },
      { doc: 'Tuberculosis test certificate (mandatory for Indians)', required: true },
      { doc: 'Poonawala Fincorp Sanction Letter', required: true, isBankDoc: true },
      { doc: 'Parental consent letter (if under 18)', required: false },
    ],
    tips: [
      'Book your TB test early — specific approved clinics only, takes 1–2 weeks',
      'Your CAS number is issued by the university — keep it safe, it expires in 6 months',
      'Apply online through the UKVI portal; biometrics are collected at a Visa Application Centre',
      'IHS covers NHS services — no separate health insurance needed for the UK',
    ],
    loanBenefit: 'UK visa requires evidence of funds for full course fees + living costs. A Poonawala sanction letter covering this amount is accepted as proof.',
  },
  'Canada': {
    flag: '🇨🇦',
    visaType: 'Study Permit',
    authority: 'Immigration, Refugees and Citizenship Canada (IRCC)',
    officialUrl: 'https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada.html',
    color: '#DC2626',
    processingTime: '8–16 weeks (SDS: 20 days)',
    fee: '₹14,400',
    feeBreakdown: [
      { item: 'Study Permit Fee', amount: '₹9,200' },
      { item: 'Biometrics Fee', amount: '₹5,200' },
    ],
    postStudyWork: 'PGWP: Up to 3 years (matches study duration)',
    interviewCities: [],
    documents: [
      { doc: 'Letter of Acceptance from a DLI (Designated Learning Institution)', required: true },
      { doc: 'Proof of financial support — ₹12,60,000/year + tuition', required: true },
      { doc: 'Valid passport', required: true },
      { doc: 'GIC (Guaranteed Investment Certificate) for SDS stream', required: false },
      { doc: 'IELTS 6.0+ (for SDS fast-track)', required: false },
      { doc: 'Medical exam (if required)', required: false },
      { doc: 'Poonawala Fincorp Sanction Letter', required: true, isBankDoc: true },
      { doc: 'Biometrics enrollment', required: true },
    ],
    tips: [
      'SDS (Student Direct Stream) with a GIC + IELTS 6.0+ cuts processing to ~20 days — highly recommended',
      'Your PGWP duration equals your program length — choose a 2-year program for a 2-year work permit',
      'Apply online via IRCC; biometrics must be given in person at a VAC in India',
      'Quebec has separate immigration rules — check Arrima portal if studying in Quebec',
    ],
    loanBenefit: 'Canada IRCC accepts bank-issued proof of funds. The Poonawala sanction letter combined with a GIC meets the financial requirement for SDS.',
  },
  'Germany': {
    flag: '🇩🇪',
    visaType: 'National Student Visa (Type D)',
    authority: 'German Federal Foreign Office',
    officialUrl: 'https://www.studying-in-germany.org/student-visa-for-germany/',
    color: '#D97706',
    processingTime: '6–12 weeks',
    fee: '₹6,800',
    feeBreakdown: [
      { item: 'Visa Application Fee', amount: '₹6,800 (€75)' },
    ],
    postStudyWork: '18-month job-seeking visa post-graduation',
    interviewCities: [],
    documents: [
      { doc: 'University admission letter (or conditional admission)', required: true },
      { doc: 'Blocked account (Sperrkonto) with ₹10,00,000/year', required: true },
      { doc: 'Health insurance certificate', required: true },
      { doc: 'Academic qualification documents (verified by uni-assist)', required: true },
      { doc: 'Passport (valid for 6+ months)', required: true },
      { doc: 'Language proficiency (German B2 or English B2)', required: true },
      { doc: 'Poonawala Fincorp Sanction Letter (supplementary)', required: false, isBankDoc: true },
      { doc: 'Curriculum Vitae', required: true },
    ],
    tips: [
      'Germany requires a Blocked Account (Sperrkonto) — open one with Deutsche Bank, Fintiba, or Expatrio early (takes 2–4 weeks)',
      'Most public German universities charge ZERO tuition — your loan mainly covers living and blocked account costs',
      'After graduation, you get 18 months to find a job — one of the best post-study work policies in Europe',
      'The blocked account amount can come from your Poonawala loan disbursement',
    ],
    loanBenefit: 'Germany requires a blocked account, not just a sanction letter. The Poonawala loan can be disbursed directly to fund your Sperrkonto.',
  },
  'Australia': {
    flag: '🇦🇺',
    visaType: 'Student Visa (Subclass 500)',
    authority: 'Australian Department of Home Affairs',
    officialUrl: 'https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500',
    color: '#059669',
    processingTime: '4–8 weeks',
    fee: '₹38,800',
    feeBreakdown: [
      { item: 'Visa Application Charge', amount: '₹38,800 (AUD 710)' },
    ],
    postStudyWork: 'Subclass 485: 2 yrs (bachelor\'s), 3 yrs (master\'s), 4 yrs (PhD)',
    interviewCities: [],
    documents: [
      { doc: 'CoE (Confirmation of Enrolment)', required: true },
      { doc: 'Genuine Temporary Entrant (GTE) statement', required: true },
      { doc: 'IELTS Academic 5.5–6.5 (depending on provider)', required: true },
      { doc: 'Financial capacity — ₹13,40,000/year + tuition', required: true },
      { doc: 'OSHC (Overseas Student Health Cover)', required: true },
      { doc: 'Valid passport', required: true },
      { doc: 'Poonawala Fincorp Sanction Letter', required: true, isBankDoc: true },
    ],
    tips: [
      'GTE (Genuine Temporary Entrant) is crucial — clearly explain why you plan to return after studies',
      'OSHC must be arranged before applying — purchase it from a DHET-approved provider',
      'Australia\'s Subclass 485 post-study work visa is one of the most generous in the world',
      'You can work 48 hours per fortnight (2 weeks) during study — factor this into your financial planning',
    ],
    loanBenefit: 'Australia requires proof of sufficient funds for first-year tuition + ₹13.4L living costs. A Poonawala sanction letter covering this is accepted.',
  },
};

const COUNTRY_ORDER = ['United States', 'United Kingdom', 'Canada', 'Germany', 'Australia'];

export default function VisaAssistancePage() {
  const { profile } = useAppStore();

  // Default to user's target country if available, else US
  const defaultCountry = COUNTRY_ORDER.includes(profile.targetCountry || '')
    ? profile.targetCountry!
    : 'United States';

  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const visa = visaData[selectedCountry as keyof typeof visaData];

  return (
    <div className="page-container">
      <div className="section-label"><Plane size={14} /> Visa Assistance Centre</div>
      <h1 className="page-title">Student Visa Guide</h1>
      <p className="page-subtitle" style={{ marginBottom: 32 }}>
        Country-specific visa requirements, document checklists, processing timelines, and how your Poonawala loan sanction letter helps at the embassy.
      </p>

      {/* Country Selector */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 32, flexWrap: 'wrap' }}>
        {COUNTRY_ORDER.map(country => {
          const v = visaData[country as keyof typeof visaData];
          const active = country === selectedCountry;
          return (
            <button
              key={country}
              onClick={() => setSelectedCountry(country)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 18px', borderRadius: 'var(--radius-full)',
                border: active ? `2px solid ${v.color}` : '1px solid var(--border)',
                background: active ? `${v.color}10` : 'var(--bg-card)',
                color: active ? v.color : 'var(--text-secondary)',
                fontWeight: active ? 700 : 500, fontSize: 14,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: 18 }}>{v.flag}</span>
              {country}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'flex-start' }}>

        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Hero Visa Card */}
          <div className="card-static" style={{
            padding: 28,
            borderLeft: `4px solid ${visa.color}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{visa.flag}</div>
                <h2 style={{ fontSize: 22, fontWeight: 800 }}>{visa.visaType}</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{visa.authority}</p>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {[
                  { icon: Clock, label: 'Processing', value: visa.processingTime, color: '#D97706' },
                  { icon: DollarSign, label: 'Total Fees', value: visa.fee, color: visa.color },
                  { icon: Briefcase, label: 'Post-Study Work', value: visa.postStudyWork, color: '#059669' },
                ].map((item, i) => (
                  <div key={i} style={{
                    padding: '12px 16px', borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-elevated)', minWidth: 160,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <item.icon size={14} color={item.color} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{item.label}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <a
              href={visa.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 16, fontSize: 12, color: visa.color, fontWeight: 600, textDecoration: 'none' }}
            >
              <ExternalLink size={12} /> Official Government Source
            </a>
          </div>

          {/* Document Checklist */}
          <div className="card-static" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileText size={18} color={visa.color} /> Document Checklist
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {visa.documents.map((d, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', borderRadius: 'var(--radius-md)',
                  background: d.isBankDoc ? `${visa.color}0A` : 'var(--bg-elevated)',
                  border: d.isBankDoc ? `1px solid ${visa.color}30` : '1px solid transparent',
                }}>
                  <CheckCircle2
                    size={18}
                    color={d.required ? visa.color : 'var(--text-muted)'}
                    style={{ flexShrink: 0 }}
                  />
                  <span style={{ fontSize: 14, fontWeight: d.isBankDoc ? 700 : 500, flex: 1 }}>
                    {d.doc}
                  </span>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    {d.isBankDoc && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: '2px 8px',
                        borderRadius: 'var(--radius-full)', background: visa.color, color: 'white',
                      }}>LOAN DOC</span>
                    )}
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      background: d.required ? 'var(--success-bg)' : 'var(--bg-subtle)',
                      color: d.required ? 'var(--success)' : 'var(--text-muted)',
                    }}>{d.required ? 'Required' : 'Optional'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fee Breakdown */}
          <div className="card-static" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <DollarSign size={18} color={visa.color} /> Fee Breakdown
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {visa.feeBreakdown.map((f, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)',
                }}>
                  <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{f.item}</span>
                  <span style={{ fontSize: 15, fontWeight: 800 }}>{f.amount}</span>
                </div>
              ))}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '14px 16px', borderRadius: 'var(--radius-md)',
                background: `${visa.color}10`, border: `1px solid ${visa.color}30`,
              }}>
                <span style={{ fontSize: 14, fontWeight: 700 }}>Total Visa Cost</span>
                <span style={{ fontSize: 16, fontWeight: 900, color: visa.color }}>{visa.fee}</span>
              </div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
              * Visa costs are covered under your Poonawala Fincorp education loan (miscellaneous expenses clause).
            </p>
          </div>

          {/* Interview Wait Times (US only) */}
          {visa.interviewCities.length > 0 && (
            <div className="card-static" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={18} color={visa.color} /> Current US Embassy Interview Wait Times
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {visa.interviewCities.map((c, i) => (
                  <div key={i} style={{
                    padding: '14px', borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-elevated)', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{c.city}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.wait}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
                Source: travel.state.gov. Wait times vary — book as soon as I-20 is received.
              </p>
            </div>
          )}

          {/* Tips */}
          <div className="card-static" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={18} color="#D97706" /> Expert Tips for {selectedCountry}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {visa.tips.map((tip, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 12,
                  padding: '14px 16px', borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-elevated)',
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', background: '#FEF3C7',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 800, color: '#D97706', flexShrink: 0,
                  }}>{i + 1}</div>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sticky sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 88 }}>

          {/* Loan Benefit Callout */}
          <div className="card-static" style={{
            padding: 20,
            background: `linear-gradient(135deg, ${visa.color}10 0%, ${visa.color}05 100%)`,
            border: `1px solid ${visa.color}25`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${visa.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={16} color={visa.color} />
              </div>
              <h4 style={{ fontSize: 13, fontWeight: 700 }}>How Your Poonawala Loan Helps</h4>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
              {visa.loanBenefit}
            </p>
            <Link href="/apply" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '10px 16px', borderRadius: 'var(--radius-md)',
              background: visa.color, color: 'white', textDecoration: 'none',
              fontSize: 13, fontWeight: 700,
            }}>
              Apply for Loan <ArrowRight size={14} />
            </Link>
          </div>

          {/* Visa Timeline */}
          <div className="card-static" style={{ padding: 20 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>Suggested Timeline</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { phase: 'Get Admission', time: 'Month 1', desc: 'Receive offer letter / I-20 / CAS from university' },
                { phase: 'Apply Loan', time: 'Month 1–2', desc: 'Submit Poonawala application — sanction in 3–5 days' },
                { phase: 'Gather Docs', time: 'Month 2', desc: 'Compile visa checklist, TB test, financial proofs' },
                { phase: 'Visa Application', time: 'Month 2–3', desc: 'Submit online application + biometrics / interview' },
                { phase: 'Visa Decision', time: 'Month 3–4', desc: 'Expect decision within processing window' },
                { phase: 'Depart', time: 'Month 4–5', desc: 'Arrange accommodation, forex card, insurance' },
              ].map((step, i, arr) => (
                <div key={i} style={{ display: 'flex', gap: 12, position: 'relative' }}>
                  {i !== arr.length - 1 && (
                    <div style={{ position: 'absolute', left: 11, top: 26, bottom: -8, width: 2, background: 'var(--border)' }} />
                  )}
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                    background: i < 2 ? visa.color : 'var(--bg-elevated)',
                    border: `2px solid ${i < 2 ? visa.color : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 800,
                    color: i < 2 ? 'white' : 'var(--text-muted)',
                    marginTop: 2,
                  }}>{i + 1}</div>
                  <div style={{ paddingBottom: 20 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{step.phase}</div>
                    <div style={{ fontSize: 11, color: visa.color, fontWeight: 600, marginBottom: 2 }}>{step.time}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Copilot Nudge */}
          <div className="card-static" style={{ padding: 16, background: 'var(--bg-elevated)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Info size={14} color="var(--primary)" />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>AI Copilot Available</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 10 }}>
              Ask the AI Copilot specific questions like "What are F-1 visa rejection reasons?" or "How do I write a GTE statement?"
            </p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[`${visa.flag} Visa checklist`, 'Proof of funds help', 'Post-study work rights'].map((q, i) => (
                <span key={i} style={{
                  fontSize: 11, fontWeight: 600, padding: '4px 10px',
                  borderRadius: 'var(--radius-full)', background: 'var(--primary-bg)',
                  color: 'var(--primary)', border: '1px solid var(--primary-border)',
                  cursor: 'pointer',
                }}>{q}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
