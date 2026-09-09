import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import io from 'socket.io-client';

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
        () => console.log('Geolocation denied, using default')
      );
    }

    fetch('http://localhost:5000/api/official-alerts?state=uttarakhand')
      .then(res => res.json())
      .then(data => setOfficialAlerts(data || []))
      .catch(err => console.error('Error fetching official alerts', err));

    const socket = io('http://localhost:5000', {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

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

    return () => socket.disconnect();
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
          phoneNumber: '+910000000000',
          locationId: 'ridgeroad',
          language: 'en',
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
      <div className="dashboard-header">
        <h2>{t('dashboard.title')}</h2>
        <span style={{ 
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.85rem', 
          fontWeight: 600,
          color: connected ? 'var(--teal-light)' : '#f87171' 
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: connected ? 'var(--teal-light)' : '#f87171'
          }}></span>
          {connected ? 'Live Connected' : 'Reconnecting...'}
        </span>
      </div>
      
      <div className="dash-grid">
        <div className="map-container">
          <MapContainer center={userLocation} zoom={8} style={{ height: '100%', width: '100%' }}>
            {/* High contrast basemap layer */}
            <TileLayer 
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            <ChangeView center={userLocation} zoom={8} />
            
            <Marker position={userLocation}>
              <Popup>{t('dashboard.your_location')}</Popup>
            </Marker>

            {readings.map(r => (
              <Marker key={r.id} position={r.coords}>
                <Popup>
                  <div style={{ color: '#0f172a' }}>
                    <strong>{r.name}</strong><br/>
                    <span className={`tier-badge tier-${r.tier}`}>{r.tier}</span>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                      <div>Score: <b>{r.score}/100</b></div>
                      <div>Confidence: <b>{r.confidence}</b></div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="sidebar">
          {/* Subscribe Card */}
          <div className="card">
            <h3>{t('dashboard.subscribe_title')}</h3>
            <form onSubmit={handleSubscribe} className="subscribe-form">
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Your device will be connected for automated voice and SMS emergency notifications.
              </p>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={consent}
                  onChange={e => setConsent(e.target.checked)}
                />
                {t('dashboard.consent')}
              </label>
              <button type="submit" className="btn" style={{ width: '100%' }}>
                {t('dashboard.subscribe_btn')}
              </button>
              {subStatus === 'success' && <p style={{ color: 'var(--teal-light)', fontSize: '0.85rem' }}>{t('dashboard.success')}</p>}
              {subStatus === 'error' && <p style={{ color: '#f87171', fontSize: '0.85rem' }}>{t('dashboard.error')}</p>}
            </form>
          </div>

          {/* Official Alerts Feed */}
          <div className="official-alerts-panel">
            <h3 style={{ fontSize: '1rem', color: 'var(--teal-light)', marginBottom: '0.8rem' }}>
              Cross-Referenced Alerts
            </h3>
            {officialAlerts.length === 0 ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                No active external warnings for this sector.
              </div>
            ) : (
              officialAlerts.map((alert, idx) => (
                <div key={idx} className="official-alert-item">
                  <div className="official-alert-title">{alert.title}</div>
                  <div className="official-alert-desc">
                    {alert.contentSnippet ? (alert.contentSnippet.length > 90 ? alert.contentSnippet.substring(0, 90) + '...' : alert.contentSnippet) : 'See bulletin details.'}
                  </div>
                  <div className="official-alert-meta">
                    <span>NDMA SACHET</span>
                    <span>{new Date(alert.pubDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Live Sensor Readings */}
          <div className="status-cards">
            {readings.map(r => (
              <div key={r.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
                  <h3>{r.name}</h3>
                  <span className={`tier-badge tier-${r.tier}`}>{r.tier}</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Score: <span className="mono-readout">{r.score}</span>/100 | Confidence: {r.confidence}
                </p>

                {r.advisory && (
                  <div className="advisory-grid">
                    <div className="advisory-card">
                      <span className="role-tag">Resident</span>
                      <p>{r.advisory.resident}</p>
                    </div>
                    <div className="advisory-card">
                      <span className="role-tag">Officer</span>
                      <p>{r.advisory.officer}</p>
                    </div>
                    <div className="advisory-card">
                      <span className="role-tag">Worker</span>
                      <p>{r.advisory.worker}</p>
                    </div>
                    <div className="advisory-card">
                      <span className="role-tag">Volunteer</span>
                      <p>{r.advisory.volunteer}</p>
                    </div>
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