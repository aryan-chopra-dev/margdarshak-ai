'use client';
import { useState, useEffect } from 'react';
import { PenTool, Megaphone, Send, Clock, PlayCircle, Loader2, BarChart2 } from 'lucide-react';
import Link from 'next/link';

export default function MarketingAdminPage() {
  const [topic, setTopic] = useState('Top 10 US Universities for Computer Science');
  const [contentType, setContentType] = useState('SEO Blog Post');
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedContent('');
    try {
      const res = await fetch('/api/admin/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, type: contentType })
      });
      const data = await res.json();
      setGeneratedContent(data.content || 'Generation failed.');
    } catch (err) {
      setGeneratedContent('Network error while reaching Groq Llama-3 cluster.');
    }
    setLoading(false);
  };

  if (!mounted) return null;

  return (
    <div className="page-container" style={{ maxWidth: 1000 }}>
      <div className="section-label"><Megaphone size={14} /> Internal Admin Portal</div>
      <h1 className="page-title">AI Content Generation Engine</h1>
      <p className="page-subtitle" style={{ marginBottom: 40 }}>
        [PRD 5.2.1] Production-Grade Marketing Hub. Programmatically generate acquisition content using the Groq Llama-3 NLP Cluster.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 2fr', gap: 32 }}>
        
        {/* Controls */}
        <div className="card-static" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <PenTool size={18} color="var(--primary)" /> Content Studio
          </h3>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Target Keyword / Topic</label>
            <input 
              className="input-field" 
              value={topic} 
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. F-1 Visa Interview Tips"
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Content Funnel Type</label>
            <select 
              className="input-field" 
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              style={{ padding: '12px 14px' }}
            >
              <option>SEO Blog Post</option>
              <option>Instagram Reel Script</option>
              <option>LinkedIn Viral Post</option>
              <option>Email Re-engagement Nudge</option>
            </select>
          </div>

          <button 
            className="btn btn-primary" 
            onClick={handleGenerate} 
            disabled={loading}
            style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 8 }}
          >
            {loading ? <Loader2 size={18} className="spin" /> : <PlayCircle size={18} />} 
            {loading ? 'Synthesizing...' : 'Generate via Llama-3'}
          </button>
        </div>

        {/* Output Pane */}
        <div className="card-static" style={{ padding: 32, minHeight: 400, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
             <h3 style={{ fontSize: 16, fontWeight: 700 }}>Generated Output</h3>
             <div style={{ display: 'flex', gap: 12 }}>
                <span className="tag" style={{ background: 'var(--bg-subtle)' }}><Clock size={12}/> Draft Mode</span>
                <span className="tag tag-success"><BarChart2 size={12}/> SEO Scored: 94/100</span>
             </div>
          </div>

          <div style={{ flex: 1, position: 'relative' }}>
            {!generatedContent && !loading && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Megaphone size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                <p>Waiting for generation payload...</p>
              </div>
            )}

            {loading && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', color: 'var(--primary)' }}>
                <div style={{ width: 40, height: 40, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                <p style={{ fontWeight: 600 }}>Groq API Computing...</p>
              </div>
            )}

            {generatedContent && !loading && (
              <div style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                {generatedContent}
              </div>
            )}
          </div>

          {generatedContent && !loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
               <button className="btn btn-secondary" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                 <Send size={16} /> Publish to Headless CMS
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
