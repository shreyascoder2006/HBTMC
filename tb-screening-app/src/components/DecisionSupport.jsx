import React from 'react';

export default function DecisionSupport({ riskLevel }) {
  const getRecommendations = () => {
    switch (riskLevel) {
      case 'HIGH':
      case 'VERY HIGH':
        return (
          <ul style={{ paddingLeft: '20px' }}>
            <li><strong>Immediate Action Required:</strong> Urgent TB clinic referral required.</li>
            <li>Refer immediately for CBNAAT / Sputum Microscopy.</li>
            <li>Provide mask to patient and isolation instructions.</li>
          </ul>
        );
      case 'MODERATE':
        return (
          <ul style={{ paddingLeft: '20px' }}>
            <li>Monitor patient.</li>
            <li>Start antibiotics / antivirals as per protocol.</li>
            <li>Re-evaluate in 5–7 days.</li>
          </ul>
        );
      case 'LOW':
        return (
          <ul style={{ paddingLeft: '20px' }}>
            <li>General observation and follow-up.</li>
          </ul>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ background: 'rgba(255, 255, 255, 0.4)', padding: '1rem', borderRadius: '8px' }}>
      <h4 style={{ marginBottom: '0.5rem', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '0.5rem' }}>
        Recommendations
      </h4>
      {getRecommendations()}
    </div>
  );
}
