import React from 'react';
import { getTranslation as t } from '../i18n';

export default function Demographics({ formData, onChange, onNext, lang, onQuickFill }) {
  return (
    <div className="tab-pane fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ color: 'var(--primary-cyan)', margin: 0 }}>{t(lang, 'patientDemo')}</h2>
        <button 
          type="button" 
          onClick={onQuickFill} 
          className="btn btn-neon" 
          style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
        >
          ⚡ Quick Fill
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="form-group">
          <label>{t(lang, 'patientName')}</label>
          <input type="text" name="patientName" className="form-control" value={formData.patientName} onChange={onChange} required />
        </div>
        <div className="form-group">
          <label>{t(lang, 'age')}</label>
          <input type="number" name="age" min="0" className="form-control" value={formData.age} onChange={onChange} required />
        </div>
        <div className="form-group">
          <label>{t(lang, 'gender')}</label>
          <select name="gender" className="form-control" value={formData.gender} onChange={onChange} required>
            <option value="">{t(lang, 'select')}</option>
            <option value="Male">{t(lang, 'male')}</option>
            <option value="Female">{t(lang, 'female')}</option>
            <option value="Other">{t(lang, 'other')}</option>
          </select>
        </div>
        <div className="form-group">
          <label>{t(lang, 'location')}</label>
          <select name="location" className="form-control" value={formData.location} onChange={onChange}>
            <option value="">{t(lang, 'select')}</option>
            <option value="KEM Hospital">KEM Hospital</option>
            <option value="Cooper Hospital">Cooper Hospital</option>
            <option value="Breach Candy Hospital">Breach Candy Hospital</option>
          </select>
        </div>
        <div className="form-group">
          <label>{t(lang, 'phone')}</label>
          <input type="tel" name="phone" className="form-control" value={formData.phone} onChange={onChange} />
        </div>
        <div className="form-group">
          <label>{t(lang, 'occupation')}</label>
          <input type="text" name="occupation" className="form-control" value={formData.occupation} onChange={onChange} />
        </div>
        <div className="form-group">
          <label>{t(lang, 'tbContact')}</label>
          <select name="tbContact" className="form-control" value={formData.tbContact} onChange={onChange} required>
            <option value="No">{t(lang, 'no')}</option>
            <option value="Yes">{t(lang, 'yes')}</option>
          </select>
        </div>
        <div className="form-group">
          <label>{t(lang, 'aadhar')}</label>
          <input type="text" name="aadhar" maxLength="12" className="form-control" value={formData.aadhar} onChange={onChange} placeholder="12-digit number" />
        </div>
        <div className="form-group">
          <label>{t(lang, 'opd')}</label>
          <input type="text" name="opd" className="form-control" value={formData.opd} onChange={onChange} />
        </div>
        <div className="form-group">
          <label>{t(lang, 'regNo')}</label>
          <input 
            type="text" 
            name="regNo" 
            maxLength="6" 
            className={`form-control ${formData.regNo && formData.regNo.length !== 6 ? 'input-error' : ''}`} 
            value={formData.regNo} 
            onChange={onChange} 
            required 
          />
          {formData.regNo && formData.regNo.length !== 6 && (
            <span style={{ color: 'var(--neon-red)', fontSize: '0.7rem' }}>{t(lang, 'regNoValidation')}</span>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
        <button 
          type="button" 
          className="btn btn-primary" 
          onClick={onNext}
          disabled={!formData.regNo || formData.regNo.length !== 6}
          style={{ opacity: (!formData.regNo || formData.regNo.length !== 6) ? 0.5 : 1 }}
        >
          {t(lang, 'nextComplaints')}
        </button>
      </div>
    </div>
  );
}
