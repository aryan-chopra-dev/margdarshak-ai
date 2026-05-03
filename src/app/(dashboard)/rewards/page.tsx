'use client';
import { useAppStore } from '@/lib/store';
import {
  Trophy, Flame, Star, Target, BookOpen, Users,
  Shield, Sparkles, Award, Gift
} from 'lucide-react';

const allBadges = [
  { id: 'explorer', name: 'Explorer', desc: 'Visited the Career Navigator', icon: Target, color: '#6C3CE1' },
  { id: 'calculator', name: 'Number Cruncher', desc: 'Used the ROI Calculator', icon: BookOpen, color: '#0EA5E9' },
  { id: 'predictor', name: 'Fortune Teller', desc: 'Used the Admission Predictor', icon: Star, color: '#F59E0B' },
  { id: 'connector', name: 'Family Connector', desc: 'Generated a Parent Report', icon: Users, color: '#EF4444' },
  { id: 'ready', name: 'Loan Ready', desc: 'LRS Score reached 700+', icon: Shield, color: '#10B981' },
  { id: 'streak3', name: 'Hat-trick', desc: '3 consecutive daily visits', icon: Flame, color: '#F97316' },
  { id: 'streak7', name: 'Weekly Warrior', desc: '7 consecutive daily visits', icon: Flame, color: '#EF4444' },
  { id: 'applied', name: 'First Mover', desc: 'Submitted a loan application', icon: Award, color: '#8B5CF6' },
];

const milestones = [
  { points: 100, reward: 'Priority loan processing (skip the queue)' },
  { points: 250, reward: '0.25% interest rate discount (exclusive)' },
  { points: 500, reward: 'Free visa consultation session' },
  { points: 1000, reward: 'Processing fee waiver (up to ₹10,000)' },
];

export default function RewardsPage() {
  const { badges, streakDays, intentScore } = useAppStore();
  const totalPoints = intentScore * 10 + badges.length * 50 + streakDays * 10;

  return (
    <div className="page-container">
      <div className="section-label"><Trophy size={14} /> Growth Engine</div>
      <h1 className="page-title">Rewards & Achievements</h1>
      <p className="page-subtitle" style={{ marginBottom: 40 }}>
        Earn points and badges as you progress through your education journey.
      </p>

      {/* Top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
        <div className="card-static" style={{ padding: 24, textAlign: 'center' }}>
          <Trophy size={28} color="var(--warning)" style={{ marginBottom: 8 }} />
          <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--warning)' }}>{totalPoints}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Total Points</div>
        </div>
        <div className="card-static" style={{ padding: 24, textAlign: 'center' }}>
          <Flame size={28} color="var(--danger)" style={{ marginBottom: 8 }} />
          <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--danger)' }}>{streakDays}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Day Streak 🔥</div>
        </div>
        <div className="card-static" style={{ padding: 24, textAlign: 'center' }}>
          <Award size={28} color="var(--primary)" style={{ marginBottom: 8 }} />
          <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--primary)' }}>{badges.length}/{allBadges.length}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Badges Earned</div>
        </div>
        <div className="card-static" style={{ padding: 24, textAlign: 'center' }}>
          <Sparkles size={28} color="var(--accent)" style={{ marginBottom: 8 }} />
          <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--accent)' }}>{intentScore}%</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Intent Score</div>
        </div>
      </div>

      {/* Badges */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Badges</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {allBadges.map(b => {
            const earned = badges.includes(b.id);
            return (
              <div key={b.id} className="card-static" style={{
                padding: 20, display: 'flex', alignItems: 'center', gap: 16,
                opacity: earned ? 1 : 0.45,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14,
                  background: earned ? `${b.color}14` : 'var(--bg-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <b.icon size={24} color={earned ? b.color : 'var(--text-muted)'} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: earned ? 'var(--text)' : 'var(--text-muted)' }}>
                    {b.name} {earned && '✓'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{b.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Milestones */}
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20 }}>Reward Milestones</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {milestones.map((m, i) => {
            const reached = totalPoints >= m.points;
            return (
              <div key={i} className="card-static" style={{
                padding: 20, display: 'flex', alignItems: 'center', gap: 16,
                border: reached ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--border)',
                background: reached ? 'var(--success-bg)' : 'var(--bg-card)',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: reached ? 'var(--success)' : 'var(--bg-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Gift size={20} color={reached ? 'white' : 'var(--text-muted)'} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{m.reward}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.points} points needed</div>
                </div>
                <div style={{
                  fontSize: 13, fontWeight: 700,
                  color: reached ? 'var(--success)' : 'var(--text-muted)',
                }}>
                  {reached ? '✓ Unlocked' : `${m.points - totalPoints} more`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
