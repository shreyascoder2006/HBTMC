import React, { useMemo } from 'react';
import { getTranslation as t } from '../i18n';

export default function PatientTimeline({ history = [], patientName, lang }) {
  // Heuristics: Analyze trends
  const intelligence = useMemo(() => {
    if (history.length < 2) return null;
    
    const last = history[history.length - 1];
    const prev = history[history.length - 2];
    
    return {
      isWorsening: last.risk > prev.risk,
      isChronic: last.duration > 14,
      isDelayed: history.length > 2 && !history.some(v => v.hasTest),
      trendArrow: last.risk > prev.risk ? '↑' : last.risk < prev.risk ? '↓' : '→',
      trendColor: last.risk > prev.risk ? 'var(--neon-red)' : 'var(--neon-green)',
    };
  }, [history]);

  if (history.length === 0) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📅</span>
        <h3>No History Found</h3>
        <p style={{ color: 'var(--text-muted)' }}>Enter a Patient ID (Reg No) or start a new screening to build a timeline.</p>
      </div>
    );
  }

  return (
    <div className="timeline-container fade-in">
      {/* AI Insight Panel */}
      <div className="insight-banner fade-in" style={{ 
        borderColor: intelligence?.isWorsening ? 'var(--neon-red)' : 'var(--primary-cyan)',
        background: intelligence?.isWorsening ? 'rgba(239, 68, 68, 0.05)' : 'rgba(34, 211, 238, 0.05)'
      }}>
        <span className="insight-tag" style={{ 
          background: intelligence?.isWorsening ? 'var(--neon-red)' : 'var(--primary-cyan)' 
        }}>AI Timeline Insight</span>
        <div style={{ flex: 1 }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: intelligence?.isWorsening ? 'var(--neon-red)' : 'white' }}>
            {intelligence?.isWorsening ? 'Clinical Deterioration Warning' : 'Condition Stable'}
          </h4>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {intelligence?.isWorsening 
              ? `Patient ${patientName} shows a worsening trend in symptoms over the last ${history.length} visits. Immediate diagnostic referral is mandated.`
              : `Patient ${patientName} is stable. Continue standard monitoring and complete the current follow-up.`}
          </p>
        </div>
        {intelligence?.isChronic && (
          <div className="alert-pill pulsing-red">CHRONIC COUGH</div>
        )}
      </div>

      <div className="timeline-layout">
        <div className="timeline-line"></div>
        
        {history.slice().reverse().map((visit, index) => {
          const isLatest = index === 0;
          return (
            <div key={visit.id} className={`timeline-node ${isLatest ? 'latest' : ''}`}>
              <div className="node-marker" style={{ 
                background: visit.risk > 60 ? 'var(--neon-red)' : visit.risk > 30 ? 'var(--neon-orange)' : 'var(--neon-green)'
              }}></div>
              
              <div className="glass-card visit-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <span className="visit-date">{new Date(visit.date).toLocaleDateString()}</span>
                    <h3 style={{ margin: '0.2rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Visit {history.length - index}
                      {isLatest && intelligence && (
                        <span style={{ color: intelligence.trendColor, fontSize: '1.2rem', fontWeight: 'bold' }}>
                          {intelligence.trendArrow}
                        </span>
                      )}
                    </h3>
                  </div>
                  <div className="risk-score-mini" style={{ 
                    borderColor: visit.risk > 60 ? 'var(--neon-red)' : 'rgba(255,255,255,0.1)',
                    color: visit.risk > 60 ? 'var(--neon-red)' : 'white'
                  }}>
                    {visit.risk}<span style={{ fontSize: '0.7rem' }}>%</span>
                  </div>
                </div>

                <div className="visit-details">
                  <div className="visit-stat">
                    <span className="label">Symptoms</span>
                    <div className="symptom-badges">
                      {Object.keys(visit.symptoms).filter(k => visit.symptoms[k]).map(s => (
                        <span key={s} className="s-badge">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="visit-stat">
                    <span className="label">Duration</span>
                    <span>{visit.duration} Days</span>
                  </div>
                </div>

                {visit.note && (
                  <p className="visit-note">“{visit.note}”</p>
                )}
                
                {visit.risk > 60 && isLatest && (
                  <div className="action-required">
                    ⚠ RECOMMENDED ACTION: REFER FOR CBNAAT TEST
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .timeline-container { padding: 1rem; }
        .timeline-layout { position: relative; padding-left: 3rem; margin-top: 2rem; }
        .timeline-line { 
          position: absolute; left: 1rem; top: 0; bottom: 0; width: 2px; 
          background: linear-gradient(to bottom, var(--primary-cyan), transparent);
          opacity: 0.3;
        }
        .timeline-node { position: relative; margin-bottom: 2rem; }
        .node-marker {
          position: absolute; left: -2.4rem; top: 1rem; width: 14px; height: 14px;
          border-radius: 50%; box-shadow: 0 0 10px currentColor; z-index: 2;
        }
        .timeline-node.latest .node-marker { scale: 1.3; }
        .visit-card { transition: transform 0.3s ease; border-left: 2px solid rgba(255,255,255,0.1); }
        .visit-card:hover { transform: translateX(5px); }
        .visit-date { color: var(--text-muted); font-size: 0.8rem; font-family: monospace; }
        .risk-score-mini { 
          border: 1px solid; border-radius: 50%; width: 40px; height: 40px;
          display: flex; flex-direction: column; align-items: center; justifyContent: center;
          font-weight: bold; background: rgba(0,0,0,0.2); 
        }
        .visit-details { display: flex; gap: 2rem; margin: 1rem 0; border: 1px solid red; border: none; }
        .visit-stat { display: flex; flex-direction: column; gap: 4px; }
        .visit-stat .label { font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; }
        .symptom-badges { display: flex; gap: 4px; flex-wrap: wrap; }
        .s-badge { font-size: 0.7rem; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; text-transform: capitalize; }
        .visit-note { font-style: italic; font-size: 0.85rem; color: var(--text-muted); margin-top: 1rem; border-left: 2px solid var(--primary-cyan); padding-left: 1rem; }
        .action-required { 
          margin-top: 1.5rem; padding: 0.75rem; border-radius: 6px; 
          background: rgba(239, 68, 68, 0.1); color: var(--neon-red); 
          font-weight: bold; font-size: 0.8rem; text-align: center; border: 1px dashed var(--neon-red);
        }
        .alert-pill { background: var(--neon-red); color: white; padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 800; }
        .pulsing-red { animation: alertPulse 2s infinite; }
      `}} />
    </div>
  );
}
