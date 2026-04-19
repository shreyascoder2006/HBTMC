import React, { useState } from 'react';
import { getTranslation as t } from '../i18n';

export default function Login({ onLogin, lang }) {
  const [loading, setLoading] = useState(false);
  const [creds, setCreds] = useState({ identifier: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Mimic AI Auth processing
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1500);
  };

  return (
    <div className="login-container fade-in">
      <div className="glass-card login-box">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 className="brand-name">Swasth Saans</h1>
          <p className="brand-tagline">Jaldi Pehchaan, Behtar Ilaaj</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email / Phone Number</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="doctor@health.gov"
              value={creds.identifier}
              onChange={(e) => setCreds({...creds, identifier: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="••••••••"
              value={creds.password}
              onChange={(e) => setCreds({...creds, password: e.target.value})}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', border: '2px solid rgba(0,0,0,0.1)', borderTopColor: 'black', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                Authenticating...
              </div>
            ) : 'Login as Doctor / Admin'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Secure clinical portal. Access restricted.
        </p>
      </div>
    </div>
  );
}
