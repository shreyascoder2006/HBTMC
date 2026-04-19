import React from 'react';
import { getTranslation as t } from '../i18n';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function HotspotAnalysis({ lang }) {
  const regions = [
    { name: 'Dharavi', risk: 'High', cases: 145, color: '#ef4444', coordinates: [19.0396, 72.8596] }, // Leaflet uses [Lat, Lng]
    { name: 'Bandra', risk: 'Moderate', cases: 88, color: '#f59e0b', coordinates: [19.0544, 72.8400] },
    { name: 'Andheri', risk: 'Low', cases: 34, color: '#10b981', coordinates: [19.1136, 72.8697] },
    { name: 'Kurla', risk: 'High', cases: 112, color: '#ef4444', coordinates: [19.0700, 72.8800] },
    { name: 'Borivali', risk: 'Low', cases: 21, color: '#10b981', coordinates: [19.2307, 72.8573] }
  ];

  // Helper to create custom circle markers
  const createCustomIcon = (color) => {
    return L.divIcon({
      className: 'custom-map-marker',
      html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color};"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });
  };

  return (
    <div className="fade-in">
      <header style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--primary-cyan)' }}>Hotspot Analysis</h2>
        <p style={{ color: 'var(--text-muted)' }}>Regional TB Distribution & Heat Mapping (Live)</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '1.5rem' }}>
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden', height: '500px', border: '1px solid rgba(255,255,255,0.1)' }}>
           <MapContainer center={[19.0760, 72.8777]} zoom={11} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              {regions.map((region, i) => (
                <Marker key={i} position={region.coordinates} icon={createCustomIcon(region.color)}>
                  <Popup>
                    <div style={{ color: '#000' }}>
                      <h3 style={{ margin: 0, fontSize: '0.9rem' }}>{region.name}</h3>
                      <p style={{ margin: '4px 0 0', fontSize: '0.8rem' }}>Risk: <strong>{region.risk}</strong></p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.8rem' }}>Cases: {region.cases}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
           </MapContainer>
        </div>

        <div className="glass-card">
          <h3 style={{ marginBottom: '1.5rem' }}>Region Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {regions.map((r, i) => (
              <div key={i} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', borderLeft: `4px solid ${r.color}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '600' }}>{r.name}</span>
                  <span style={{ color: r.color, fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase' }}>{r.risk}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Cases Detected</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>{r.cases}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>AI Actionable Zones</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Zones identified for immediate intervention based on cross-referenced demographics.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
           <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid var(--neon-red)' }}>
             <h4 style={{ color: 'var(--neon-red)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Alert: Kurla Sector 4</h4>
             <p style={{ fontSize: '0.8rem' }}>High density of persistent cough reports in past 72 hours. Deployment of screening required.</p>
           </div>
           <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', border: '1px solid var(--neon-orange)' }}>
             <h4 style={{ color: 'var(--neon-orange)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Monitor: Bandra East</h4>
             <p style={{ fontSize: '0.8rem' }}>Moderate uptick in repeat visits. Monitoring clinic logs.</p>
           </div>
           <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid var(--neon-green)' }}>
             <h4 style={{ color: 'var(--neon-green)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Low Risk: Borivali</h4>
             <p style={{ fontSize: '0.8rem' }}>Stable metrics observed in this sector.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
