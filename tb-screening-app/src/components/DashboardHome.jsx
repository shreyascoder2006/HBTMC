import React from 'react';
import { getTranslation as t } from '../i18n';

export default function DashboardHome({ lang, alerts = [], mode = 'DOCTOR' }) {
  return (
    <div className="fade-in">
      <header style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: mode === 'FIELD_WORKER' ? '#fbbf24' : 'var(--primary-cyan)' }}>
          {mode === 'FIELD_WORKER' ? 'Field Screening Hub' : 'Swasth Saans Analytics'}
        </h2>
        <p style={{ color: 'var(--text-muted)' }}>{mode === 'FIELD_WORKER' ? 'Quick Access Portal for Frontline Workers' : t(lang, 'appSubtitle')}</p>
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
        {mode === 'DOCTOR' && (
          <div className="glass-card stat-card">
            <span className="stat-value" style={{ color: 'var(--neon-orange)' }}>156</span>
            <span className="stat-label">Moderate Risk</span>
          </div>
        )}
        <div className="glass-card stat-card" style={{ borderColor: alerts.length > 0 ? 'var(--neon-red)' : 'rgba(255,255,255,0.1)' }}>
          <span className="stat-value" style={{ color: alerts.length > 0 ? 'var(--neon-red)' : 'var(--neon-green)', animation: alerts.length > 0 ? 'alertPulse 2s infinite' : 'none' }}>{alerts.length}</span>
          <span className="stat-label">Live Alerts</span>
        </div>
      </div>

      {alerts.length > 0 && (
         <div className="insight-banner fade-in" style={{ borderColor: 'var(--neon-red)', background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.1), transparent)' }}>
            <span className="insight-tag" style={{ background: 'var(--neon-red)' }}>Critical</span>
            <div className="alerts-list" style={{ width: '100%' }}>
               {alerts.map(alert => (
                 <div key={alert.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '0.95rem', margin: 0 }}>{alert.text}</p>
                    <span className="alert-badge-urgent">URGENT</span>
                 </div>
               ))}
            </div>
         </div>
      )}

      {mode === 'DOCTOR' && (
        <div className="insight-banner">
          <span className="insight-tag">AI Insight</span>
          <p style={{ fontSize: '0.95rem' }}>
            System detected high TB risk clusters in the <strong>Dharavi / Kurla region</strong> based on recent demographics. Recommend increasing mobile screening vans.
          </p>
        </div>
      )}
      
      {mode === 'FIELD_WORKER' && (
        <div className="insight-banner" style={{ borderColor: '#fbbf24', background: 'rgba(251, 191, 36, 0.05)' }}>
          <span className="insight-tag" style={{ background: '#fbbf24', color: '#000' }}>Active Task</span>
          <p style={{ fontSize: '0.95rem' }}>
            Priority Zone: <strong>Dharavi Sector 5</strong>. Deploy mobile screening units today.
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: mode === 'DOCTOR' ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
        {mode === 'DOCTOR' && (
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
        )}

        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>{mode === 'FIELD_WORKER' ? 'Field Worker Guide' : 'Recent High Risk Cases'}</h3>
          {mode === 'FIELD_WORKER' ? (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <p>✅ Start new screening from the <strong>Quick Screening</strong> tab.</p>
                <p>✅ Sync clinical data regularly via the <strong>Cloud</strong> icon.</p>
                <p>✅ Ensure <strong>Location Services</strong> are enabled for hotspot mapping.</p>
             </div>
          ) : (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {['Rahul Sharma', 'Sunita Patil', 'Amit Deshmukh'].map((name, i) => (
                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.9rem' }}>{name}</span>
                  <span className="badge badge-high">URGENT</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
