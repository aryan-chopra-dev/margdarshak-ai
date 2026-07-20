'use client';
import { useState, useEffect } from 'react';
import { 
  Users, ShieldAlert, IndianRupee, FileCheck, Shield,
  ArrowRight, Key, GraduationCap, CheckCircle, Clock, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { useAppStore } from '@/lib/store';

export default function AdminDashboardPage() {
  const { profile } = useAppStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch users list
      const usersRes = await fetch(`/api/admin/users?email=${encodeURIComponent(profile.email)}`);
      const usersData = await usersRes.json();
      if (usersRes.ok) {
        setUsers(usersData.users || []);
      }

      // Fetch loans list
      const loansRes = await fetch(`/api/admin/loans?email=${encodeURIComponent(profile.email)}`);
      const loansData = await loansRes.json();
      if (loansRes.ok) {
        setLoans(loansData.loans || []);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  // Compute stats
  const totalStudents = users.length;
  const pendingLoans = loans.filter(l => l.status === 'pending').length;
  const approvedLoans = loans.filter(l => l.status === 'approved');
  const totalSanctionedAmt = approvedLoans.reduce((acc, curr) => acc + curr.principalINR, 0);
  const pendingRoleApprovals = users.filter(u => u.role === 'admin' && u.roleStatus === 'pending').length;

  return (
    <div className="page-container" style={{ maxWidth: 1200 }}>
      <div className="section-label"><Shield size={14} /> Internal Admin Hub</div>
      <h1 className="page-title">Platform Operations Control</h1>
      <p className="page-subtitle" style={{ marginBottom: 40 }}>
        Full administrative control over user onboarding profiles, role hierarchies, and partner lender loan approvals.
      </p>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 40 }}>
        <div className="card-static" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>Registered Users</span>
            <Users size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 900 }}>{loading ? '...' : totalStudents}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Active in Supabase Cloud</div>
        </div>

        <div className="card-static" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>Pending Loan Apps</span>
            <Clock size={20} color="#D97706" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#D97706' }}>{loading ? '...' : pendingLoans}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Requires Admin Sanction</div>
        </div>

        <div className="card-static" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>Total Sanctioned</span>
            <IndianRupee size={20} color="#10B981" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#10B981' }}>
            {loading ? '...' : `₹${(totalSanctionedAmt / 10000000).toFixed(2)} Cr`}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Approved loan volume</div>
        </div>

        <div className="card-static" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>Role Approvals</span>
            <ShieldAlert size={20} color="#EF4444" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#EF4444' }}>{loading ? '...' : pendingRoleApprovals}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Pending admin requests</div>
        </div>
      </div>

      {/* Main Console Navigation */}
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20 }}>Operations Sub-Consoles</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Loan approvals card */}
        <div className="card-static" style={{ padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 220 }}>
          <div>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <FileCheck size={24} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Loan Approval Engine</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Review, sanction, or reject submitted student education loan applications. Access Admit Letters, inspect LRS metrics, and approve partner payouts.
            </p>
          </div>
          <Link href="/admin/loans" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginTop: 24, textDecoration: 'none' }}>
            Open Loan Console <ArrowRight size={15} />
          </Link>
        </div>

        {/* User profile management card */}
        <div className="card-static" style={{ padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 220 }}>
          <div>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(236, 72, 153, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <Users size={24} color="#EC4899" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Profile & Role Management</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Search user directories, edit profile fields, delete user accounts, and approve requestors asking for administrative access roles.
            </p>
          </div>
          <Link href="/admin/users" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginTop: 24, textDecoration: 'none' }}>
            Open Profile Console <ArrowRight size={15} />
          </Link>
        </div>

        {/* Monetization dashboard */}
        <div className="card-static" style={{ padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 200 }}>
          <div>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <IndianRupee size={24} color="#10B981" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Revenue & Analytics</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Inspect qualifying leads conversion metrics, affiliate tracking data, premium subscriber reports, and tertiary commissions.
            </p>
          </div>
          <Link href="/admin/monetization" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginTop: 24, textDecoration: 'none' }}>
            Open Revenue Analytics <ArrowRight size={15} />
          </Link>
        </div>

        {/* Marketing AI generation */}
        <div className="card-static" style={{ padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 200 }}>
          <div>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(217, 119, 6, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <GraduationCap size={24} color="#D97706" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>AI Acquisition Funnel</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              SEO post studio, Instagram reel generator, and LinkedIn viral nudges computed programmatically via the local Groq LLM cluster.
            </p>
          </div>
          <Link href="/admin/marketing" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginTop: 24, textDecoration: 'none' }}>
            Open Content Studio <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}
