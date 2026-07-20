'use client';
import { useState, useEffect } from 'react';
import { 
  FileCheck, Shield, ArrowLeft, Loader2, X, Check, Search,
  Award, Building2, Calendar, IndianRupee, CreditCard, ShieldAlert,
  ThumbsUp, ThumbsDown
} from 'lucide-react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';

export default function AdminLoansPage() {
  const { profile } = useAppStore();
  const [loans, setLoans] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/loans?email=${encodeURIComponent(profile.email)}`);
      const data = await res.json();
      if (res.ok) {
        setLoans(data.loans || []);
      } else {
        alert(data.error || 'Failed to load loans');
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching loan applications');
    } finally {
      setLoading(false);
    }
  };

  const handleLoanAction = async (loanId: string, action: 'approve' | 'reject') => {
    if (!confirm(`Are you sure you want to ${action} this loan application?`)) return;
    setActionLoading(loanId);
    try {
      const res = await fetch('/api/admin/loans/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loanId, action }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchLoans();
      } else {
        alert(data.error || 'Action failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredLoans = loans.filter(l => {
    const q = search.toLowerCase();
    return (
      l.userName.toLowerCase().includes(q) ||
      l.userEmail.toLowerCase().includes(q) ||
      l.universityName.toLowerCase().includes(q) ||
      l.referenceId.toLowerCase().includes(q)
    );
  });

  return (
    <div className="page-container" style={{ maxWidth: 1200 }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'none', fontSize: 14 }}>
          <ArrowLeft size={16} /> Back to Admin Hub
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 className="page-title">Loan Approval Console</h1>
          <p className="page-subtitle">Review credit files, LRS metric alignments, and sanction or decline student loan requests.</p>
        </div>
        <div className="tag tag-success" style={{ padding: '8px 16px', fontSize: 13 }}>
          Total Applications: {loans.length}
        </div>
      </div>

      {/* Controls & Search */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            className="input-field" 
            placeholder="Search by student name, email, university, or reference ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 44 }}
          />
        </div>
      </div>

      {/* Loans table */}
      <div className="card-static" style={{ padding: 0, overflowX: 'auto', borderRadius: 'var(--radius-lg)' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
            <Loader2 size={32} className="spin" style={{ margin: '0 auto 12px' }} />
            <p>Loading applications catalog...</p>
          </div>
        ) : filteredLoans.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
            <FileCheck size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
            <p>No loan applications found matching search.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
            <thead>
              <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px 20px', fontWeight: 700 }}>Reference / Date</th>
                <th style={{ padding: '16px 20px', fontWeight: 700 }}>Student details</th>
                <th style={{ padding: '16px 20px', fontWeight: 700 }}>University & Lender</th>
                <th style={{ padding: '16px 20px', fontWeight: 700 }}>Uploaded Documents</th>
                <th style={{ padding: '16px 20px', fontWeight: 700 }}>LRS Score</th>
                <th style={{ padding: '16px 20px', fontWeight: 700 }}>Principal (INR)</th>
                <th style={{ padding: '16px 20px', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '16px 20px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLoans.map((l) => {
                const dateStr = new Date(l.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                const lrsColor = l.lrsScore >= 700 ? '#10B981' : l.lrsScore >= 600 ? '#3B82F6' : '#F59E0B';
                const isPending = l.status === 'pending';

                return (
                  <tr key={l.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--primary)' }}>#{l.referenceId}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{dateStr}</div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--heading)' }}>{l.userName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{l.userEmail}</div>
                      {l.userPhone && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{l.userPhone}</div>}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><Building2 size={13}/> {l.universityName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Lender: <strong>{l.lenderName}</strong></div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      {l.docsUploaded && l.docsUploaded.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {l.docsUploaded.map((d: string) => (
                            <span key={d} className="tag tag-success" style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4, width: 'fit-content' }}>
                              <FileCheck size={10} /> {d}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          No documents uploaded
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 800, color: lrsColor }}>
                        <Award size={15} /> {l.lrsScore}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: 700 }}>
                      ₹{(l.principalINR / 100000).toFixed(1)} Lakhs
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span className={`tag ${
                        l.status === 'approved' ? 'tag-success' : 
                        l.status === 'rejected' ? 'tag-danger' : 'tag-warning'
                      }`} style={{ textTransform: 'capitalize' }}>
                        {l.status === 'approved' ? 'Sanctioned' : l.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      {isPending ? (
                        <div style={{ display: 'inline-flex', gap: 8 }}>
                          <button 
                            className="btn btn-success" 
                            onClick={() => handleLoanAction(l.id, 'approve')}
                            disabled={actionLoading === l.id}
                            style={{ padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            <Check size={14} /> Sanction
                          </button>
                          <button 
                            className="btn btn-danger" 
                            onClick={() => handleLoanAction(l.id, 'reject')}
                            disabled={actionLoading === l.id}
                            style={{ padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                          {l.status === 'approved' ? '✓ Sanctioned' : '✗ Declined'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
