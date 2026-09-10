import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { CloudRain, Activity, BarChart2, ShieldAlert } from 'lucide-react';

const Simulation = () => {
  const [dataStream, setDataStream] = useState([]);
  const socketRef = useRef(null);
  
  useEffect(() => {
    const socket = io('http://localhost:5000', {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('riskUpdate', (data) => {
      // Only capture simulation/replay data
      if (data.source === 'era5-imerg' || data.source === 'simulator') {
        setDataStream(prev => {
          const stream = [...prev, data];
          return stream.length > 20 ? stream.slice(stream.length - 20) : stream;
        });
      }
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="dashboard simulation-page" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="safe-zones-header">
        <h2><BarChart2 size={28} color="#0066cc" /> Telemetry Simulation & Dataset</h2>
        <p>Real-time visualization of the ERA5/IMERG historical dataset replay and active simulations.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginTop: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          <div className="compact-panel" style={{ minHeight: '400px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
              <CloudRain size={20} color="#0066cc" /> Live Rainfall Precipitation (mm/hr)
            </h3>
            
            {/* Chart area — use a relative container so we can do absolute bars */}
            <div style={{ position: 'relative', width: '100%', height: '260px', background: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', padding: '0.75rem 0.75rem 2.5rem', boxSizing: 'border-box' }}>
              {/* Y-axis grid lines */}
              {[100, 75, 50, 25].map(pct => (
                <div key={pct} style={{ position: 'absolute', left: 0, right: 0, bottom: `calc(2.5rem + ${pct / 100} * (260px - 2.5rem - 0.75rem))`, borderTop: '1px dashed #1e3a5f', zIndex: 1 }}>
                  <span style={{ position: 'absolute', right: '4px', top: '-8px', fontSize: '0.55rem', color: '#334155' }}>{pct}%</span>
                </div>
              ))}

              {dataStream.length === 0 && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155', fontSize: '0.9rem' }}>
                  ⏳ Waiting for dataset stream...
                </div>
              )}

              {dataStream.length > 0 && (() => {
                const CHART_H = 200; // px — available bar area
                const maxRain = Math.max(...dataStream.map(d => d.rainfall), 0.001);
                const barW = `${Math.max(100 / dataStream.length - 1, 2)}%`;

                return dataStream.map((point, i) => {
                  const barH = Math.max((point.rainfall / maxRain) * CHART_H, 4);
                  const isCloudburst = point.cloudburstLabel === 1 || point.rainfall > 5;
                  const leftPct = `${(i / dataStream.length) * 100}%`;
                  const barColor = isCloudburst
                    ? 'linear-gradient(0deg, #b91c1c 0%, #ef4444 100%)'
                    : 'linear-gradient(0deg, #1d4ed8 0%, #60a5fa 100%)';

                  return (
                    <div key={i} title={`${point.name}\n${point.rainfall.toFixed(4)}mm @ ${new Date(point.timestamp).toLocaleTimeString()}`}
                      style={{ position: 'absolute', bottom: '2.5rem', left: leftPct, width: barW }}>
                      {/* Bar */}
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: `${barH}px`,
                        background: barColor,
                        borderRadius: '3px 3px 0 0',
                        boxShadow: isCloudburst ? '0 0 8px rgba(239,68,68,0.6)' : '0 0 6px rgba(96,165,250,0.4)',
                        transition: 'height 0.4s ease',
                        zIndex: 2,
                      }} />
                      {/* Value label above bar */}
                      <div style={{
                        position: 'absolute',
                        bottom: `${barH + 2}px`,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '0.55rem',
                        color: '#94a3b8',
                        whiteSpace: 'nowrap',
                        zIndex: 3,
                      }}>{point.rainfall.toFixed(2)}</div>
                    </div>
                  );
                });
              })()}

              {/* X-axis labels */}
              {dataStream.length > 0 && (
                <div style={{ position: 'absolute', bottom: '0.25rem', left: 0, right: 0, display: 'flex', justifyContent: 'space-around' }}>
                  {dataStream.map((p, i) => (
                    <span key={i} style={{ fontSize: '0.55rem', color: '#475569', textAlign: 'center', flex: 1 }}>
                      {new Date(p.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="compact-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
            <img 
              src="/simulation_sensor.png" 
              alt="Telemetry Sensor Node" 
              style={{ width: '100%', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', border: '4px solid #ffffff' }} 
            />
            <p style={{ marginTop: '1.5rem', color: '#475569', fontSize: '0.95rem', textAlign: 'center', fontWeight: '500' }}>
              Live telemetry ingestion from autonomous Jal Rakshak sentinel nodes.
            </p>
          </div>
        </div>

        <div className="compact-panel">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
            <Activity size={20} color="#0066cc" /> Raw Data Stream
          </h3>
          <div style={{ background: '#1e293b', borderRadius: '8px', padding: '1rem', height: '250px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.8rem', color: '#38bdf8' }}>
            {dataStream.length === 0 && <span style={{ color: '#475569' }}>No data ingested yet...</span>}
            {[...dataStream].reverse().map((point, i) => (
              <div key={i} style={{ borderBottom: '1px solid #334155', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ color: '#94a3b8' }}>[{new Date(point.timestamp).toLocaleTimeString()}]</span> 
                <span style={{ color: '#10b981', marginLeft: '0.5rem' }}>{point.name}</span>
                <span style={{ color: '#e2e8f0', marginLeft: '0.5rem' }}>
                  Rainfall: {point.rainfall.toFixed(2)}mm | 6h: {point.rain6h.toFixed(2)}mm | Risk Score: {point.score} ({point.tier})
                </span>
                {point.tier === 'Evacuate' && (
                  <span style={{ color: '#ef4444', marginLeft: '0.5rem', fontWeight: 'bold' }}>[CLOUDBURST DETECTED]</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulation;
