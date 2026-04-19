import React, { useMemo } from 'react';
import { getTranslation as t } from '../i18n';

export default function ClinicalExplanationPanel({ risk, symptoms, lang, aiResult, patientHistory = [] }) {
  
  const analysis = useMemo(() => {
    const factors = [];
    let summary = "";
    let interpretation = "";
    let confidence = "Medium";

    // 1. Identify Key Factors
    if (symptoms.coughDuration > 14) factors.push({ text: 'Chronic cough (>14 days)', priority: 'high' });
    if (symptoms.fever) factors.push({ text: 'Persistent fever detected', priority: 'medium' });
    if (symptoms.weightLoss) factors.push({ text: 'Significant weight loss reported', priority: 'high' });
    if (symptoms.hemoptysis) factors.push({ text: 'Hemoptysis (Blood in sputum)', priority: 'urgent' });
    if (symptoms.tbContact === 'Yes') factors.push({ text: 'Direct TB contact history', priority: 'medium' });
    if (aiResult?.status === 'Tuberculosis') factors.push({ text: 'AI X-ray detection matched TB patterns', priority: 'urgent' });

    // 2. Generate Summary Narrative
    if (risk.level === 'HIGH') {
      summary = `The patient is classified as High Risk primarily due to the presence of ${factors.slice(0, 2).map(f => f.text.toLowerCase()).join(' and ')}. These clinical markers are strong indicators of active Tuberculosis.`;
    } else if (risk.level === 'MODERATE') {
      summary = `The Moderate Risk classification is driven by ${factors.length > 0 ? factors[0].text.toLowerCase() : 'minor respiratory symptoms'}. While not definitive, continuous monitoring is required.`;
    } else {
      summary = `The patient currently exhibits no major clinical danger signs. Symptoms appear localized or non-progressive at this stage.`;
    }

    // 3. Clinical Interpretation
    if (symptoms.hemoptysis || aiResult?.status === 'Tuberculosis') {
      interpretation = "Clinical markers indicate an advanced or active pulmonary condition. Risk of community transmission is significantly elevated.";
    } else if (symptoms.coughDuration > 14) {
      interpretation = "Chronic cough duration suggests a persistent respiratory infection. Potential for TB progression if left untreated.";
    } else {
      interpretation = "Symptoms are currently indicative of a standard respiratory infection, but lack the classic multi-symptom TB profile.";
    }

    // 4. Confidence Level
    if (aiResult && factors.length > 3) confidence = "High";
    else if (factors.length < 2) confidence = "Low";

    return { factors, summary, interpretation, confidence };
  }, [risk, symptoms, aiResult]);

  return (
    <div className="explanation-panel fade-in" style={{ marginTop: '2rem' }}>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--primary-cyan)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '1.5rem' }}>🧠</span> AI Clinical Explanation Engine
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
        
        {/* Narrative Summary */}
        <div className="glass-card" style={{ borderLeft: `4px solid ${risk.colorVar}`, padding: '1.2rem' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.8rem', textTransform: 'uppercase' }}>Reasoning & Summary</h4>
          <p style={{ margin: 0, lineHeight: '1.6', fontSize: '0.95rem' }}>{analysis.summary}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '1rem' }}>
          
          {/* Key Factors List */}
          <div className="glass-card" style={{ padding: '1.2rem' }}>
            <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--neon-orange)' }}>⚠</span> Key Risk Factors
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {analysis.factors.length > 0 ? analysis.factors.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                  <div style={{ 
                    width: '6px', height: '6px', borderRadius: '50%', 
                    background: f.priority === 'urgent' ? 'var(--neon-red)' : f.priority === 'high' ? 'var(--neon-orange)' : 'var(--primary-cyan)',
                    boxShadow: f.priority === 'urgent' ? '0 0 10px var(--neon-red)' : 'none'
                  }}></div>
                  {f.text}
                </div>
              )) : <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No significant risk factors detected.</p>}
            </div>
          </div>

          {/* Clinical Interpretation & Confidence */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <div className="glass-card" style={{ padding: '1.2rem', flex: 1 }}>
                <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Interpretation</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-main)', fontStyle: 'italic' }}>
                  "{analysis.interpretation}"
                </p>
             </div>
             
             <div className="glass-card" style={{ padding: '0.8rem 1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Confidence</span>
                <span className={`badge badge-${analysis.confidence.toLowerCase()}`} style={{ fontSize: '0.7rem' }}>
                  {analysis.confidence}
                </span>
             </div>
          </div>

        </div>

        {/* Actionable Recommendation */}
        <div className="glass-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '1.2rem', borderColor: risk.level === 'HIGH' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.1)' }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.8rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--neon-green)' }}>📋</span> Prioritized Recommendation
          </h4>
          <p style={{ margin: 0, fontWeight: 'bold', color: risk.level === 'HIGH' ? 'var(--neon-red)' : 'white' }}>
            {risk.level === 'HIGH' ? 'Immediate clinical referral for CBNAAT Diagnostic Testing mandated.' : 
             risk.level === 'MODERATE' ? 'Symptomatic follow-up within 7 days; recommend standard antibiotics for current infection.' : 
             'Standard observation; patient is currently stable.'}
          </p>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .badge-high { background: var(--neon-red); color: white; }
        .badge-medium { background: var(--neon-orange); color: white; }
        .badge-low { background: #64748b; color: white; }
      `}} />
    </div>
  );
}
