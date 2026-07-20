'use client';
import { useState, useEffect } from 'react';
import { 
  Users, Search, ShieldCheck, Trash2, Edit3, ArrowLeft, 
  X, Check, Info, Loader2, Award, Phone, Mail, User
} from 'lucide-react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';

export default function AdminUsersPage() {
  const { profile } = useAppStore();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Edit modal state
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    gpa: 0,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?email=${encodeURIComponent(profile.email)}`);
      const data = await res.json();
      if (res.ok) {
        setUsers(data.users || []);
      } else {
        alert(data.error || 'Failed to load users');
      }
    } catch (err) {
      console.error(err);
      alert('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRole = async (userId: string) => {
    setActionLoading(userId);
    try {
      const res = await fetch('/api/admin/users/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'approve_role' }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchUsers();
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

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this profile? This is permanent.')) return;
    setActionLoading(userId);
    try {
      const res = await fetch('/api/admin/users/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'delete_profile' }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchUsers();
      } else {
        alert(data.error || 'Delete failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditClick = (user: any) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      phone: user.phone,
      gpa: user.gpa || 0,
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    // Validate phone if set
    if (editForm.phone) {
      const cleanPhone = editForm.phone.replace(/[\s\-\+]/g, '');
      const last10 = cleanPhone.slice(-10);
      if (last10.length !== 10 || !/^[6-9]\d{9}$/.test(last10)) {
        alert('Please enter a valid 10-digit Indian phone number.');
        return;
      }
    }

    setActionLoading(editingUser.id);
    try {
      const res = await fetch('/api/admin/users/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser.id,
          action: 'edit_profile',
          updates: {
            name: editForm.name,
            phone: editForm.phone,
            gpa: Number(editForm.gpa),
          }
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setEditingUser(null);
        fetchUsers();
      } else {
        alert(data.error || 'Save failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.toLowerCase().includes(q)
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
          <h1 className="page-title">Profile & Role Management</h1>
          <p className="page-subtitle">Inspect student metrics, modify profile fields, and approve role credentials.</p>
        </div>
        <div className="tag tag-success" style={{ padding: '8px 16px', fontSize: 13 }}>
          Total Profiles: {users.length}
        </div>
      </div>

      {/* Controls & Search */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            className="input-field" 
            placeholder="Search by name, email, or phone number..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 44 }}
          />
        </div>
      </div>

      {/* Users table */}
      <div className="card-static" style={{ padding: 0, overflowX: 'auto', borderRadius: 'var(--radius-lg)' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
            <Loader2 size={32} className="spin" style={{ margin: '0 auto 12px' }} />
            <p>Loading profiles directory...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
            <Users size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
            <p>No user profiles matching your filter.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
            <thead>
              <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px 20px', fontWeight: 700 }}>Student details</th>
                <th style={{ padding: '16px 20px', fontWeight: 700 }}>GPA</th>
                <th style={{ padding: '16px 20px', fontWeight: 700 }}>LRS Score</th>
                <th style={{ padding: '16px 20px', fontWeight: 700 }}>Role</th>
                <th style={{ padding: '16px 20px', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '16px 20px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const isPendingAdmin = u.role === 'admin' && u.roleStatus === 'pending';
                const lrsColor = u.lrsScore >= 700 ? '#10B981' : u.lrsScore >= 600 ? '#3B82F6' : '#F59E0B';

                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--heading)' }}>{u.name}</div>
                      <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={12}/> {u.email}</span>
                        {u.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12}/> {u.phone}</span>}
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: 600 }}>{u.gpa > 0 ? `${u.gpa}/10.0` : 'N/A'}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 800, color: lrsColor }}>
                        <Award size={15} /> {u.lrsScore}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span className={`tag ${u.role === 'admin' ? 'tag-primary' : ''}`} style={{ textTransform: 'capitalize' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span className={`tag ${u.roleStatus === 'approved' ? 'tag-success' : 'tag-warning'}`} style={{ textTransform: 'capitalize' }}>
                        {u.roleStatus}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 8 }}>
                        {isPendingAdmin && (
                          <button 
                            className="btn btn-success" 
                            onClick={() => handleApproveRole(u.id)}
                            disabled={actionLoading === u.id}
                            style={{ padding: '6px 12px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}
                          >
                            <ShieldCheck size={14} /> Approve Admin
                          </button>
                        )}
                        <button 
                          className="btn btn-secondary" 
                          onClick={() => handleEditClick(u)}
                          disabled={actionLoading === u.id}
                          style={{ padding: 8 }}
                          title="Edit Profile"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button 
                          className="btn btn-danger" 
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={actionLoading === u.id}
                          style={{ padding: 8 }}
                          title="Delete Profile"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit modal */}
      {editingUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="card-static" style={{ width: '100%', maxWidth: 440, padding: 32, position: 'relative' }}>
            <button 
              onClick={() => setEditingUser(null)}
              style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={20} color="var(--primary)" /> Edit Student Profile
            </h2>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label className="input-label">Student Name</label>
                <input 
                  className="input-field" 
                  value={editForm.name} 
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  required 
                />
              </div>
              <div>
                <label className="input-label">Phone Number</label>
                <input 
                  className="input-field" 
                  value={editForm.phone} 
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              <div>
                <label className="input-label">GPA (0.0 - 10.0)</label>
                <input 
                  type="number" 
                  step="0.1"
                  min="0"
                  max="10"
                  className="input-field" 
                  value={editForm.gpa} 
                  onChange={(e) => setEditForm(prev => ({ ...prev, gpa: parseFloat(e.target.value) || 0 }))}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={actionLoading === editingUser.id}>
                  {actionLoading === editingUser.id ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
