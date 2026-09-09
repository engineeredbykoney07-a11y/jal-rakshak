import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import io from 'socket.io-client';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

const Dashboard = () => {
  const { t } = useTranslation();
  const socketRef = useRef(null);
  const [userLocation, setUserLocation] = useState([30.0668, 79.0193]); // Default Uttarakhand
  const [readings, setReadings] = useState([]);
  const [officialAlerts, setOfficialAlerts] = useState([]);
  const [consent, setConsent] = useState(false);
  const [subStatus, setSubStatus] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.log('Geolocation denied, using default')
      );
    }

    // Fetch official alerts
    fetch('http://localhost:5000/api/official-alerts?state=uttarakhand')
      .then(res => res.json())
      .then(data => setOfficialAlerts(data || []))
      .catch(err => console.error('Error fetching official alerts', err));

    // Create socket with auto-reconnect
    const socket = io('http://localhost:5000', {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected to backend:', socket.id);
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected from backend');
      setConnected(false);
    });

    socket.on('riskUpdate', (data) => {
      setReadings(prev => {
        const existing = prev.findIndex(r => r.id === data.id);
        if (existing !== -1) {
          const updated = [...prev];
          updated[existing] = { ...updated[existing], ...data };
          return updated;
        }
        return [data, ...prev];
      });
    });

    socket.on('advisoryUpdate', (data) => {
      setReadings(prev => {
        const existing = prev.findIndex(r => r.id === data.id);
        if (existing !== -1) {
          const updated = [...prev];
          updated[existing] = { ...updated[existing], advisory: data.advisory };
          return updated;
        }
        return prev;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!consent) {
      setSubStatus('error');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: '+910000000000', // Auto-connected device number
          locationId: 'ridgeroad', // Hardcoded for demo
          language: 'en', // Should match selected UI lang ideally
          consentGiven: consent
        })
      });
      if (res.ok) setSubStatus('success');
      else setSubStatus('error');
    } catch {
      setSubStatus('error');
    }
  };

  return (
    <div className="dashboard">
      <h2>{t('dashboard.title')} <span style={{ fontSize: '0.8rem', marginLeft: '1rem', color: connected ? 'var(--teal-light, #4ade80)' : '#ef4444', fontWeight: 400 }}>{connected ? '🟢 Live' : '🔴 Connecting...'}</span></h2>
      
      <div className="dash-grid">
        <div className="map-container">
          <MapContainer center={userLocation} zoom={8} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <ChangeView center={userLocation} zoom={8} />
            <Marker position={userLocation}>
              <Popup>{t('dashboard.your_location')}</Popup>
            </Marker>
            {readings.map(r => (
              <Marker key={r.id} position={r.coords}>
                <Popup>
                  <strong>{r.name}</strong><br/>
                  <span style={{ color: r.tier === 'Evacuate' ? 'red' : (r.tier === 'Warning' ? 'orange' : 'inherit') }}>
                    {r.tier}
                  </span>
                  
                  <div className="popup-analytics">
                    <div className="stat">
                      <span className="stat-label">Risk Score</span>
                      <span className="stat-value">{r.score}/100</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Water Level</span>
                      <span className="stat-value">{r.level?.toFixed(1) || 0}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Blockage</span>
                      <span className="stat-value" style={{ textTransform: 'capitalize' }}>{r.blockage || 'none'}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Confidence</span>
                      <span className="stat-value">{r.confidence}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="sidebar">
          <div className="card">
            <h3>{t('dashboard.subscribe_title')}</h3>
            <form onSubmit={handleSubscribe} className="subscribe-form">
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Your device will be automatically connected to receive critical alerts.
              </p>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={consent}
                  onChange={e => setConsent(e.target.checked)}
                />
                {t('dashboard.consent')}
              </label>
              <button type="submit" className="btn">{t('dashboard.subscribe_btn')}</button>
              {subStatus === 'success' && <p style={{color: 'var(--teal-light)'}}>{t('dashboard.success')}</p>}
              {subStatus === 'error' && <p style={{color: 'red'}}>{t('dashboard.error')}</p>}
            </form>
          </div>

          <div className="official-alerts-panel">
            <h3>Cross-Referenced Official Alerts</h3>
            {officialAlerts.length === 0 ? (
              <div className="empty-state">
                No official alerts currently issued for this region.
              </div>
            ) : (
              officialAlerts.map((alert, idx) => (
                <div key={idx} className="official-alert-item">
                  <div className="official-alert-title">{alert.title}</div>
                  <div className="official-alert-desc">
                    {alert.contentSnippet ? (alert.contentSnippet.length > 100 ? alert.contentSnippet.substring(0, 100) + '...' : alert.contentSnippet) : 'See official feed for details.'}
                  </div>
                  <div className="official-alert-meta">
                    <span>Source: NDMA SACHET public alert feed</span>
                    <span>{new Date(alert.pubDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="status-cards">
            {readings.map(r => (
              <div key={r.id} className="card">
                <h3>{r.name}</h3>
                <p>
                  <strong className={`tier-${r.tier}`}>{r.tier}</strong> | 
                  <span className="mono-readout"> {r.score}</span>/100 | 
                  {t('dashboard.confidence')}: {r.confidence}
                </p>
                {r.advisory && (
                  <div className="advisory-box">
                    <h4>Resident Warning</h4>
                    <p>{r.advisory.resident}</p>
                    <h4>Officer Coordination</h4>
                    <p>{r.advisory.officer}</p>
                    <h4>Worker Action</h4>
                    <p>{r.advisory.worker}</p>
                    <h4>Volunteer Task</h4>
                    <p>{r.advisory.volunteer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
