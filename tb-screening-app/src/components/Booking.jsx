import React, { useState, useEffect } from 'react';
import { getTranslation as t } from '../i18n';

const ALL_LABS = [
  "KEM Hospital",
  "Cooper Hospital",
  "Breach Candy Hospital"
];

export default function Booking({ onPrev, lang }) {
  const [labs, setLabs] = useState([]);
  const [selectedLab, setSelectedLab] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState('');

  useEffect(() => {
    setLabs(ALL_LABS);

    // Load Razorpay Script dynamically
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = () => {
    if (!selectedLab || !date || !time) {
      alert("Please select a lab, date, and time before proceeding to payment.");
      return;
    }

    const options = {
      key: "rzp_test_S0ucp0A7K9LMwm", // User provided test API key
      amount: 10000, // Amount in paise (₹100)
      currency: "INR",
      name: "TB Clinical Decision Support",
      description: "Test & Follow-up Booking",
      handler: function (response) {
        setPaymentId(response.razorpay_payment_id);
        setPaymentSuccess(true);
      },
      prefill: {
        name: "Test User",
        contact: "9999999999"
      },
      theme: {
        color: "#0f766e"
      }
    };
    
    // eslint-disable-next-line no-undef
    if (window.Razorpay) {
        // eslint-disable-next-line no-undef
        const rzp = new window.Razorpay(options);
        rzp.open();
    } else {
        alert("Razorpay SDK failed to load. Are you offline?");
    }
  };

  if (paymentSuccess) {
    return (
      <div className="tab-pane fade-in" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
         <svg style={{ width: '80px', height: '80px', color: '#10b981', margin: '0 auto 1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
         </svg>
         <h2 style={{ color: '#047857', marginBottom: '1rem' }}>{t(lang, 'bookingConfirmed')}</h2>
         <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
           <strong>{selectedLab}</strong>
         </p>
         <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            {date} @ {time}
         </p>
         <div style={{ background: '#f1f5f9', padding: '1rem', borderRadius: '8px', display: 'inline-block' }}>
            <p style={{ margin: 0, fontFamily: 'monospace', color: '#334155' }}>
               {t(lang, 'paymentId')} {paymentId}
            </p>
         </div>
         <div style={{ marginTop: '2rem' }}>
            <button className="btn btn-secondary" onClick={() => window.location.reload()}>
               End Session / New Patient
            </button>
         </div>
      </div>
    );
  }

  return (
    <div className="tab-pane fade-in">
      <h2 style={{ color: 'var(--primary-cyan)', marginBottom: '1.5rem' }}>{t(lang, 'bookingHeader')}</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
           <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-cyan)' }}>{t(lang, 'labsHeader')}</h3>
           <div className="form-group">
             <label>{t(lang, 'selectLab')}</label>
             <select className="form-control" value={selectedLab} onChange={(e) => setSelectedLab(e.target.value)}>
                <option value="">{t(lang, 'select')}</option>
                {labs.map((lab, index) => (
                  <option key={index} value={lab}>{lab}</option>
                ))}
             </select>
           </div>
           
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div className="form-group">
                <label>{t(lang, 'dateLabel')}</label>
                <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label>{t(lang, 'timeLabel')}</label>
                <input type="time" className="form-control" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
           </div>
        </div>
        
        <div style={{ background: 'rgba(34, 211, 238, 0.05)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(34, 211, 238, 0.2)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
           <h3 style={{ color: 'var(--primary-cyan)', marginBottom: '2rem' }}>Slot Confirmation</h3>
           
           <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', width: '100%', borderRadius: '12px', textAlign: 'center', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Consultation Fee</p>
              <strong style={{ fontSize: '2rem', color: 'var(--text-main)' }}>
                 {selectedLab === 'Breach Candy Hospital' ? '₹100' : 'FREE'}
              </strong>
           </div>
           
           {selectedLab === 'Breach Candy Hospital' ? (
             <button 
               className="btn btn-primary" 
               style={{ width: '100%', padding: '1.2rem', fontSize: '1rem' }}
               onClick={handlePayment}
             >
               {t(lang, 'payNow')}
             </button>
           ) : (
             <button 
               className="btn btn-neon" 
               style={{ width: '100%', padding: '1.2rem', fontSize: '1rem' }}
               onClick={() => {
                 if (!selectedLab || !date || !time) {
                    alert("Please select a hospital, date, and time first.");
                    return;
                 }
                 setPaymentId('FREE_CONFIRM_' + Math.floor(Math.random() * 1000000));
                 setPaymentSuccess(true);
               }}
             >
               Confirm Free Booking
             </button>
           )}
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <button type="button" className="btn btn-secondary" onClick={onPrev}>{t(lang, 'back')}</button>
      </div>
    </div>
  );
}
