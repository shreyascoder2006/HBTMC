import React from 'react';
import { getTranslation as t } from '../i18n';

export default function ChiefComplaints({ formData, symptoms, onFormChange, onSymptomChange, onNext, onPrev, lang }) {
  return (
    <div className="tab-pane fade-in">
      <h2 style={{ color: 'var(--primary-cyan)', marginBottom: '0.5rem' }}>{t(lang, 'chiefComplaints')}</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{t(lang, 'logSymptoms')}</p>

      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', color: 'var(--primary-cyan)' }}>{t(lang, 'allSymptoms')}</h3>
          <div className="form-group" style={{ maxWidth: '300px' }}>
            <label>{t(lang, 'coughDuration')}</label>
            <input type="number" name="coughDuration" min="0" className="form-control" value={formData.coughDuration} onChange={onFormChange} />
          </div>
          <div className="checkbox-list" style={{ marginTop: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <label className="checkbox-item" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', cursor: 'pointer' }}>
                <input type="checkbox" name="fever" checked={symptoms.fever} onChange={onSymptomChange} />
                {t(lang, 'fever')}
              </div>
              {symptoms.fever && (
                <div style={{ paddingLeft: '28px', marginTop: '4px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>{t(lang, 'feverDays')}</label>
                  <input 
                    type="number" 
                    name="feverDays" 
                    min="0" 
                    className="form-control" 
                    style={{ height: '30px', fontSize: '0.8rem', width: '80px' }} 
                    value={symptoms.feverDays} 
                    onChange={onSymptomChange} 
                  />
                </div>
              )}
            </label>
            <label className="checkbox-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', cursor: 'pointer' }}>
              <input type="checkbox" name="weightLoss" checked={symptoms.weightLoss} onChange={onSymptomChange} />
              {t(lang, 'weightLoss')}
            </label>
            <label className="checkbox-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', cursor: 'pointer' }}>
              <input type="checkbox" name="nightSweats" checked={symptoms.nightSweats} onChange={onSymptomChange} />
              {t(lang, 'nightSweats')}
            </label>
            <label className="checkbox-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', cursor: 'pointer' }}>
              <input type="checkbox" name="hemoptysis" checked={symptoms.hemoptysis} onChange={onSymptomChange} />
              {t(lang, 'hemoptysis')}
            </label>
            <label className="checkbox-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', cursor: 'pointer' }}>
              <input type="checkbox" name="chestPain" checked={symptoms.chestPain} onChange={onSymptomChange} />
              {t(lang, 'chestPain')}
            </label>
            <label className="checkbox-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)', cursor: 'pointer' }}>
              <input type="checkbox" name="breathlessness" checked={symptoms.breathlessness} onChange={onSymptomChange} />
              {t(lang, 'breathlessness')}
            </label>
          </div>
      </div>

      <div className="form-group" style={{ marginTop: '2rem', maxWidth: '350px' }}>
        <label>{t(lang, 'numVisits')}</label>
        <input type="number" name="visits" min="1" className="form-control" value={formData.visits} onChange={onFormChange} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
        <button type="button" className="btn btn-secondary" onClick={onPrev}>{t(lang, 'back')}</button>
        <button type="button" className="btn btn-primary" onClick={onNext}>{t(lang, 'nextInvestigations')}</button>
      </div>
    </div>
  );
}
