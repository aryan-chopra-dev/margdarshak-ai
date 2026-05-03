'use client';
import { useState, useEffect } from 'react';
import { scholarships } from '@/data/scholarships';
import { useAppStore } from '@/lib/store';
import { GraduationCap, MapPin, Calendar, IndianRupee, Search, Filter } from 'lucide-react';

export default function ScholarshipsPage() {
  const { profile } = useAppStore();
  const [filter, setFilter] = useState('All');
  const [mounted, setMounted] = useState(false);
  
  const [evaluating, setEvaluating] = useState<string | null>(null);
  const [evalResults, setEvalResults] = useState<Record<string, { percentage: number, reasoning: string }>>({});

  useEffect(() => { setMounted(true); }, []);

  const handleEvaluate = async (scholarship: any) => {
    setEvaluating(scholarship.id);
    try {
      const res = await fetch('/api/scholarships/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scholarship, profile })
      });
      const data = await res.json();
      setEvalResults(prev => ({ ...prev, [scholarship.id]: data }));
    } catch (err) {
      setEvalResults(prev => ({ ...prev, [scholarship.id]: { percentage: 0, reasoning: "Network error mapping real-world variables." } }));
    }
    setEvaluating(null);
  };

  if (!mounted) return null;

  // Auto-sort to prioritize scholarships matching their target country, then "Global"
  const sortedScholarships = [...scholarships].sort((a, b) => {
    if (a.targetCountry === profile.targetCountry && b.targetCountry !== profile.targetCountry) return -1;
    if (a.targetCountry !== profile.targetCountry && b.targetCountry === profile.targetCountry) return 1;
    return 0;
  }).filter(s => filter === 'All' ? true : s.targetCountry === filter || s.targetCountry === 'Global');

  return (
    <div className="page-container">
      <div className="section-label"><GraduationCap size={14} /> AI Scholarship Matcher</div>
      <h1 className="page-title">Financial Aid Database</h1>
      <p className="page-subtitle" style={{ marginBottom: 40, maxWidth: 800 }}>
        An algorithmically filtered database of premium grants and scholarships. Opportunities are auto-sorted based on your target destination ({profile.targetCountry || 'Not set'}) and LRS scoring.
      </p>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32, alignItems: 'center' }}>
        <Filter size={16} color="var(--text-muted)" />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Filter Destination:</span>
        {['All', 'United States', 'United Kingdom', 'Europe', 'Global'].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: filter === f ? 'var(--primary)' : 'var(--bg-card)',
              color: filter === f ? 'white' : 'var(--text-secondary)',
              border: filter === f ? '1px solid var(--primary)' : '1px solid var(--border)',
              transition: 'all 0.2s'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
        {sortedScholarships.map(scholarship => (
          <div key={scholarship.id} className="card-hover" style={{ padding: 24, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
               <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--heading)' }}>{scholarship.name}</h3>
            </div>
            
            <p style={{ fontSize: 14, color: 'var(--primary)', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
               <IndianRupee size={16} /> {scholarship.amount}
            </p>
            
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1, marginBottom: 20 }}>
              {scholarship.eligibility}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {scholarship.tags.map(tag => (
                <span key={tag} style={{ background: 'var(--bg-subtle)', padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
                  {tag}
                </span>
              ))}
            </div>

            <div style={{ padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Provider</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{scholarship.provider}</span>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Deadline</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{scholarship.deadline}</span>
              </div>
            </div>
            
            {evalResults[scholarship.id] ? (
              <div style={{ marginTop: 20, padding: 16, border: '1px solid var(--border)', borderRadius: 8, background: 'var(--primary-bg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                   <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>AI FIT PREDICTION</span>
                   <span style={{ fontSize: 16, fontWeight: 900, color: evalResults[scholarship.id].percentage >= 70 ? 'var(--success)' : 'var(--danger)' }}>
                      {evalResults[scholarship.id].percentage}%
                   </span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                  {evalResults[scholarship.id].reasoning}
                </p>
                <div style={{ marginTop: 16, borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: 12 }}>
                   <a href={scholarship.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'flex', width: '100%' }}>
                     <button className="btn btn-primary" style={{ width: '100%', fontSize: 13, display: 'flex', justifyContent: 'center', gap: 6 }}>
                       Apply on Official Site
                     </button>
                   </a>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 8 }}
                  onClick={() => handleEvaluate(scholarship)}
                  disabled={evaluating === scholarship.id}
                >
                  {evaluating === scholarship.id ? (
                    <>
                      <div style={{ width: 14, height: 14, border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                      <span style={{ color: 'var(--primary)', fontSize: 12 }}>Scanning Web Data...</span>
                    </>
                  ) : (
                    'Check AI Fit'
                  )}
                </button>
                <a href={scholarship.url} target="_blank" rel="noreferrer" style={{ flex: 1, textDecoration: 'none', display: 'flex' }}>
                   <button className="btn btn-primary" style={{ width: '100%', fontSize: 12 }}>
                     Official Portal
                   </button>
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
