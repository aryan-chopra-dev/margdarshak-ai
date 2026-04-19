'use client';
import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import {
  CalendarDays, CheckCircle2, Circle, ArrowRight,
  BookOpen, FileText, GraduationCap, Plane, Clock
} from 'lucide-react';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function generateTimeline(targetCountry: string) {
  const isUS = targetCountry?.includes('United States');
  const isUK = targetCountry?.includes('United Kingdom');
  const isCanada = targetCountry?.includes('Canada');

  const milestones = [
    { month: 0, title: 'Research Phase', items: ['Shortlist 8-10 universities', 'Compare programs and costs using ROI Calculator', 'Join community forums and webinars'], icon: BookOpen, phase: 'discovery' },
    { month: 1, title: 'Test Preparation', items: ['Register for GRE/GMAT/IELTS', `Target: GRE 320+ or IELTS 7.5+`, 'Take practice tests weekly'], icon: FileText, phase: 'preparation' },
    { month: 2, title: 'Test Dates', items: ['Take GRE/GMAT exam', 'Take IELTS/TOEFL exam', 'Order score reports sent to universities'], icon: CheckCircle2, phase: 'preparation' },
    { month: 3, title: 'Documents Prep', items: ['Request recommendation letters (2-3)', 'Write Statement of Purpose (SOP) drafts', 'Get transcripts notarized/attested'], icon: FileText, phase: 'documentation' },
    { month: 4, title: 'Applications Open', items: ['Finalize university shortlist to 5-6', 'Submit applications (early rounds)', isUS ? 'I-20 form prep for US' : isUK ? 'Prepare CAS application for UK' : 'Check specific country requirements'], icon: GraduationCap, phase: 'application' },
    { month: 5, title: 'Application Deadlines', items: ['Submit remaining applications', 'Follow up on recommendation letters', 'Track application status online'], icon: Clock, phase: 'application' },
    { month: 6, title: 'Admission Results', items: ['Admission offers start arriving', 'Compare offers (scholarships, aid)', 'Accept best offer and pay deposit'], icon: CheckCircle2, phase: 'decision' },
    { month: 7, title: 'Loan Application', items: ['Apply for education loan via Margdarshak', 'Generate Investment Case for parents', 'Upload admit letter → auto-fill application'], icon: FileText, phase: 'loan' },
    { month: 8, title: 'Visa Application', items: [isUS ? 'Book US Embassy visa slot (DS-160)' : isUK ? 'Apply for UK Student Visa' : isCanada ? 'Apply for Canada Study Permit' : 'Apply for student visa', 'Prepare financial documents for visa', 'Attend visa interview'], icon: Plane, phase: 'visa' },
    { month: 9, title: 'Pre-Departure', items: ['Book flights', 'Arrange accommodation', 'Complete forex + travel insurance', 'Attend pre-departure orientation'], icon: Plane, phase: 'departure' },
  ];
  return milestones;
}

const phaseColors: Record<string, string> = {
  discovery: '#6C3CE1',
  preparation: '#0EA5E9',
  documentation: '#F59E0B',
  application: '#10B981',
  decision: '#8B5CF6',
  loan: '#EF4444',
  visa: '#0284C7',
  departure: '#10B981',
};

