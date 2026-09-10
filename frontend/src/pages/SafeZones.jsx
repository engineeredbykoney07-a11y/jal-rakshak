import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, CloudRain, CloudDrizzle, Waves, Droplets, Mountain, TrendingUp, AlertTriangle, Activity, PhoneCall, Info } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import io from 'socket.io-client';

const shelterIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

const SafeZones = () => {
  const socketRef = useRef(null);
  const [userLocation, setUserLocation] = useState([30.0668, 79.0193]);
  const [sensorReadings, setSensorReadings] = useState([]);

  useEffect(() => {
    // Geolocation removed to force Uttarakhand location
    const socket = io('http://localhost:5000', {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('riskUpdate', (data) => {
      setSensorReadings(prev => {
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

  const allShelters = React.useMemo(() => {
    const list = [];
    sensorReadings.forEach(r => {
      const lat = r.location?.lat || userLocation[0];
      const lng = r.location?.lng || userLocation[1];
      
      list.push({
        id: `s1-${r.id}`,
        sensorId: r.id,
        name: `Relief Camp`,
        location: `Government Inter College, ${r.name.split(',')[0]}`,
        type: 'Shelter',
        capacity: 'High (500+ beds)',
        distance: '1.2 km',
        elevation: '1,850m',
        coords: [lat + 0.008, lng - 0.005],
        directions: 'Exit via NH-58 North towards the main highway. AVOID the lower valley bridge over the Mandakini river as it is prone to flash floods. Follow the luminescent blue evacuation markers placed every 100m along the road. The Relief Camp is located at the Government Inter College building on the hill crest.'
      });
      list.push({
        id: `s2-${r.id}`,
        sensorId: r.id,
        name: `Medical Center`,
        location: `Helipad Area, ${r.name.split(',')[0]}`,
        type: 'Medical',
        capacity: 'Medium (50 beds)',
        distance: '0.8 km',
        elevation: '1,720m',
        coords: [lat - 0.004, lng + 0.007],
        directions: 'Proceed to the East exit from the main bazaar. Climb the stone steps towards the helipad area, approximately 800m up the hill. Do NOT carry heavy luggage to ensure a swift ascent. The Medical Center is equipped with trauma care, oxygen reserves, and a satellite uplink.'
      });
    });
    return list;
  }, [sensorReadings, userLocation]);

  const escapeRoutes = React.useMemo(() => {
    const routes = [];
    allShelters.forEach(s => {
      const sensor = sensorReadings.find(r => r.id === s.sensorId);
      if (sensor) {
        const lat = sensor.location?.lat || userLocation[0];
        const lng = sensor.location?.lng || userLocation[1];
        routes.push([[lat, lng], s.coords]);
      }
    });
    return routes;
  }, [allShelters, sensorReadings, userLocation]);

  const officials = [
    { name: 'District Magistrate (DM)', role: 'Rudraprayag / Uttarkashi Command Center', phone: '+91-1364-233300' },
    { name: 'SDRF Uttarakhand', role: 'State Disaster Response Force - Rescue Operations', phone: '+91-9456596190' },
    { name: 'National Disaster Helpline', role: 'Central Emergency Response (NDMA)', phone: '1078' },
    { name: 'Medical Emergency', role: 'Air Ambulance & Trauma Care', phone: '108' },
  ];

  const tierColor = { Normal: '#A0B0BA', Watch: '#E8B94A', Warning: '#FF9800', Evacuate: '#F44336' };

  return (
    <div className="dashboard safe-zones-page">
      <div className="safe-zones-header">
        <h2><ShieldAlert size={28} color="#0066cc" /> Safe Zones & Escape Routes</h2>
        <p>Real-time evacuation guidance based on Jal Rakshak telemetry.</p>
      </div>

      {/* Live Sensor Strip */}
      {sensorReadings.length > 0 && (
        <div className="sensor-strip">
          {sensorReadings.map(r => (
            <div key={r.id} className={`sensor-strip-card tier-${r.tier.toLowerCase()}`}>
              <div className="sensor-strip-title">
                {r.name}
                <span className="tier-badge">{r.tier}</span>
              </div>
              <div className="sensor-strip-grid">
                <div className="sensor-stat">
                  <span className="sensor-label"><CloudRain size={14} /> Rainfall</span>
                  <span className="sensor-val">{Number(r.rainfall).toFixed(2)} mm</span>
                </div>
                <div className="sensor-stat">
                  <span className="sensor-label"><CloudDrizzle size={14} /> 6h Rain</span>
                  <span className="sensor-val">{Number(r.rain6h).toFixed(2)} mm</span>
                </div>
                <div className="sensor-stat">
                  <span className="sensor-label"><Waves size={14} /> Water Lvl</span>
                  <span className="sensor-val">{Number(r.level).toFixed(1)}</span>
                </div>
                <div className="sensor-stat">
                  <span className="sensor-label"><Droplets size={14} /> Moisture</span>
                  <span className="sensor-val">{r.soilMoisture}%</span>
                </div>
                <div className="sensor-stat">
                  <span className="sensor-label"><Mountain size={14} /> Elevation</span>
                  <span className="sensor-val">{r.elevation} m</span>
                </div>
                <div className="sensor-stat">
                  <span className="sensor-label"><TrendingUp size={14} /> Slope</span>
                  <span className="sensor-val">{r.slope}°</span>
                </div>
                <div className="sensor-stat">
                  <span className="sensor-label"><AlertTriangle size={14} /> Blockage</span>
                  <span className="sensor-val" style={{textTransform:'capitalize'}}>{r.blockage}</span>
                </div>
                <div className="sensor-stat">
                  <span className="sensor-label"><Activity size={14} /> Risk</span>
                  <span className="sensor-val">{r.score}/100</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="dash-grid">
        <div className="map-container">
          <MapContainer center={userLocation} zoom={13} style={{ height: '100%', width: '100%', zIndex: 1 }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <ChangeView center={userLocation} zoom={13} />
            {sensorReadings.map(r => (
              <Marker key={`sensor-${r.id}`} position={[r.location?.lat || userLocation[0], r.location?.lng || userLocation[1]]} icon={userIcon}>
                <Tooltip permanent direction="top" offset={[0, -30]} className="map-marker-label">
                  <strong>{r.name}</strong>
                </Tooltip>
                <Popup>
                  <strong>{r.name}</strong><br />
                  Tier: {r.tier}<br />
                  <em>Follow dashed routes to nearby safety zones.</em>
                </Popup>
              </Marker>
            ))}
            {allShelters.map(s => (
              <Marker key={s.id} position={s.coords} icon={shelterIcon}>
                <Tooltip permanent direction="bottom" offset={[0, 10]} className="map-shelter-label">
                  {s.name}
                </Tooltip>
                <Popup><strong>{s.name}</strong><br />Type: {s.type}<br />Capacity: {s.capacity}</Popup>
              </Marker>
            ))}
            {escapeRoutes.map((route, idx) => (
              <Polyline key={idx} positions={route} color="#0066cc" weight={4} opacity={0.8} dashArray="8, 8" />
            ))}
          </MapContainer>
        </div>

        <div className="sidebar">
          <div className="gov-console instructions-card">
            <div className="gov-console-topbar" style={{ background: '#fef2f2', borderColor: '#fee2e2', color: '#b91c1c' }}>
              <span><AlertTriangle size={16} style={{display:'inline', verticalAlign:'text-bottom'}}/> EVACUATION PROTOCOL</span>
            </div>
            <div className="gov-console-body" style={{ alignItems: 'flex-start', padding: '1.25rem' }}>
              <p style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: '#475569' }}>If an <strong style={{ color: '#ef4444' }}>Evacuate</strong> alert is issued:</p>
              <ul style={{ paddingLeft: '1.25rem', color: '#334155', fontSize: '0.85rem' }}>
                <li style={{ marginBottom: '0.5rem' }}>Grab your emergency kit and IDs.</li>
                <li style={{ marginBottom: '0.5rem' }}>Follow the thick blue lines on the map to the nearest green shelter.</li>
                <li>Avoid low-lying areas and follow local authority instructions.</li>
              </ul>
            </div>
          </div>

          <div className="compact-panel shelters-list">
            <h3 style={{ fontSize: '1rem', color: 'var(--gov-navy)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={18} color="#0066cc" /> Safe Locations
            </h3>
            {allShelters.length === 0 && <p style={{fontSize:'0.85rem', color:'#64748b'}}>Waiting for sensor telemetry...</p>}
            {allShelters.map(s => (
              <div key={s.id} className="shelter-item" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem 0', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="shelter-info">
                    <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{s.name}</strong>
                    <span style={{ fontSize: '0.85rem', color: '#475569', marginLeft: '0.5rem', fontWeight: 500 }}>— {s.location}</span>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
                      <span className="shelter-type">{s.type}</span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', background: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Capacity: {s.capacity}</span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', background: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Elev: {s.elevation}</span>
                    </div>
                  </div>
                  <div className="shelter-distance" style={{ fontWeight: 800, color: '#0066cc' }}>{s.distance}</div>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', borderLeft: '3px solid #0066cc', marginTop: '0.25rem' }}>
                  <span style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 800, marginBottom: '0.2rem' }}>Evacuation Route</span>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>{s.directions}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="compact-panel officials-directory">
            <h3 style={{ fontSize: '1rem', color: 'var(--gov-navy)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PhoneCall size={18} color="#0066cc" /> Emergency Contacts
            </h3>
            {officials.map((off, idx) => (
              <div key={idx} className="official-alert-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="official-alert-title">{off.name}</div>
                  <div className="official-alert-desc" style={{ marginBottom: 0 }}>{off.role}</div>
                </div>
                <div className="contact-btn">
                  <a href={`tel:${off.phone}`} style={{ textDecoration: 'none', color: '#0066cc', fontWeight: '700', fontSize: '0.85rem', background: '#e0f2fe', padding: '0.4rem 0.8rem', borderRadius: '6px' }}>{off.phone}</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafeZones;
