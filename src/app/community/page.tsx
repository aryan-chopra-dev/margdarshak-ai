'use client';
import { useAppStore } from '@/lib/store';
import { universities } from '@/data/universities';
import { 
  Users, MessageCircle, MapPin, GraduationCap, 
  Video, Compass, Star, Camera
} from 'lucide-react';
import { useState, useEffect } from 'react';

const DUMMY_PEERS = [
  { id: 1, name: 'Aditi S.', from: 'Mumbai, IN', program: 'Computer Science', intake: 'Fall 2026', match: 98, avatar: 'A' },
  { id: 2, name: 'Rahul M.', from: 'Bengaluru, IN', program: 'Data Science', intake: 'Fall 2026', match: 92, avatar: 'R' },
  { id: 3, name: 'Sneha P.', from: 'Delhi, IN', program: 'Engineering', intake: 'Spring 2027', match: 85, avatar: 'S' },
  { id: 4, name: 'Vikram K.', from: 'Pune, IN', program: 'MBA', intake: 'Fall 2026', match: 78, avatar: 'V' }
];

export default function CommunityPage() {
  const { profile } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'peers' | 'tours'>('peers');
  
  useEffect(() => { setMounted(true); }, []);

  const topUni = universities.find(u => profile.shortlistedUniversities?.includes(u.id)) || universities[0];

  if (!mounted) return null;

  return (
    <div className="page-container">
      <div className="section-label"><Users size={14} /> Peer Connect & Campus Life</div>
      <h1 className="page-title">Community & Discovery</h1>
      <p className="page-subtitle" style={{ marginBottom: 32 }}>
        Connect with students heading to {topUni.name} and explore your future campus before you arrive.
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 32, borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
        <button 
          onClick={() => setActiveTab('peers')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 20, 
            fontSize: 14, fontWeight: 700, cursor: 'pointer', border: 'none',
            background: activeTab === 'peers' ? 'var(--primary)' : 'var(--bg-elevated)',
            color: activeTab === 'peers' ? 'white' : 'var(--text)',
            transition: 'all 0.2s'
          }}
        >
          <MessageCircle size={16} /> Find Peers
        </button>
        <button 
          onClick={() => setActiveTab('tours')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 20, 
            fontSize: 14, fontWeight: 700, cursor: 'pointer', border: 'none',
            background: activeTab === 'tours' ? 'var(--primary)' : 'var(--bg-elevated)',
            color: activeTab === 'tours' ? 'white' : 'var(--text)',
            transition: 'all 0.2s'
          }}
        >
          <Camera size={16} /> Virtual Tours
        </button>
      </div>

      {activeTab === 'peers' ? (
        <div style={{ display: 'flex', gap: 24, flexDirection: 'column' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div>
               <h3 style={{ fontSize: 18, fontWeight: 800 }}>Cohort Matcher Active</h3>
               <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                 We found 43 students pursuing {profile.targetField || 'Postgraduate Studies'} at {topUni.name}.
               </p>
             </div>
             <div style={{ padding: '8px 16px', background: 'var(--primary-bg)', color: 'var(--primary)', fontWeight: 700, fontSize: 14, borderRadius: 20 }}>
                Filter by Intake
             </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {DUMMY_PEERS.map(peer => (
              <div key={peer.id} className="card-hover" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                   <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800 }}>
                        {peer.avatar}
                      </div>
                      <div>
                        <div style={{ fontSize: 16, fontWeight: 800 }}>{peer.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          <MapPin size={12} /> {peer.from}
                        </div>
                      </div>
                   </div>
                   <div style={{ background: '#ECFCCB', color: '#4D7C0F', padding: '4px 8px', borderRadius: 8, fontSize: 11, fontWeight: 800 }}>
                     {peer.match}% Match
                   </div>
                 </div>

                 <div style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                      <GraduationCap size={14} color="var(--primary)" /> {peer.program}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                      <Compass size={14} color="#0EA5E9" /> {peer.intake}
                    </div>
                 </div>

                 <button className="btn btn-secondary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 8 }}>
                   <MessageCircle size={16} /> Send Request
                 </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 24, flexDirection: 'column' }}>
           <div className="card-static" style={{ overflow: 'hidden', padding: 0 }}>
             {/* Mock Video Player */}
             <div style={{ width: '100%', height: 400, background: '#111827', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <Video size={48} color="white" opacity={0.2} />
                <div style={{ color: 'white', marginTop: 16, fontWeight: 700 }}>Interactive 360° Campus Tour</div>
                <div style={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', gap: 8 }}>
                  <span style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', color: 'white', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{topUni.name}</span>
                  <span style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', color: 'white', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>Main Hub</span>
                </div>
                <button style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 64, height: 64, borderRadius: '50%', background: 'var(--primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                </button>
             </div>
             
             <div style={{ padding: 24 }}>
               <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Explore {topUni.name}</h3>
               <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
                 Take a self-guided virtual tour of standard facilities, accommodation blocks, and technical labs. Our students who travel to {topUni.country} flag this as highly recommended before committing.
               </p>
               
               <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 }}>Featured Spots</h4>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                 {[
                   { name: 'Student Union', rating: '4.8', type: 'Recreation' },
                   { name: 'Central Library', rating: '4.9', type: 'Academic' },
                   { name: 'PG Housing Block', rating: '4.2', type: 'Accommodation' },
                 ].map((spot, i) => (
                   <div key={i} style={{ padding: 16, border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer' }} className="card-hover">
                     <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{spot.name}</div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{spot.type}</span>
                       <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: '#F59E0B' }}>
                         <Star size={12} fill="#F59E0B" /> {spot.rating}
                       </span>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
