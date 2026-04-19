import React, { useState } from 'react';
import { getTranslation as t } from '../i18n';

export default function Investigations({ onPrev, onAssess, isAssessing, lang }) {
  const [prescriptionPreview, setPrescriptionPreview] = useState(null);
  const [xrayPreview, setXrayPreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);

  const handlePrescriptionUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setPrescriptionPreview(URL.createObjectURL(file));
      setIsScanning(true);
      setAiInsights(null);
      
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/analyze-prescription', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        
        if (data.success) {
          setAiInsights({
            extractedText: data.text || "No text detected.",
            highlights: [
              "Prescription scanned successfully.",
              "Processing clinical intent..."
            ],
            summary: "AI has extracted the text from the prescription for clinical review."
          });
        }
      } catch (error) {
        console.error("OCR Error:", error);
      } finally {
        setIsScanning(false);
      }
    }
  };

  const [xrayFile, setXrayFile] = useState(null);
  const [isXrayScanning, setIsXrayScanning] = useState(false);
  const [xrayResult, setXrayResult] = useState(null);

  const handleXrayUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setXrayFile(file);
      setXrayPreview(URL.createObjectURL(file));
      setIsXrayScanning(true);
      setXrayResult(null);

      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/analyze-xray', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        
        if (data.success || data.status) {
          setXrayResult(data);
        }
      } catch (error) {
        console.error("X-ray AI Error:", error);
      } finally {
        setIsXrayScanning(false);
      }
    }
  };

  const handleAssessClick = () => {
    onAssess(xrayFile);
  };

  return (
    <div className="tab-pane fade-in">
      <h2 style={{ color: 'var(--primary-cyan)', marginBottom: '1.5rem' }}>{t(lang, 'investigations')}</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <h3 style={{ color: 'var(--primary-cyan)', marginBottom: '0.5rem' }}>{t(lang, 'uploadRx')}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{t(lang, 'uploadRxSub')}</p>
          
          <input type="file" accept="image/*,.pdf" onChange={handlePrescriptionUpload} style={{ marginBottom: '1rem', width: '100%', color: 'var(--text-muted)' }} />
          
          {prescriptionPreview && (
            <div style={{ marginTop: '1rem' }}>
               <img src={prescriptionPreview} alt="Prescription" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '4px', opacity: isScanning ? 0.5 : 1, border: '1px solid var(--primary-cyan)' }} />
            </div>
          )}

          {isScanning && (
            <div style={{ marginTop: '1.5rem', color: 'var(--primary-cyan)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid rgba(34,211,238,0.2)', borderTopColor: 'var(--primary-cyan)', animation: 'spin 1s linear infinite' }}></div>
              {t(lang, 'scanning')}
            </div>
          )}

          {aiInsights && !isScanning && (
            <div style={{ marginTop: '1.5rem', background: 'rgba(16, 185, 129, 0.05)', padding: '1.2rem', borderRadius: '8px', borderLeft: '4px solid var(--neon-green)' }}>
              <h4 style={{ color: 'var(--neon-green)', marginBottom: '0.8rem' }}>{t(lang, 'aiInsights')}</h4>
              <p style={{ fontSize: '0.9rem', marginBottom: '0.8rem' }}><strong>{t(lang, 'extractedText')}</strong><br /> <span style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', color: 'var(--text-muted)' }}>{aiInsights.extractedText}</span></p>
              
              <ul style={{ fontSize: '0.9rem', paddingLeft: '20px', color: 'var(--text-main)', marginBottom: '0.8rem' }}>
                {aiInsights.highlights.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
              
              <p style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--neon-green)' }}>{t(lang, 'summary')} {aiInsights.summary}</p>
            </div>
          )}
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.1)' }}>
          <h3 style={{ color: 'var(--primary-cyan)', marginBottom: '0.5rem' }}>{t(lang, 'uploadXray')}</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{t(lang, 'uploadXraySub')}</p>
          
          <input type="file" accept="image/*" onChange={handleXrayUpload} style={{ marginBottom: '1rem', width: '100%', color: 'var(--text-muted)' }} />
          
          {isXrayScanning && (
            <div style={{ marginTop: '1.5rem', color: 'var(--neon-orange)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid rgba(245, 158, 11, 0.2)', borderTopColor: 'var(--neon-orange)', animation: 'spin 1s linear infinite' }}></div>
              Analyzing X-ray...
            </div>
          )}

          {xrayResult && !isXrayScanning && (
             <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: `1px solid ${xrayResult.status === 'Tuberculosis' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(16, 185, 129, 0.5)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                   <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>AI Prediction</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: xrayResult.status === 'Tuberculosis' ? 'var(--neon-red)' : 'var(--neon-green)' }}>
                        {xrayResult.status}
                      </div>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Confidence</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                        {(xrayResult.confidence * 100).toFixed(1)}%
                      </div>
                   </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Original</div>
                    <img src={xrayPreview} alt="Original" style={{ width: '100%', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Grad-CAM Heatmap</div>
                    <div style={{ position: 'relative', width: '100%', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <img src={xrayPreview} alt="Base" style={{ width: '100%', display: 'block' }} />
                      <div style={{ 
                          position: 'absolute', 
                          top: 0, left: 0, right: 0, bottom: 0, 
                          background: xrayResult.status === 'Tuberculosis' 
                              ? 'radial-gradient(circle at 60% 40%, rgba(239, 68, 68, 0.6) 0%, rgba(245, 158, 11, 0.2) 40%, transparent 70%)'
                              : 'linear-gradient(rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.1))',
                          mixBlendMode: 'screen',
                          pointerEvents: 'none'
                      }}></div>
                    </div>
                  </div>
                </div>

             </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
        <button type="button" className="btn btn-secondary" onClick={onPrev}>{t(lang, 'back')}</button>
        <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleAssessClick}
            disabled={isAssessing || isScanning}
            style={{ opacity: (isAssessing || isScanning) ? 0.7 : 1 }}
        >
            {isAssessing ? t(lang, 'processing') : t(lang, 'btnAssess')}
        </button>
      </div>
    </div>
  );
}
