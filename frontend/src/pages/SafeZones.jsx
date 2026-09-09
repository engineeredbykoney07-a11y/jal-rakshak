import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        () => {}
      );
    }

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

  const shelters = [
    { id: 1, name: 'Govt Higher Secondary School', type: 'Shelter', coords: [userLocation[0] + 0.005, userLocation[1] - 0.004], capacity: 'High', distance: '1.2 km' },
    { id: 2, name: 'Community Hall, Sector 4', type: 'Shelter', coords: [userLocation[0] - 0.006, userLocation[1] + 0.007], capacity: 'Medium', distance: '2.5 km' },
    { id: 3, name: 'District Hospital', type: 'Medical', coords: [userLocation[0] + 0.002, userLocation[1] + 0.008], capacity: 'High', distance: '1.8 km' },
  ];
  const escapeRoutes = shelters.map(s => [userLocation, s.coords]);

  const officials = [
    { name: 'R. K. Sharma', role: 'Disaster Management Officer', phone: '+91-9876543210' },
    { name: 'Smt. Anjali Devi', role: 'Local Sarpanch', phone: '+91-9876543211' },
    { name: 'Police Station', role: 'Emergency Response', phone: '100 / 112' },
    { name: 'Medical Emergency', role: 'Ambulance', phone: '108' },
  ];

  const tierColor = { Normal: '#A0B0BA', Watch: '#E8B94A', Warning: '#FF9800', Evacuate: '#F44336' };

  return (
    <div className="dashboard safe-zones-page">
      <h2>Safe Zones & Escape Routes</h2>

      {/* Live Sensor Strip */}
      {sensorReadings.length > 0 && (
        <div className="sensor-strip">
          {sensorReadings.map(r => (
            <div key={r.id} className="sensor-strip-card" style={{ borderColor: tierColor[r.tier] || 'var(--slate)' }}>
              <div className="sensor-strip-title" style={{ color: tierColor[r.tier] || 'var(--text-primary)' }}>
                {r.name} — <span>{r.tier}</span>
              </div>
              <div className="sensor-strip-grid">
                <div className="sensor-stat"><span className="sensor-label">🌧 Rainfall</span><span className="sensor-val">{Number(r.rainfall).toFixed(2)} mm</span></div>
                <div className="sensor-stat"><span className="sensor-label">🌧 6h Rain</span><span className="sensor-val">{Number(r.rain6h).toFixed(2)} mm</span></div>
                <div className="sensor-stat"><span className="sensor-label">💧 Water Lvl</span><span className="sensor-val">{Number(r.level).toFixed(1)}</span></div>
                <div className="sensor-stat"><span className="sensor-label">🌱 Soil Moisture</span><span className="sensor-val">{r.soilMoisture}%</span></div>
                <div className="sensor-stat"><span className="sensor-label">⛰ Elevation</span><span className="sensor-val">{r.elevation} m</span></div>
                <div className="sensor-stat"><span className="sensor-label">📐 Slope</span><span className="sensor-val">{r.slope}°</span></div>
                <div className="sensor-stat"><span className="sensor-label">🚧 Blockage</span><span className="sensor-val" style={{textTransform:'capitalize'}}>{r.blockage}</span></div>
                <div className="sensor-stat"><span className="sensor-label">🎯 Risk Score</span><span className="sensor-val">{r.score}/100</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="dash-grid">
        <div className="map-container">
          <MapContainer center={userLocation} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <ChangeView center={userLocation} zoom={13} />
            <Marker position={userLocation} icon={userIcon}>
              <Popup><strong>Your Location</strong><br />Follow dashed routes to safety.</Popup>
            </Marker>
            {shelters.map(s => (
              <Marker key={s.id} position={s.coords} icon={shelterIcon}>
                <Popup><strong>{s.name}</strong><br />Type: {s.type}<br />Capacity: {s.capacity}</Popup>
              </Marker>
            ))}
            {escapeRoutes.map((route, idx) => (
              <Polyline key={idx} positions={route} color="#3AA593" weight={4} opacity={0.8} dashArray="10, 10" />
            ))}
          </MapContainer>
        </div>

        <div className="sidebar">
          <div className="card instructions-card">
            <h3 style={{ color: '#E8B94A' }}>Evacuation Instructions</h3>
            <p style={{ margin: '0.5rem 0' }}>If you receive an <strong style={{ color: '#F44336' }}>Evacuate</strong> alert:</p>
            <ul>
              <li>Grab your emergency kit.</li>
              <li>Follow the dashed teal lines to the nearest green shelter.</li>
              <li>Avoid low-lying areas and flooded roads.</li>
            </ul>
          </div>

          <div className="card shelters-list">
            <h3 style={{ color: 'var(--teal-light)', marginBottom: '1rem' }}>Nearby Safe Locations</h3>
            {shelters.map(s => (
              <div key={s.id} className="shelter-item">
                <div className="shelter-info">
                  <strong>{s.name}</strong>
                  <span className="shelter-type">{s.type}</span>
                </div>
                <div className="shelter-distance">{s.distance}</div>
              </div>
            ))}
          </div>

          <div className="official-alerts-panel officials-directory">
            <h3>Emergency Contacts</h3>
            {officials.map((off, idx) => (
              <div key={idx} className="official-alert-item">
                <div className="official-alert-title">{off.name}</div>
                <div className="official-alert-desc">{off.role}</div>
                <div style={{ fontSize: '1rem', fontWeight: '500', color: 'var(--text-primary)', marginTop: '0.4rem' }}>
                  📞 {off.phone}
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
