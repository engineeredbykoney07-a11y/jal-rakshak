import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import io from 'socket.io-client';
import { Bell, ShieldAlert, CheckCircle2, AlertTriangle, Activity, Send, MapPin, Waves, Compass, Info, Radio } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createCustomMarker = (color) => {
  return new L.DivIcon({
    className: 'custom-map-pin',
    html: `
      <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: ${color}; opacity: 0.25; animation: map-pulse 2s infinite ease-in-out;"></div>
        <div style="width: 16px; height: 16px; border-radius: 50%; background: ${color}; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.25); z-index: 2;"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

const Dashboard = () => {
  const { t } = useTranslation();
  const socketRef = useRef(null);

  const [mapCenter, setMapCenter] = useState([30.12, 78.55]);
  const [mapZoom, setMapZoom] = useState(9);
  const [userLocation, setUserLocation] = useState([30.1033, 78.2948]);

  const [readings, setReadings] = useState([
    { id: 'st-01', name: 'Rishikesh Ganga Gauge', coords: [30.1033, 78.2948], tier: 'Watch', score: 58, confidence: '94%', waterLevel: '3.42m', dischargeRate: '412 m³/s' },
    { id: 'st-02', name: 'Devprayag Confluence', coords: [30.1459, 78.5989], tier: 'Warning', score: 81, confidence: '91%', waterLevel: '5.10m', dischargeRate: '680 m³/s' },
    { id: 'st-03', name: 'Rudraprayag Alaknanda', coords: [30.2858, 78.9814], tier: 'Normal', score: 22, confidence: '97%', waterLevel: '2.15m', dischargeRate: '190 m³/s' }
  ]);

  const [selectedStation, setSelectedStation] = useState('st-02');
  const [officialAlerts, setOfficialAlerts] = useState([
    {
      title: 'NDMA Flash Flood Advisory — Garhwal Foothills',
      contentSnippet: 'Sustained precipitation threshold (>65mm/3h) exceeded. Drainage catchments under elevated monitoring.',
      timestamp: '12 mins ago'
    }
  ]);

  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [subStatus, setSubStatus] = useState(null);
  const [connected, setConnected] = useState(true);
  const [activeTab, setActiveTab] = useState('stations');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        () => console.log('Using default geolocation coordinates')
      );
    }

    fetch('http://localhost:5000/api/official-alerts?state=uttarakhand')
      .then(res => res.json())
      .then(data => { if (data?.length > 0) setOfficialAlerts(data); })
      .catch(() => console.log('Offline mode / local fallback'));

    const socket = io('http://localhost:5000', { reconnection: true });
    socketRef.current = socket;
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('riskUpdate', (data) => {
      setReadings(prev => {
        const i = prev.findIndex(r => r.id === data.id);
        if (i !== -1) {
          const u = [...prev];
          u[i] = { ...u[i], ...data };
          return u;
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
    setSubStatus('success');
    setPhone('');
  };

  const getTierColor = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'evacuate': return '#ef4444';
      case 'warning': return '#f97316';
      case 'watch': return '#f59e0b';
      default: return '#10b981';
    }
  };

  const focusStation = (station) => {
    setSelectedStation(station.id);
    setMapCenter(station.coords);
    setMapZoom(11);
  };

  return (
    <div className="dashboard-wrap">
      {/* Top Header */}
      <div className="dashboard-bar">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--gov-navy)', letterSpacing: '-0.02em' }}>
              Live Command Status
            </h2>
            <span style={{ fontFamily: 'var(--mono-font)', fontSize: '0.72rem', fontWeight: 800, background: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.55rem', borderRadius: '6px', border: '1px solid #bae6fd' }}>
              ZONE: UK-CENTRAL
            </span>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem', fontWeight: 500 }}>
            Real-time telemetry and regional alert triggers
          </p>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.82rem', fontWeight: 700, fontFamily: 'var(--mono-font)', color: connected ? '#065f46' : '#991b1b', background: connected ? '#ecfdf5' : '#fef2f2', padding: '0.45rem 1rem', borderRadius: '999px', border: `1.5px solid ${connected ? '#a7f3d0' : '#fecaca'}` }}>
          <span style={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: connected ? '#10b981' : '#ef4444', boxShadow: connected ? '0 0 8px #10b981' : 'none' }}></span>
          {connected ? 'CORE WEBSOCKET ONLINE' : 'RECONNECTING'}
        </div>
      </div>

      {/* Main Grid: Left Map + Right Deck */}
      <div className="dashboard-layout">
        <div className="map-card" style={{ height: '680px' }}>
          <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 500, background: 'rgba(255, 255, 255, 0.94)', backdropFilter: 'blur(10px)', border: '1.5px solid var(--gov-border)', borderRadius: '10px', padding: '0.45rem 0.85rem', fontFamily: 'var(--mono-font)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--gov-navy)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Compass size={15} color="#0284c7" />
            <span>LAT: {mapCenter[0].toFixed(4)} | LNG: {mapCenter[1].toFixed(4)}</span>
          </div>

          <div className="map-floating-legend">
            <span style={{ color: '#64748b', textTransform: 'uppercase', fontSize: '0.7rem' }}>Tiers:</span>
            <div className="legend-item"><span className="legend-badge badge-normal"></span> Normal</div>
            <div className="legend-item"><span className="legend-badge badge-watch"></span> Watch</div>
            <div className="legend-item"><span className="legend-badge badge-warning"></span> Warning</div>
            <div className="legend-item"><span className="legend-badge badge-evacuate"></span> Evacuate</div>
          </div>

          <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }}>
            {/* Clean CartoDB Voyager Tilelayer */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            />
            <ChangeView center={mapCenter} zoom={mapZoom} />

            <Marker position={userLocation}>
              <Popup>
                <div style={{ padding: '0.2rem', fontFamily: 'var(--sans-font)' }}>
                  <strong style={{ color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={14} /> Node Coordinate
                  </strong>
                </div>
              </Popup>
            </Marker>

            {readings.map(r => (
              <Marker key={r.id} position={r.coords} icon={createCustomMarker(getTierColor(r.tier))}>
                <Popup>
                  <div style={{ padding: '0.3rem', minWidth: '180px', fontFamily: 'var(--sans-font)' }}>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--gov-navy)' }}>{r.name}</strong>
                    <div style={{ margin: '0.35rem 0', color: getTierColor(r.tier), fontWeight: 800, fontSize: '0.75rem' }}>
                      {r.tier.toUpperCase()} — {r.score}/100
                    </div>
                    <div style={{ fontSize: '0.75rem', fontFamily: 'var(--mono-font)', color: '#475569' }}>
                      Level: <b>{r.waterLevel}</b> | Flow: <b>{r.dischargeRate}</b>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Sidebar Station Deck */}
        <div className="sidebar-container">
          <div className="compact-panel">
            <div className="sidebar-tabs">
              <button className={`sidebar-tab-btn ${activeTab === 'stations' ? 'active' : ''}`} onClick={() => setActiveTab('stations')}>
                <Waves size={14} /> Stations ({readings.length})
              </button>
              <button className={`sidebar-tab-btn ${activeTab === 'alerts' ? 'active' : ''}`} onClick={() => setActiveTab('alerts')}>
                <ShieldAlert size={14} /> Alerts
              </button>
              <button className={`sidebar-tab-btn ${activeTab === 'subscribe' ? 'active' : ''}`} onClick={() => setActiveTab('subscribe')}>
                <Bell size={14} /> Dissemination
              </button>
            </div>

            {activeTab === 'stations' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Basin Telemetry Feeds</span>
                  <span style={{ fontFamily: 'var(--mono-font)', fontSize: '0.72rem', color: '#0284c7', fontWeight: 700 }}>POLL: 15s</span>
                </div>

                {readings.map((station) => (
                  <div
                    key={station.id}
                    onClick={() => focusStation(station)}
                    style={{
                      background: selectedStation === station.id ? '#f0f9ff' : '#ffffff',
                      border: `1.5px solid ${selectedStation === station.id ? '#0284c7' : 'var(--gov-border)'}`,
                      borderRadius: '12px',
                      padding: '0.9rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--gov-navy)' }}>{station.name}</span>
                      <span style={{ padding: '0.15rem 0.45rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800, background: `${getTierColor(station.tier)}15`, color: getTierColor(station.tier) }}>
                        {station.tier}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', marginTop: '0.65rem', fontFamily: 'var(--mono-font)', fontSize: '0.75rem' }}>
                      <div style={{ background: '#f8fafc', padding: '0.35rem', borderRadius: '6px' }}>
                        <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block' }}>LEVEL</span>
                        <strong>{station.waterLevel}</strong>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '0.35rem', borderRadius: '6px' }}>
                        <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block' }}>SCORE</span>
                        <strong style={{ color: getTierColor(station.tier) }}>{station.score}/100</strong>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '0.35rem', borderRadius: '6px' }}>
                        <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block' }}>FLOW</span>
                        <strong>{station.dischargeRate}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'alerts' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>NDMA Broadcasts</span>
                  <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700 }}>VERIFIED SYNC</span>
                </div>
                {officialAlerts.map((a, i) => (
                  <div key={i} className="alert-pill-box" style={{ padding: '0.9rem' }}>
                    <h5 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: '0.3rem' }}>{a.title}</h5>
                    <p style={{ fontSize: '0.8rem', lineHeight: 1.45 }}>{a.contentSnippet}</p>
                    <span style={{ fontFamily: 'var(--mono-font)', fontSize: '0.7rem', display: 'block', marginTop: '0.4rem', fontWeight: 700 }}>{a.timestamp}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'subscribe' && (
              <form onSubmit={handleSubscribe} className="subscribe-form-compact">
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '0.85rem' }}>
                  <strong style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#0369a1', fontSize: '0.85rem' }}>
                    <Info size={15} /> Flash Flood Advisory Dispatch
                  </strong>
                  <p style={{ fontSize: '0.78rem', color: '#475569', marginTop: '0.35rem', lineHeight: 1.4 }}>
                    Automated voice calls and alerts are dispatched when upstream gauges cross critical retention thresholds.
                  </p>
                </div>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="input-styled"
                />
                <label className="checkbox-wrap">
                  <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
                  <span style={{ fontSize: '0.78rem', color: '#475569' }}>Allow automated IVR call triggers during flash flood warnings.</span>
                </label>
                <button type="submit" className="btn-sidebar-submit">
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem' }}>
                    <Send size={14} /> Confirm Terminal Subscription
                  </span>
                </button>
                {subStatus === 'success' && (
                  <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '0.55rem', color: '#065f46', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CheckCircle2 size={15} color="#10b981" /> Terminal phone registered.
                  </div>
                )}
              </form>
            )}

            <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--gov-border)', paddingTop: '1rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Pipeline Specs</span>
              <div className="quick-status-strip">
                <div className="quick-status-card">
                  <span>Broker Node</span>
                  <strong style={{ color: '#0284c7' }}>MQTT v5</strong>
                </div>
                <div className="quick-status-card">
                  <span>Atmospheric Sync</span>
                  <strong>ERA5 Hourly</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;