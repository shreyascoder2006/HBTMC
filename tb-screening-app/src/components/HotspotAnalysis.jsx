import React, { useState, useMemo } from 'react';
import { getTranslation as t } from '../i18n';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

export default function HotspotAnalysis({ lang }) {
  const [timelineIndex, setTimelineIndex] = useState(3); // Start at most recent week

  const regionsData = [
    { 
      name: 'Dharavi', 
      coordinates: [19.0396, 72.8596],
      category: 'High',
      history: [80, 110, 130, 145], // Cases over last 4 weeks
    },
    { 
      name: 'Bandra', 
      coordinates: [19.0544, 72.8400],
      category: 'Moderate',
      history: [85, 87, 88, 88],
    },
    { 
      name: 'Andheri', 
      coordinates: [19.1136, 72.8697],
      category: 'Low',
      history: [45, 40, 37, 34],
    },
    { 
      name: 'Kurla', 
      coordinates: [19.0700, 72.8800],
      category: 'High',
      history: [70, 95, 105, 112],
    },
    { 
      name: 'Borivali', 
      coordinates: [19.2307, 72.8573],
      category: 'Low',
      history: [25, 23, 22, 21],
    }
  ];

  // Process data for the current timeline index
  const processedRegions = useMemo(() => {
    return regionsData.map(r => {
      const currentCases = r.history[timelineIndex];
      const prevCases = timelineIndex > 0 ? r.history[timelineIndex - 1] : r.history[0];
      
      let trend = 'Stable';
      let trendColor = 'var(--text-muted)';
      let trendIcon = '→';

      if (currentCases > prevCases) {
        trend = 'Increasing';
        trendColor = 'var(--neon-red)';
        trendIcon = '↑';
      } else if (currentCases < prevCases) {
        trend = 'Decreasing';
        trendColor = 'var(--neon-green)';
        trendIcon = '↓';
      }

      let riskColor = 'var(--neon-green)';
      if (r.category === 'High') riskColor = 'var(--neon-red)';
      else if (r.category === 'Moderate') riskColor = 'var(--neon-orange)';

      return {
        ...r,
        currentCases,
        trend,
        trendColor,
        trendIcon,
        riskColor
      };
    });
  }, [timelineIndex]);

  // Derived AI Insight
  const aiInsight = useMemo(() => {
    const increasing = processedRegions.filter(r => r.trend === 'Increasing');
    if (increasing.length > 0) {
      const top = increasing.sort((a,b) => b.currentCases - a.currentCases)[0];
      return `Predictive Alert: Active TB cluster detected in ${top.name}. Case velocity has increased in the last 7 days.`;
    }
    return "Status Update: Regional TB spread appears stable across all monitored sectors.";
  }, [processedRegions]);

  return (
    <div className="fade-in">
      <header style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--primary-cyan)' }}>Hotspot Analysis</h2>
        <p style={{ color: 'var(--text-muted)' }}>Advanced AI Trend Analysis & Predictive Heatmapping</p>
      </header>

      {/* AI Insight Banner */}
      <div className="insight-banner fade-in" style={{ 
          background: 'linear-gradient(90deg, rgba(34, 211, 238, 0.15), transparent)',
          borderColor: 'var(--primary-cyan)',
          marginBottom: '1.5rem'
      }}>
        <span className="insight-tag">AI Trend Insight</span>
        <p style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>{aiInsight}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem' }}>
        <div style={{ position: 'relative' }}>
          <div className="glass-card" style={{ padding: 0, overflow: 'hidden', height: '500px', border: '1px solid rgba(255,255,255,0.1)' }}>
             <MapContainer center={[19.0760, 72.8777]} zoom={11} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; CARTO'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                {processedRegions.map((region, i) => (
                   <Circle 
                      key={i} 
                      center={region.coordinates} 
                      radius={region.currentCases * 15} // Scale radius by cases
                      pathOptions={{
                        fillColor: region.riskColor,
                        color: region.riskColor,
                        weight: 1,
                        fillOpacity: 0.3
                      }}
                   >
                     <Popup>
                        <div style={{ color: '#000' }}>
                          <h3 style={{ margin: 0, fontSize: '0.9rem' }}>{region.name}</h3>
                          <p style={{ margin: '4px 0 0', fontSize: '0.8rem' }}>Status: <strong style={{ color: region.riskColor }}>{region.category} Risk</strong></p>
                          <p style={{ margin: '2px 0 0', fontSize: '0.8rem' }}>Current Cases: {region.currentCases}</p>
                          <p style={{ margin: '2px 0 0', fontSize: '0.8rem' }}>Trend: <span style={{ color: region.trendIcon === '↑' ? 'red' : 'green' }}>{region.trend}</span></p>
                        </div>
                     </Popup>
                   </Circle>
                ))}
             </MapContainer>
          </div>
          
          {/* Timeline Slider */}
          <div style={{ 
              position: 'absolute', bottom: '20px', left: '20px', right: '20px', 
              background: 'rgba(15, 23, 42, 0.85)', padding: '1rem', 
              borderRadius: '12px', backdropFilter: 'blur(10px)', 
              border: '1px solid rgba(255,255,255,0.1)', zIndex: 1000
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>4 Weeks Ago</span>
              <span style={{ color: 'var(--primary-cyan)', fontWeight: 'bold' }}>Timeline Scrubber (Week {timelineIndex + 1})</span>
              <span>Today</span>
            </div>
            <input 
              type="range" 
              min="0" max="3" 
              value={timelineIndex} 
              onChange={(e) => setTimelineIndex(parseInt(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary-cyan)' }} 
            />
          </div>
        </div>

        <div className="glass-card" style={{ maxHeight: '580px', overflowY: 'auto' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Regional Intelligence</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {processedRegions.map((r, i) => (
              <div key={i} style={{ padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: `4px solid ${r.riskColor}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{r.name}</span>
                  <span style={{ color: r.riskColor, fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase' }}>{r.category}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>{r.currentCases} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>Cases</span></span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: r.trendColor }}>
                      {r.trendIcon} {r.trend}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

