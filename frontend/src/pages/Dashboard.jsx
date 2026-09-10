import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, useMap, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import io from 'socket.io-client';
import { Bell, ShieldAlert, CheckCircle2, AlertTriangle, Radio, Activity, Send, HardHat, UserCheck, Users, Home, Phone, MapPin } from 'lucide-react';

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
  const [callStatus, setCallStatus] = useState(null); // null | 'calling' | 'success' | { error, hint }
  const [callPhone, setCallPhone] = useState('');
  const [advisoryMessages, setAdvisoryMessages] = useState(null);

  useEffect(() => {
    // Geolocation removed to force Uttarakhand location

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

    socket.on('advisoryUpdate', (data) => {
      setAdvisoryMessages(data);
    });

    return () => socket.disconnect();
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!consent) {
      setSubStatus('no-consent');
      return;
    }
    if (!phone) {
      setSubStatus('no-phone');
      return;
    }
    setSubStatus('loading');
    try {
      const res = await fetch('http://localhost:5000/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phone,
          locationId: 'ridgeroad',
          language: 'en',
          consentGiven: true
        })
      });
      if (res.ok) setSubStatus('success');
      else setSubStatus('server-error');
    } catch {
      setSubStatus('network-error');
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

  const getTierColor = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'evacuate': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'watch': return '#3b82f6';
      default: return '#10b981';
    }
  };

  const handleTestCall = async () => {
    if (!callPhone) return;
    setCallStatus('calling');
    try {
      const res = await fetch('http://localhost:5000/api/test-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: callPhone }),
      });
      const data = await res.json();
      if (res.ok) {
        setCallStatus({ success: true, sid: data.sid });
      } else {
        setCallStatus({ error: data.error, hint: data.hint });
      }
    } catch (e) {
      setCallStatus({ error: 'Cannot reach backend. Is it running on port 5000?' });
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
          <div className="map-legend-detailed">
            <span style={{ color: '#475569', textTransform: 'uppercase', fontSize: '0.72rem', fontWeight: 800, marginBottom: '0.6rem', display: 'block' }}>Risk Categories</span>
            
            <div className="legend-row">
              <span className="legend-badge badge-normal"></span>
              <div className="legend-text">
                <strong>Normal</strong>
                <span className="legend-desc">Safe conditions, no immediate threat.</span>
              </div>
            </div>

            <div className="legend-row">
              <span className="legend-badge badge-watch"></span>
              <div className="legend-text">
                <strong>Watch</strong>
                <span className="legend-desc">Monitor updates, potential for heavy rain.</span>
              </div>
            </div>

            <div className="legend-row">
              <span className="legend-badge badge-warning"></span>
              <div className="legend-text">
                <strong>Warning</strong>
                <span className="legend-desc">Prepare for possible relocation.</span>
              </div>
            </div>

            <div className="legend-row">
              <span className="legend-badge badge-evacuate"></span>
              <div className="legend-text">
                <strong>Evacuate</strong>
                <span className="legend-desc">Immediate danger! Move to safe zones.</span>
              </div>
            </div>
          </div>

          <div className="map-helpline-panel">
            <span style={{ color: '#ef4444', textTransform: 'uppercase', fontSize: '0.72rem', fontWeight: 800, marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Phone size={14} /> National Helplines
            </span>
            <div className="helpline-row">
              <strong>NDRF (National):</strong> <span>1078</span>
            </div>
            <div className="helpline-row">
              <strong>State Control Room:</strong> <span>1070</span>
            </div>
            <div className="helpline-row">
              <strong>Medical Emergency:</strong> <span>108</span>
            </div>
          </div>

          <div className="map-locations-panel">
            <span style={{ color: '#0369a1', textTransform: 'uppercase', fontSize: '0.72rem', fontWeight: 800, marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <MapPin size={14} /> Active Sensors
            </span>
            {readings.length > 0 ? readings.map(r => (
              <div key={r.id} className="location-row">
                <span className={`legend-badge ${getTierClass(r.tier)}`}></span>
                <strong>{r.name}</strong>
              </div>
            )) : (
              <div className="location-row" style={{ color: '#94a3b8' }}>Waiting for data...</div>
            )}
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
              <CircleMarker
                key={r.id}
                center={r.coords}
                radius={12}
                pathOptions={{ color: '#ffffff', weight: 2, fillColor: getTierColor(r.tier), fillOpacity: 0.9 }}
              >
                <Tooltip permanent direction="top" offset={[0, -10]} className="map-marker-label">
                  <strong>{r.name}</strong>
                </Tooltip>
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
              </CircleMarker>
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
                      <h5 style={{ marginBottom: '0.25rem' }}>{a.title}</h5>
                      <p style={{ marginBottom: '0.5rem', color: '#475569' }}>{a.contentSnippet || 'Refer to regional bulletin.'}</p>
                      {a.titleEn && a.titleEn !== a.title && (
                        <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>English Translation</span>
                          <h5 style={{ fontSize: '0.85rem', color: '#1e293b', marginTop: '0.25rem', marginBottom: '0.15rem' }}>{a.titleEn}</h5>
                          <p style={{ fontSize: '0.82rem', color: '#334155', margin: 0 }}>{a.contentSnippetEn}</p>
                        </div>
                      )}
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
                {subStatus === 'loading' && (
                  <p style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>
                    Subscribing...
                  </p>
                )}
                {subStatus === 'success' && (
                  <p style={{ color: '#10b981', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                    <CheckCircle2 size={16} /> {t('dashboard.success')}
                  </p>
                )}
                {subStatus === 'no-consent' && (
                  <p style={{ color: '#ef4444', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                    <AlertTriangle size={16} /> Please check the consent box first.
                  </p>
                )}
                {subStatus === 'no-phone' && (
                  <p style={{ color: '#ef4444', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                    <AlertTriangle size={16} /> Please enter a valid phone number.
                  </p>
                )}
                {subStatus === 'server-error' && (
                  <p style={{ color: '#ef4444', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                    <AlertTriangle size={16} /> Server error. Please try again.
                  </p>
                )}
                {subStatus === 'network-error' && (
                  <p style={{ color: '#ef4444', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                    <AlertTriangle size={16} /> Cannot reach server. Is the backend running?
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── Voice Call Panel ── */}
      <div style={{ padding: '0 2rem 1.5rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '16px', padding: '1.75rem', border: '1px solid #334155', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{ background: '#22c55e', borderRadius: '10px', padding: '8px', display: 'flex' }}>
              <Activity size={20} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>Automated Voice Call System</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: 0 }}>Twilio IVR — multilingual emergency calls with keypad confirmation</p>
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {/* How it works */}
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '1rem' }}>
              <p style={{ color: '#60a5fa', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>What the caller hears</p>
              <ol style={{ color: '#cbd5e1', fontSize: '0.82rem', lineHeight: 1.9, margin: 0, paddingLeft: '1.25rem' }}>
                <li>🔊 <strong style={{color:'#fff'}}>English intro</strong> — "Emergency alert from Jal Rakshak..."</li>
                <li>📍 <strong style={{color:'#fff'}}>Risk level + location</strong> — "EVACUATION ordered. Kedarnath Valley."</li>
                <li>🌐 <strong style={{color:'#fff'}}>Local language warning</strong> — Hindi/Telugu spoken aloud</li>
                <li>🏃 <strong style={{color:'#fff'}}>Safety instructions</strong> — move to higher ground, take documents</li>
                <li>📞 <strong style={{color:'#fff'}}>Keypad confirmation</strong> — Press 1 = safe, Press 2 = need help</li>
              </ol>
            </div>

            {/* Test Call Widget */}
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '1rem' }}>
              <p style={{ color: '#60a5fa', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Test a Live Call Now</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <input
                  type="tel"
                  value={callPhone}
                  onChange={e => { setCallPhone(e.target.value); setCallStatus(null); }}
                  placeholder="+919550702874"
                  style={{ flex: 1, background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '0.5rem 0.75rem', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                />
                <button
                  onClick={handleTestCall}
                  disabled={callStatus === 'calling' || !callPhone}
                  style={{ background: callStatus === 'calling' ? '#334155' : 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.5rem 1rem', fontSize: '0.82rem', fontWeight: 700, cursor: callStatus === 'calling' ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}
                >
                  {callStatus === 'calling' ? '⏳ Calling...' : '📞 Call Now'}
                </button>
              </div>

              {callStatus?.success && (
                <div style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid #22c55e', borderRadius: '8px', padding: '0.6rem 0.85rem' }}>
                  <p style={{ color: '#4ade80', fontSize: '0.82rem', margin: 0, fontWeight: 600 }}>✅ Call initiated! SID: {callStatus.sid?.slice(-8)}</p>
                  <p style={{ color: '#86efac', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>Pick up — you'll hear the full multilingual emergency alert.</p>
                </div>
              )}
              {callStatus?.error && (
                <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', borderRadius: '8px', padding: '0.6rem 0.85rem' }}>
                  <p style={{ color: '#f87171', fontSize: '0.8rem', margin: 0, fontWeight: 600 }}>❌ {callStatus.error}</p>
                  {callStatus.hint && <p style={{ color: '#fca5a5', fontSize: '0.75rem', margin: '0.35rem 0 0', lineHeight: 1.5 }}>💡 {callStatus.hint}</p>}
                </div>
              )}

              <p style={{ color: '#475569', fontSize: '0.72rem', marginTop: '0.75rem', lineHeight: 1.5 }}>
                ⚠️ Twilio trial: number must be <strong style={{color:'#64748b'}}>verified</strong> at twilio.com/console → Verified Caller IDs
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── AI Dispatch Panel ── */}
      <div style={{ padding: '0 2rem 2rem' }}>
        <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', padding: '1.75rem', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <ShieldAlert size={24} color="#0066cc" />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>AI Dispatch Messages</h3>
            {advisoryMessages && (
              <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                📍 {advisoryMessages.id}
              </span>
            )}
            <button
              onClick={() => fetch('http://localhost:5000/api/demo-dispatch', { method: 'POST' })}
              style={{ marginLeft: advisoryMessages ? '1rem' : 'auto', background: 'linear-gradient(135deg, #ef4444, #b91c1c)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.4rem 0.9rem', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Bell size={13} /> Simulate Emergency
            </button>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Automatically generated when risk reaches Warning or Evacuate — four targeted messages for four different responders.
          </p>

          {!advisoryMessages && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2.5rem', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
              <Radio size={32} color="#cbd5e1" style={{ marginBottom: '0.75rem' }} />
              <p style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>Monitoring... Messages will appear automatically when a Warning or Evacuate event is detected.</p>
            </div>
          )}

          {advisoryMessages && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              {/* Field Worker */}
              <div style={{ background: 'linear-gradient(135deg, #fefce8 0%, #fef3c7 100%)', borderRadius: '12px', padding: '1.25rem', border: '1.5px solid #fbbf24', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#f59e0b', borderRadius: '12px 0 0 12px' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                  <div style={{ background: '#f59e0b', borderRadius: '8px', padding: '6px', display: 'flex' }}>
                    <HardHat size={16} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Field Worker</div>
                    <div style={{ fontSize: '0.75rem', color: '#b45309' }}>Work Order</div>
                  </div>
                </div>
                <p style={{ fontSize: '0.88rem', color: '#78350f', lineHeight: 1.6, margin: 0 }}>{advisoryMessages.advisory?.worker || advisoryMessages.worker}</p>
              </div>

              {/* Officer */}
              <div style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', borderRadius: '12px', padding: '1.25rem', border: '1.5px solid #3b82f6', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#3b82f6', borderRadius: '12px 0 0 12px' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                  <div style={{ background: '#3b82f6', borderRadius: '8px', padding: '6px', display: 'flex' }}>
                    <UserCheck size={16} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>District Officer</div>
                    <div style={{ fontSize: '0.75rem', color: '#1d4ed8' }}>Operational Summary</div>
                  </div>
                </div>
                <p style={{ fontSize: '0.88rem', color: '#1e3a8a', lineHeight: 1.6, margin: 0 }}>{advisoryMessages.advisory?.officer || advisoryMessages.officer}</p>
              </div>

              {/* Resident — full width, highlighted */}
              <div style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', borderRadius: '12px', padding: '1.25rem', border: '2px solid #ef4444', position: 'relative', overflow: 'hidden', animation: 'pulse-border 2s infinite' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '6px', height: '100%', background: 'linear-gradient(180deg, #ef4444, #b91c1c)', borderRadius: '12px 0 0 12px' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                  <div style={{ background: '#ef4444', borderRadius: '8px', padding: '6px', display: 'flex' }}>
                    <Home size={16} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>⚠️ Community Resident Alert</div>
                    <div style={{ fontSize: '0.75rem', color: '#dc2626' }}>In their local language</div>
                  </div>
                </div>
                <p style={{ fontSize: '1rem', color: '#7f1d1d', lineHeight: 1.7, margin: 0, fontWeight: 600 }}>{advisoryMessages.advisory?.resident || advisoryMessages.resident}</p>
              </div>

              {/* Volunteer */}
              <div style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: '12px', padding: '1.25rem', border: '1.5px solid #22c55e', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#22c55e', borderRadius: '12px 0 0 12px' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                  <div style={{ background: '#22c55e', borderRadius: '8px', padding: '6px', display: 'flex' }}>
                    <Users size={16} color="#fff" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#14532d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Local Volunteer</div>
                    <div style={{ fontSize: '0.75rem', color: '#16a34a' }}>Door-to-door check — household with no phone</div>
                  </div>
                </div>
                <p style={{ fontSize: '0.88rem', color: '#14532d', lineHeight: 1.6, margin: 0 }}>{advisoryMessages.advisory?.volunteer || advisoryMessages.volunteer}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;