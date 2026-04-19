import { useState, useEffect, useRef } from 'react';
import Demographics from './components/Demographics';
import ChiefComplaints from './components/ChiefComplaints';
import Investigations from './components/Investigations';
import RiskAssessment from './components/RiskAssessment';
import Booking from './components/Booking';
import DashboardHome from './components/DashboardHome';
import HotspotAnalysis from './components/HotspotAnalysis';
import Chatbot from './components/Chatbot';
import PatientTimeline from './components/PatientTimeline';
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
  const [operatingMode, setOperatingMode] = useState('DOCTOR'); // DOCTOR or FIELD_WORKER
  
  // Longitudinal Patient History
  const [patientHistory, setPatientHistory] = useState({
    '123456': [
      { id: 1, date: '2026-04-01', risk: 15, symptoms: { cough: true }, duration: 5, note: 'Initial screening, mild viral symptoms.' },
      { id: 2, date: '2026-04-08', risk: 45, symptoms: { cough: true, fever: true }, duration: 12, note: 'Follow-up: Condition progressing, fever detected.' },
      { id: 3, date: '2026-04-15', risk: 82, symptoms: { cough: true, fever: true, weightLoss: true }, duration: 19, note: 'Urgent: Significant risk increase, weight loss observed.' }
    ]
  });
  
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

  const [voiceNote, setVoiceNote] = useState('');


  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSymptomChange = (e) => {
    const { name, checked } = e.target;
    setSymptoms(prev => ({ ...prev, [name]: checked }));
  };

  const handleVoiceData = (data) => {
    // 1. Update Symptoms
    if (data.symptoms) {
      setSymptoms(prev => ({
        ...prev,
        ...data.symptoms
      }));
    }

    // 2. Update Duration
    if (data.duration !== null) {
      setFormData(prev => ({
        ...prev,
        coughDuration: data.duration
      }));
    }

    // 3. Trigger Intelligence Notification & Skip to Results if sufficient
    setVoiceNote('Intelligence: Voice data auto-filled!');
    setTimeout(() => setVoiceNote(''), 4000);

    if (activeSection !== 'screening') setActiveSection('screening');
    
    // Automatically assess risk and show results (Step 4)
    setWizardStep(4);
    setTimeout(() => {
        assessRisk();
    }, 100);
  };

  const handleQuickFill = () => {
    setFormData(prev => ({
      ...prev,
      patientName: 'Rahul Sharma',
      age: 42,
      gender: 'Male',
      location: 'KEM Hospital',
      phone: '9876543210',
      occupation: 'Service',
      tbContact: 'No',
      aadhar: '123456789012',
      opd: 'OPD-102',
      regNo: '123456'
    }));
  };

  const handleSaveVisit = (riskScore, note = '') => {
    const regNo = formData.regNo || '000000';
    const newVisit = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      risk: riskScore,
      symptoms: { ...symptoms },
      duration: formData.coughDuration,
      note: note || 'Patient visit recorded via Screening Wizard.'
    };

    setPatientHistory(prev => ({
      ...prev,
      [regNo]: [...(prev[regNo] || []), newVisit]
    }));
    
    setVoiceNote('✅ Visit saved to Patient Timeline!');
    setTimeout(() => setVoiceNote(''), 3000);
  };





  const nextStep = () => setWizardStep(prev => prev + 1);
  const prevStep = () => setWizardStep(prev => prev - 1);

  const [aiResult, setAiResult] = useState(null);
  const [liveAlerts, setLiveAlerts] = useState([]);

  // Live Alerts Logic
  useEffect(() => {
    const newAlerts = [];
    
    // 1. Chronic Symptom Alert
    if (formData.coughDuration > 14) {
      newAlerts.push({ id: 'cough', type: 'urgent', text: t(lang, 'alertChronicCough') || 'Chronic cough detected' });
    }

    // 2. Repeat Visit Alert
    if (parseInt(formData.visits) > 2) {
      newAlerts.push({ id: 'visits', type: 'urgent', text: t(lang, 'alertRepeatVisit') || 'Multiple visits without diagnosis – possible delay' });
    }

    // 3. High Risk Alert (Re-calculate score for alerts)
    const calculateScore = () => {
      let s = 0;
      if (formData.coughDuration > 14) s += 25;
      if (symptoms.fever) s += 10;
      if (symptoms.weightLoss) s += 15;
      if (symptoms.nightSweats) s += 10;
      if (symptoms.hemoptysis) s += 25;
      if (symptoms.chestPain || symptoms.breathlessness) s += 15;
      if (formData.tbContact === 'Yes') s += 20;
      if (parseInt(formData.visits) > 2) s += 15;
      if (aiResult && aiResult.status === 'Tuberculosis') s += 30;
      return Math.min(s, 100);
    };

    const currentScore = calculateScore();
    if (currentScore > 60) {
      newAlerts.push({ id: 'risk', type: 'urgent', text: t(lang, 'alertHighRisk') || 'High TB risk detected – immediate testing required' });
    }

    setLiveAlerts(newAlerts);
  }, [formData.coughDuration, formData.visits, formData.tbContact, symptoms, aiResult, lang]);

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

      {voiceNote && (
        <div style={{
          position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 99999, background: 'rgba(34, 211, 238, 0.95)', color: '#000',
          padding: '0.75rem 1.5rem', borderRadius: '50px', fontWeight: 'bold',
          boxShadow: '0 0 30px rgba(34,211,238,0.5)', border: '1px solid white',
          animation: 'slideUp 0.3s ease', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          💡 {voiceNote}
        </div>
      )}
      
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1 className="brand-name">Swasth Saans</h1>
          <p className="brand-tagline">Jaldi Pehchaan</p>
        </div>

        <nav className="nav-links">
          {operatingMode === 'DOCTOR' && (
            <div className={`nav-item ${activeSection === 'home' ? 'active' : ''}`} onClick={() => setActiveSection('home')}>
               <span style={{ fontSize: '1.2rem' }}>🏠</span> Dashboard
            </div>
          )}
          
          <div className={`nav-item ${activeSection === 'screening' ? 'active' : ''}`} onClick={() => setActiveSection('screening')}>
             <span style={{ fontSize: '1.2rem' }}>🧪</span> {operatingMode === 'FIELD_WORKER' ? 'Quick Screening' : 'Patient Screening'}
          </div>

          <div className={`nav-item ${activeSection === 'timeline' ? 'active' : ''}`} onClick={() => setActiveSection('timeline')}>
             <span style={{ fontSize: '1.2rem' }}>📊</span> Timeline Intelligence
          </div>

          <div className={`nav-item ${activeSection === 'hotspot' ? 'active' : ''}`} onClick={() => setActiveSection('hotspot')}>
             <span style={{ fontSize: '1.2rem' }}>📍</span> Hotspot Map
          </div>

          {operatingMode === 'DOCTOR' && (
            <div className={`nav-item ${activeSection === 'booking' ? 'active' : ''}`} onClick={() => setActiveSection('booking')}>
               <span style={{ fontSize: '1.2rem' }}>📅</span> Appointments
            </div>
          )}
        </nav>

         <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button 
              onClick={() => {
                const newMode = operatingMode === 'DOCTOR' ? 'FIELD_WORKER' : 'DOCTOR';
                setOperatingMode(newMode);
                if (newMode === 'FIELD_WORKER') setActiveSection('screening');
                else setActiveSection('home');
              }} 
              className="btn btn-neon role-toggle" 
              style={{ width: '100%', fontSize: '0.7rem', color: operatingMode === 'FIELD_WORKER' ? '#fbbf24' : 'var(--primary-cyan)', borderColor: operatingMode === 'FIELD_WORKER' ? '#fbbf24' : 'var(--primary-cyan)' }}
            >
               🔄 Switch to {operatingMode === 'DOCTOR' ? 'Field Mode' : 'Doctor Mode'}
            </button>
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
        
        {activeSection === 'home' && <DashboardHome lang={lang} alerts={liveAlerts} mode={operatingMode} />}
        
        {activeSection === 'hotspot' && <HotspotAnalysis lang={lang} />}

        {activeSection === 'timeline' && (
          <div className="fade-in">
             <PatientTimeline 
               history={patientHistory[formData.regNo] || []} 
               patientName={formData.patientName || 'Anonymous'}
               lang={lang} 
             />
          </div>
        )}


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
                <Demographics 
                  formData={formData} 
                  onChange={handleFormChange} 
                  onNext={nextStep} 
                  lang={lang} 
                  onQuickFill={handleQuickFill}
                />
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
                        onSaveVisit={handleSaveVisit}
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

      <Chatbot lang={lang} onDataExtracted={handleVoiceData} />
    </div>
  );
}

export default App;