export default function TimelinePage() {
  const { profile } = useAppStore();
  const timeline = generateTimeline(profile.targetCountry || 'United States');
  const currentMonth = new Date().getMonth();

  // WhatsApp Nudging Simulation State
  const [waMessages, setWaMessages] = useState([
    { role: 'bot', text: `Hi ${profile.name.split(' ')[0] || 'Aryan'}! I'm your Margdarshak AI guide. Based on your timeline, you have a GRE test target in 30 days. Have you started mock tests?` }
  ]);
  const [waInput, setWaInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const waScrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    waScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [waMessages]);

  const sendWaMessage = async () => {
    if (!waInput.trim()) return;
    const msg = waInput.trim();
    setWaInput('');
    setWaMessages(prev => [...prev, { role: 'user', text: msg }]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/whatsapp/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ From: '+91 9876543210', Body: msg, ProfileName: profile.name })
      });
      const data = await res.json();
      
      await new Promise(r => setTimeout(r, 1200)); // Simulate delay
      setWaMessages(prev => [...prev, { role: 'bot', text: data.messageGenerated }]);
    } catch(err) {
      console.error(err);
      setWaMessages(prev => [...prev, { role: 'bot', text: "Sorry, I couldn't connect to the webhook." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="page-container">
      <div className="section-label"><CalendarDays size={14} /> Study Timeline & AI Nudges</div>
      <h1 className="page-title">Your Action Plan</h1>
      <p className="page-subtitle" style={{ marginBottom: 48 }}>
        Personalized timeline synchronized with our WhatsApp transactional engine.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40, alignItems: 'flex-start' }}>
        
        {/* Left: Master Timeline */}
        <div style={{ position: 'relative', paddingLeft: 40 }}>
          <div style={{
            position: 'absolute', left: 18, top: 0, bottom: 0, width: 3,
            background: 'linear-gradient(180deg, var(--primary), var(--accent), var(--success))',
            borderRadius: 2,
          }} />

          {timeline.map((m, i) => {
            const color = phaseColors[m.phase] || 'var(--primary)';
            const Icon = m.icon;
            const startMonth = (currentMonth + m.month) % 12;

            return (
              <div key={i} style={{ position: 'relative', marginBottom: 32, paddingLeft: 36 }}>
                <div style={{
                  position: 'absolute', left: -31, top: 4,
                  width: 28, height: 28, borderRadius: '50%',
                  background: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 0 0 4px white, 0 0 0 5px ${color}33`,
                }}>
                  <Icon size={14} color="white" />
                </div>

                <div className="card-static" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <span style={{
                      fontSize: 12, fontWeight: 800, color, padding: '2px 10px',
                      borderRadius: 'var(--radius-full)', background: `${color}12`,
                      textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>
                      {MONTHS[startMonth]} — Month {m.month + 1}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{m.phase}</span>
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 12 }}>{m.title}</h3>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {m.items.map((item, j) => (
                      <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'var(--text-secondary)' }}>
                        <Circle size={8} color={color} fill={color} style={{ flexShrink: 0 }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: WhatsApp Mobile UI Simulator */}
        <div style={{ position: 'sticky', top: 88 }}>
          <div style={{
            background: 'white', borderRadius: 32, border: '8px solid #F3F4F6',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', height: 600,
            display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }}>
            {/* WhatsApp Header */}
            <div style={{
              background: '#075E54', padding: '16px 20px', color: 'white',
              display: 'flex', alignItems: 'center', gap: 12
            }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#128C7E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                M
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 'bold' }}>Margdarshak AI</div>
                <div style={{ fontSize: 11, opacity: 0.8 }}>Active WhatsApp Bot</div>
              </div>
            </div>

            {/* WhatsApp Chat Area */}
            <div style={{
              flex: 1, background: '#E5DDD5', padding: '16px', overflowY: 'auto',
              display: 'flex', flexDirection: 'column', gap: 8
            }}>
              <div style={{ alignSelf: 'center', background: '#e1f5fe', padding: '4px 10px', borderRadius: 8, fontSize: 11, color: '#0288d1', marginBottom: 8 }}>
                Connected to Timeline Webhook
              </div>
              
              {waMessages.map((m, idx) => (
                <div key={idx} style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  background: m.role === 'user' ? '#DCF8C6' : 'white',
                  padding: '10px 14px', borderRadius: 12, borderTopRightRadius: m.role === 'user' ? 0 : 12,
                  borderTopLeftRadius: m.role === 'bot' ? 0 : 12,
                  maxWidth: '85%', fontSize: 14, color: '#303030',
                  boxShadow: '0 1px 1px rgba(0,0,0,0.05)'
                }}>
                  {m.text}
                </div>
              ))}
              
              {isTyping && (
                <div style={{ alignSelf: 'flex-start', background: 'white', padding: '10px 14px', borderRadius: 12, borderTopLeftRadius: 0, fontSize: 13, color: '#888' }}>
                  typing...
                </div>
              )}
              <div ref={waScrollRef} />
            </div>

            {/* WhatsApp Input */}
            <div style={{ padding: '12px 16px', background: '#F0F0F0', borderTop: '1px solid #ddd', display: 'flex', gap: 8 }}>
              <input 
                style={{ flex: 1, background: 'white', border: 'none', borderRadius: 20, padding: '10px 16px', fontSize: 14, outline: 'none' }}
                placeholder="Type a message..."
                value={waInput}
                onChange={e => setWaInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendWaMessage()}
              />
              <button 
                onClick={sendWaMessage}
                style={{ width: 40, height: 40, borderRadius: '50%', background: '#075E54', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowRight size={18} color="white" />
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-muted)' }}>
            Try sending: "Yes, send me practice tests" to see webhook parsing.
          </div>
        </div>
      </div>
    </div>
  );
}
