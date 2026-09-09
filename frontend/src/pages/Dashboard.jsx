import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import io from 'socket.io-client';
import { Bell, ShieldAlert, CheckCircle2, AlertTriangle, Radio, Activity, Send } from 'lucide-react';

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
  const [userLocation, setUserLocation] = useState([30.0668, 79.0193]);
  const [readings, setReadings] = useState([]);
  const [officialAlerts, setOfficialAlerts] = useState([]);
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [subStatus, setSubStatus] = useState(null);
  const [connected, setConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('alerts'); // 'alerts' | 'subscribe'

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        () => console.log('Using default geolocation')
      );
    }

    fetch('http://localhost:5000/api/official-alerts?state=uttarakhand')
      .then(res => res.json())
      .then(data => setOfficialAlerts(data || []))
      .catch(err => console.error('Alerts error', err));

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

    return () => socket.disconnect();
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!consent || !phone) {
      setSubStatus('error');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phone,
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

  const getTierClass = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'evacuate': return 'badge-evacuate';
      case 'warning': return 'badge-warning';
      case 'watch': return 'badge-watch';
      default: return 'badge-normal';
    }
  };

  return (
    <div className="dashboard-wrap">
      {/* Top Header Bar */}
      <div className="dashboard-bar">
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--gov-navy)' }}>
            {t('dashboard.title')}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem', fontWeight: 500 }}>
            {t('dashboard.subtitle')}
          </p>
        </div>
        
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.85rem',
          fontWeight: 700,
          color: connected ? '#065f46' : '#991b1b',
          background: connected ? '#d1fae5' : '#fee2e2',
          padding: '0.4rem 0.95rem',
          borderRadius: '999px',
          border: `1.5px solid ${connected ? '#a7f3d0' : '#fecaca'}`
        }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: connected ? '#10b981' : '#ef4444'
          }}></span>
          {connected ? t('dashboard.live_feed') : t('dashboard.connecting')}
        </div>
      </div>

      <div className="dashboard-layout">
        {/* Map View */}
        <div className="map-card">
          <div className="map-floating-legend">
            <span style={{ color: '#475569', textTransform: 'uppercase', fontSize: '0.72rem' }}>Tiers:</span>
            <div className="legend-item"><span className="legend-badge badge-normal"></span> Normal</div>
            <div className="legend-item"><span className="legend-badge badge-watch"></span> Watch</div>
            <div className="legend-item"><span className="legend-badge badge-warning"></span> Warning</div>
            <div className="legend-item"><span className="legend-badge badge-evacuate"></span> Evacuate</div>
          </div>

          <MapContainer center={userLocation} zoom={8} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />
            <ChangeView center={userLocation} zoom={8} />

            <Marker position={userLocation}>
              <Popup>{t('dashboard.your_location')}</Popup>
            </Marker>

            {readings.map(r => (
              <Marker key={r.id} position={r.coords}>
                <Popup>
                  <div style={{ padding: '0.25rem' }}>
                    <strong style={{ fontSize: '0.95rem' }}>{r.name}</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', margin: '0.35rem 0' }}>
                      <span className={`legend-badge ${getTierClass(r.tier)}`}></span>
                      <span style={{ fontWeight: 700 }}>{r.tier}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      {t('dashboard.score')}: {r.score}/100 | {t('dashboard.confidence')}: {r.confidence}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Streamlined Right Sidebar */}
        <div className="sidebar-container">
          <div className="compact-panel">
            {/* Tab Controls */}
            <div className="sidebar-tabs">
              <button
                className={`sidebar-tab-btn ${activeTab === 'alerts' ? 'active' : ''}`}
                onClick={() => setActiveTab('alerts')}
              >
                <ShieldAlert size={16} /> Official Alerts
              </button>
              <button
                className={`sidebar-tab-btn ${activeTab === 'subscribe' ? 'active' : ''}`}
                onClick={() => setActiveTab('subscribe')}
              >
                <Bell size={16} /> Subscribe Alerts
              </button>
            </div>

            {/* Tab 1: Official NDMA & Sensor Alerts */}
            {activeTab === 'alerts' && (
              <div>
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                    Regional Escalation Feed
                  </span>
                </div>
                {officialAlerts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem 0', color: '#94a3b8' }}>
                    <Activity size={28} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
                    <p style={{ fontSize: '0.85rem' }}>{t('dashboard.no_alerts')}</p>
                  </div>
                ) : (
                  officialAlerts.map((a, i) => (
                    <div key={i} className="alert-pill-box">
                      <h5>{a.title}</h5>
                      <p>{a.contentSnippet || 'Refer to regional bulletin.'}</p>
                    </div>
                  ))
                )}

                {/* Quick Sensor Readout Strip */}
                <div style={{ marginTop: '1.25rem', borderTop: '1.5px solid var(--gov-border-subtle)', paddingTop: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                    Telemetry Health
                  </span>
                  <div className="quick-status-strip">
                    <div className="quick-status-card">
                      <span>Gateway Node</span>
                      <strong style={{ color: '#0066cc' }}>ACTIVE</strong>
                    </div>
                    <div className="quick-status-card">
                      <span>Sync Mode</span>
                      <strong>MQTT v5</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Clean, Styled Subscription Form */}
            {activeTab === 'subscribe' && (
              <form onSubmit={handleSubscribe} className="subscribe-form-compact">
                <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  {t('dashboard.subscribe_desc')}
                </p>
                <input
                  type="tel"
                  placeholder="+91 Mobile Number"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="input-styled"
                />
                <label className="checkbox-wrap">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={e => setConsent(e.target.checked)}
                  />
                  <span>{t('dashboard.consent')}</span>
                </label>
                <button type="submit" className="btn-sidebar-submit">
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}>
                    <Send size={15} /> {t('dashboard.subscribe_btn')}
                  </span>
                </button>
                {subStatus === 'success' && (
                  <p style={{ color: '#10b981', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                    <CheckCircle2 size={16} /> {t('dashboard.success')}
                  </p>
                )}
                {subStatus === 'error' && (
                  <p style={{ color: '#ef4444', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                    <AlertTriangle size={16} /> {t('dashboard.error')}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;