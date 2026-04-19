import React from 'react';
import './LandingPage.css';

const LandingPage = ({ onStart }) => {
  return (
    <div className="landing-container">
      <div className="landing-overlay"></div>
      
      <header className="landing-header">
        <div className="landing-logo">
          <span className="logo-icon">🫁</span>
          <div className="logo-text">
            <span className="brand-primary">Swasth</span>
            <span className="brand-secondary">Saans</span>
          </div>
        </div>
        <nav className="landing-nav">
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <button className="nav-login-btn" onClick={onStart}>Access Portal</button>
        </nav>
      </header>

      <main className="landing-hero">
        <div className="hero-content fade-in" style={{ maxWidth: '650px' }}>
          <div className="hero-badge">Clinical Excellence & AI Precision</div>
          <h1 className="hero-title">
            Swasth Saans: <br />
            <span className="text-gradient">Early Detection, Guaranteed Care</span>
          </h1>
          <p className="hero-subtitle">
            Early detection of Tuberculosis is the single most effective way to break the chain of transmission and ensure a 90%+ success rate in treatment. Our AI-driven platform empowers healthcare workers to identify risks faster than ever.
          </p>
          <div className="hero-actions">
            <button className="btn-glow" onClick={onStart}>Start Screening Now</button>
            <button className="btn-outline">Why Early Detection?</button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="glass-card-lp early-detection-card">
            <div className="card-header-lp">
              <span className="status-dot green"></span>
              Why Early Detection?
            </div>
            <div className="card-body-lp">
              <div className="impact-stats">
                <div className="stat-item">
                  <span className="stat-val">90%+</span>
                  <span className="stat-desc">Success Rate with Early Identification</span>
                </div>
                <div className="stat-item">
                  <span className="stat-val">Zero</span>
                  <span className="stat-desc">Transmission if Caught on Day 1</span>
                </div>
              </div>
              <p className="detection-text">
                Detecting TB early prevents permanent lung damage and stops the spread of the disease to family and the local community.
              </p>
            </div>
          </div>
        </div>
      </main>

      <section id="features" className="features-grid">
        <div className="feature-card-lp">
          <span className="feature-icon">🔍</span>
          <h3>AI OCR Analysis</h3>
          <p>Instant digital extraction of clinical data from handwritten prescriptions.</p>
        </div>
        <div className="feature-card-lp">
          <span className="feature-icon">📍</span>
          <h3>Hotspot Tracking</h3>
          <p>Real-time geographic visualization of TB clusters across regions.</p>
        </div>
        <div className="feature-card-lp">
          <span className="feature-icon">🌐</span>
          <h3>Multilingual</h3>
          <p>Available in English, Hindi, and Marathi for accessibility.</p>
        </div>
      </section>

      <footer className="landing-footer">
        <p>&copy; 2026 Swasth Saans. Built for Clinical Excellence.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
