import React from 'react';
import { getTranslation as t } from '../i18n';

export default function DashboardHome({ lang }) {
  return (
    <div className="fade-in">
      <header style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--primary-cyan)' }}>Swasth Saans Hub</h2>
        <p style={{ color: 'var(--text-muted)' }}>{t(lang, 'appSubtitle')}</p>
      </header>

      <div className="stats-grid">
        <div className="glass-card stat-card">
          <span className="stat-value" style={{ color: 'var(--primary-cyan)' }}>1,284</span>
          <span className="stat-label">Total Screened</span>
        </div>
        <div className="glass-card stat-card pulse-red">
          <span className="stat-value" style={{ color: 'var(--neon-red)' }}>42</span>
          <span className="stat-label">High Risk Identified</span>
        </div>
        <div className="glass-card stat-card">
          <span className="stat-value" style={{ color: 'var(--neon-orange)' }}>156</span>
          <span className="stat-label">Moderate Risk</span>
        </div>
        <div className="glass-card stat-card">
          <span className="stat-value" style={{ color: 'var(--neon-green)' }}>12</span>
          <span className="stat-label">Live Alerts</span>
        </div>
      </div>

      <div className="insight-banner">
        <span className="insight-tag">AI Insight</span>
        <p style={{ fontSize: '0.95rem' }}>
          System detected high TB risk clusters in the <strong>Dharavi / Kurla region</strong> based on recent demographics. Recommend increasing mobile screening vans.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Active Screening Trends</h3>
          <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '8px', paddingBottom: '1rem' }}>
             {[40, 65, 45, 90, 70, 85, 60].map((h, i) => (
               <div key={i} style={{ flex: 1, height: `${h}%`, background: 'linear-gradient(to top, var(--primary-cyan), transparent)', borderRadius: '4px 4px 0 0' }}></div>
             ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Recent High Risk Cases</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {['Rahul Sharma', 'Sunita Patil', 'Amit Deshmukh'].map((name, i) => (
              <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                <span style={{ fontSize: '0.9rem' }}>{name}</span>
                <span className="badge badge-high">URGENT</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
