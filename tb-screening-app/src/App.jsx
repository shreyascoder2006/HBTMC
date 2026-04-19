import { useState, useEffect, useRef } from 'react';
import Demographics from './components/Demographics';
import ChiefComplaints from './components/ChiefComplaints';
import Investigations from './components/Investigations';
import RiskAssessment from './components/RiskAssessment';
import Booking from './components/Booking';
import DashboardHome from './components/DashboardHome';
import HotspotAnalysis from './components/HotspotAnalysis';
import Chatbot from './components/Chatbot';
import LandingPage from './components/LandingPage';
import AnimatedBackground from './components/AnimatedBackground';
import { getTranslation as t } from './i18n';
import './index.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [showLanding, setShowLanding] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [lang, setLang] = useState('en');
  const [appMode, setAppMode] = useState(false);
  
  // Patient Screening Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [isAssessing, setIsAssessing] = useState(false);
  const resultsRef = useRef(null);

  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    gender: '',
    location: '',
    phone: '',
    occupation: '',
    tbContact: 'No',
    coughDuration: 0,
    visits: 1,
    aadhar: '',
    opd: '',
    regNo: ''
  });

  const [symptoms, setSymptoms] = useState({
    fever: false,
    weightLoss: false,
    nightSweats: false,
    hemoptysis: false,
    chestPain: false,
    breathlessness: false,
    feverDays: 0
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSymptomChange = (e) => {
    const { name, checked, value, type } = e.target;
    setSymptoms(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const nextStep = () => setWizardStep(prev => prev + 1);
  const prevStep = () => setWizardStep(prev => prev - 1);

  const [aiResult, setAiResult] = useState(null);

  const assessRisk = async (xrayFile) => {
    setIsAssessing(true);
    setWizardStep(4);
    
    if (xrayFile) {
      const formData = new FormData();
      formData.append('file', xrayFile);
      
      try {
        const response = await fetch('/api/analyze-xray', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        if (data.success) {
          setAiResult(data);
        }
      } catch (error) {
        console.error("X-ray Analysis Error:", error);
      }
    }

    setTimeout(() => {
      setIsAssessing(false);
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, xrayFile ? 500 : 1200);
  };

  const resetWizard = () => {
    setFormData({ patientName: '', age: '', gender: '', location: '', phone: '', occupation: '', tbContact: 'No', coughDuration: 0, visits: 1 });
    setSymptoms({ fever: false, weightLoss: false, nightSweats: false, hemoptysis: false, chestPain: false, breathlessness: false });
    setWizardStep(1);
    setIsAssessing(false);
    setAiResult(null);
  };

  const cycleLang = () => {
    setLang(prev => {
      if (prev === 'en') return 'mr';
      if (prev === 'mr') return 'hi';
      return 'en';
    });
  };

  const getLangBtnText = () => {
    if (lang === 'en') return 'मराठी / हिन्दी';
    if (lang === 'mr') return 'हिन्दी / English';
    return 'English / मराठी';
  };

  if (showLanding) {
     return <LandingPage onStart={() => setShowLanding(false)} />;
  }



  return (
    <div className={`app-shell ${appMode ? 'is-app-mode' : ''}`}>
      <AnimatedBackground />
      
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="brand-name">Swasth Saans</h1>
          <p className="brand-tagline">Jaldi Pehchaan</p>
        </div>

        <nav className="nav-links">
          <div className={`nav-item ${activeSection === 'home' ? 'active' : ''}`} onClick={() => setActiveSection('home')}>
             <span style={{ fontSize: '1.2rem' }}>🏠</span> Dashboard
          </div>
          <div className={`nav-item ${activeSection === 'screening' ? 'active' : ''}`} onClick={() => setActiveSection('screening')}>
             <span style={{ fontSize: '1.2rem' }}>🧪</span> Patient Screening
          </div>
          <div className={`nav-item ${activeSection === 'hotspot' ? 'active' : ''}`} onClick={() => setActiveSection('hotspot')}>
             <span style={{ fontSize: '1.2rem' }}>📍</span> Hotspot Analysis
          </div>
          <div className={`nav-item ${activeSection === 'booking' ? 'active' : ''}`} onClick={() => setActiveSection('booking')}>
             <span style={{ fontSize: '1.2rem' }}>📅</span> Appointments
          </div>
        </nav>

         <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button 
              onClick={() => setAppMode(!appMode)} 
              className="btn btn-neon" 
              style={{ width: '100%', fontSize: '0.7rem', borderColor: appMode ? 'var(--neon-green)' : 'var(--primary-cyan)', color: appMode ? 'var(--neon-green)' : 'var(--primary-cyan)' }}
            >
               {appMode ? '📱 Mobile App Mode' : '💻 Toggle App Mode'}
            </button>
            <button onClick={cycleLang} className="btn btn-neon" style={{ width: '100%', marginBottom: '1rem', fontSize: '0.7rem' }}>
               {getLangBtnText()}
            </button>
         </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        
        {activeSection === 'home' && <DashboardHome lang={lang} />}
        
        {activeSection === 'hotspot' && <HotspotAnalysis lang={lang} />}

        {activeSection === 'booking' && (
          <div className="glass-card fade-in">
             <Booking onPrev={() => setActiveSection('home')} lang={lang} />
          </div>
        )}

        {activeSection === 'screening' && (
          <div className="fade-in">
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h2 style={{ fontSize: '1.8rem', color: 'var(--primary-cyan)' }}>Patient Screening Workflow</h2>
               <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Step {wizardStep} of 5</div>
            </header>

            <div className="glass-card">
              {wizardStep === 1 && (
                <Demographics formData={formData} onChange={handleFormChange} onNext={nextStep} lang={lang} />
              )}
              {wizardStep === 2 && (
                <ChiefComplaints 
                  formData={formData} 
                  symptoms={symptoms} 
                  onFormChange={handleFormChange} 
                  onSymptomChange={handleSymptomChange} 
                  onNext={nextStep} 
                  onPrev={prevStep}
                  lang={lang}
                />
              )}
              {wizardStep === 3 && (
                <Investigations 
                  onPrev={prevStep} 
                  onAssess={assessRisk} 
                  isAssessing={isAssessing} 
                  lang={lang}
                />
              )}
              {wizardStep === 4 && (
                <div ref={resultsRef}>
                  {isAssessing ? (
                    <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                       <div style={{ width: '50px', height: '50px', border: '4px solid rgba(34,211,238,0.1)', borderTopColor: 'var(--primary-cyan)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
                       <h3>AI Analyzing Patient Bio-Markers...</h3>
                    </div>
                  ) : (
                    <div>
                      <RiskAssessment 
                        duration={parseInt(formData.visits) || 1} 
                        symptoms={{ ...symptoms, coughDuration: formData.coughDuration, tbContact: formData.tbContact }} 
                        lang={lang}
                        patientData={formData}
                        aiResult={aiResult}
                      />
                      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                        <button className="btn btn-neon" onClick={resetWizard}>New Screening</button>
                        <button className="btn btn-primary" onClick={() => setActiveSection('booking')}>Proceed to Booking</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Mobile-style Bottom Navigation */}
      {appMode && (
        <nav className="bottom-nav">
          <div className={`bottom-nav-item ${activeSection === 'home' ? 'active' : ''}`} onClick={() => setActiveSection('home')}>
             <span style={{ fontSize: '1.4rem' }}>🏠</span>
          </div>
          <div className={`bottom-nav-item ${activeSection === 'screening' ? 'active' : ''}`} onClick={() => setActiveSection('screening')}>
             <span style={{ fontSize: '1.4rem' }}>🧪</span>
          </div>
          <div className={`bottom-nav-item ${activeSection === 'hotspot' ? 'active' : ''}`} onClick={() => setActiveSection('hotspot')}>
             <span style={{ fontSize: '1.4rem' }}>📍</span>
          </div>
          <div className={`bottom-nav-item ${activeSection === 'booking' ? 'active' : ''}`} onClick={() => setActiveSection('booking')}>
             <span style={{ fontSize: '1.4rem' }}>📅</span>
          </div>
          <div className="bottom-nav-item" onClick={() => setAppMode(false)}>
             <span style={{ fontSize: '1.4rem', color: '#64748b' }}>🖥️</span>
          </div>
        </nav>
      )}

      <Chatbot lang={lang} />
    </div>
  );
}

export default App;
