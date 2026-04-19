'use client';
import { useState, useMemo } from 'react';
import { universities, allCountries, allPrograms, University } from '@/data/universities';
import { useAppStore } from '@/lib/store';
import {
  Globe, Search, SlidersHorizontal, MapPin, DollarSign,
  Users, TrendingUp, GraduationCap, ExternalLink, Star,
  Heart, ChevronDown
} from 'lucide-react';

export default function CareerNavigatorPage() {
  const { profile, setProfile, addIntentEvent } = useAppStore();
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState(profile.targetCountry || '');
  const [fieldFilter, setFieldFilter] = useState(profile.targetField || '');
  const [typeFilter, setTypeFilter] = useState<'all' | 'abroad' | 'domestic'>('all');
  const [sortBy, setSortBy] = useState<'rank' | 'tuition' | 'earnings' | 'admissionRate'>('rank');
  const [favorites, setFavorites] = useState<string[]>(profile.shortlistedUniversities || []);

  const filtered = useMemo(() => {
    let results = [...universities];
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.city.toLowerCase().includes(q) ||
        u.programs.some(p => p.toLowerCase().includes(q)) ||
        u.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (countryFilter) results = results.filter(u => u.country === countryFilter);
    if (fieldFilter) results = results.filter(u => u.programs.includes(fieldFilter));
    if (typeFilter !== 'all') results = results.filter(u => u.type === typeFilter);

    results.sort((a, b) => {
      switch (sortBy) {
        case 'rank': return (a.qsRank2025 || 999) - (b.qsRank2025 || 999);
        case 'tuition': return a.tuitionUSD - b.tuitionUSD;
        case 'earnings': return b.medianEarnings10yr - a.medianEarnings10yr;
        case 'admissionRate': return b.admissionRate - a.admissionRate;
        default: return 0;
      }
    });
    return results;
  }, [search, countryFilter, fieldFilter, typeFilter, sortBy]);

  const toggleFav = (id: string) => {
    const next = favorites.includes(id)
      ? favorites.filter(f => f !== id)
      : [...favorites, id];
    setFavorites(next);
    setProfile({ shortlistedUniversities: next });
    addIntentEvent(3);
  };

  return (
    <div className="page-container">
      <div className="section-label"><Globe size={14} /> AI Career Navigator</div>
      <h1 className="page-title">Find Your Best-Fit University</h1>
      <p className="page-subtitle" style={{ marginBottom: 32 }}>
        Browse 30+ universities from verified sources — US DOE College Scorecard, QS Rankings 2025, NIRF 2024
      </p>

      {/* Filters */}
      <div className="card-static" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 300px', position: 'relative' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              className="input-field"
              placeholder="Search by university, city, program, or tags..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 42 }}
            />
          </div>
          <select className="input-field" value={countryFilter} onChange={e => setCountryFilter(e.target.value)} style={{ width: 'auto', minWidth: 160 }}>
            <option value="">All Countries</option>
            {allCountries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="input-field" value={fieldFilter} onChange={e => setFieldFilter(e.target.value)} style={{ width: 'auto', minWidth: 160 }}>
            <option value="">All Fields</option>
            {allPrograms.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
          <select className="input-field" value={typeFilter} onChange={e => setTypeFilter(e.target.value as 'all' | 'abroad' | 'domestic')} style={{ width: 'auto', minWidth: 130 }}>
            <option value="all">All Types</option>
            <option value="abroad">Study Abroad</option>
            <option value="domestic">Domestic (India)</option>
          </select>
          <select className="input-field" value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} style={{ width: 'auto', minWidth: 140 }}>
            <option value="rank">Sort: QS Rank</option>
            <option value="tuition">Sort: Tuition ↑</option>
            <option value="earnings">Sort: Earnings ↓</option>
            <option value="admissionRate">Sort: Acceptance ↓</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>
          {filtered.length} universities found
        </span>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          ❤️ {favorites.length} shortlisted
        </span>
      </div>

      {/* University Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filtered.map(uni => (
          <UniversityCard
            key={uni.id}
            uni={uni}
            isFavorite={favorites.includes(uni.id)}
            onToggleFav={() => toggleFav(uni.id)}
          />
        ))}
      </div>
    </div>
  );
}

function UniversityCard({ uni, isFavorite, onToggleFav }: { uni: University, isFavorite: boolean, onToggleFav: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '24px 28px', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
        {/* Left: Rank badge */}
        <div style={{
          width: 56, height: 56, borderRadius: 14, flexShrink: 0,
          background: uni.type === 'abroad' ? 'var(--primary-bg)' : 'var(--accent-bg)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>QS</span>
          <span style={{ fontSize: 20, fontWeight: 900, color: uni.type === 'abroad' ? 'var(--primary)' : 'var(--accent-dark)' }}>
            {uni.qsRank2025 > 0 ? `#${uni.qsRank2025}` : 'N/A'}
          </span>
        </div>

        {/* Middle */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800 }}>{uni.name}</h3>
            <span className={`tag ${uni.type === 'abroad' ? 'tag-primary' : 'tag-accent'}`} style={{ fontSize: 10 }}>
              {uni.type === 'abroad' ? '🌍 Abroad' : '🇮🇳 Domestic'}
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
            <MapPin size={14} /> {uni.city}, {uni.country}
          </p>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <StatPill icon={DollarSign} label="Sticker Tuition/yr" value={`$${uni.tuitionUSD.toLocaleString()}`} />
            {uni.avgNetPriceUSD !== uni.tuitionUSD && (
              <StatPill icon={DollarSign} label="Avg Net Price" value={`$${uni.avgNetPriceUSD.toLocaleString()}`} hint="After aid — matches College Scorecard" />
            )}
            <StatPill icon={TrendingUp} label="Median Earnings" value={`$${uni.medianEarnings10yr.toLocaleString()}`} hint="10 years after entry" />
            <StatPill icon={Users} label="Accept Rate" value={`${(uni.admissionRate * 100).toFixed(1)}%`} />
            <StatPill icon={GraduationCap} label="Students" value={uni.studentSize.toLocaleString()} />
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
          <button
            onClick={onToggleFav}
            style={{
              background: isFavorite ? 'var(--danger-bg)' : 'var(--bg-elevated)',
              border: '1px solid ' + (isFavorite ? 'rgba(239,68,68,0.3)' : 'var(--border)'),
              borderRadius: 'var(--radius-full)',
              width: 40, height: 40, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Heart size={18} color={isFavorite ? 'var(--danger)' : 'var(--text-muted)'} fill={isFavorite ? 'var(--danger)' : 'none'} />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--primary)', fontSize: 12, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            Details <ChevronDown size={14} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
          </button>
        </div>
      </div>

      {/* Programs + expanded */}
      {expanded && (
        <div style={{
          padding: '16px 28px 24px', borderTop: '1px solid var(--border-light)',
          background: 'var(--bg-elevated)',
        }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {uni.programs.map(p => <span key={p} className="tag tag-primary">{p}</span>)}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {uni.tags.map(t => <span key={t} className="tag tag-accent">{t}</span>)}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ExternalLink size={12} />
            Source: {uni.dataSource}
            <a href={uni.sourceUrl} target="_blank" rel="noopener" style={{ color: 'var(--primary)', marginLeft: 4 }}>
              Verify →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function StatPill({ icon: Icon, label, value, hint }: { icon: typeof DollarSign, label: string, value: string, hint?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} title={hint}>
      <Icon size={14} color="var(--text-muted)" />
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}:</span>
      <span style={{ fontSize: 13, fontWeight: 700 }}>{value}</span>
    </div>
  );
}
