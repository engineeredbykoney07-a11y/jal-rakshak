import { useEffect, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import './App.css';

const BACKEND_URL = 'http://localhost:5000';

function App() {
  const [readings, setReadings] = useState([]);

  useEffect(() => {
    // Fetch existing readings when the page first loads
    axios.get(`${BACKEND_URL}/api/readings`)
      .then((res) => setReadings(res.data))
      .catch((err) => console.error('Failed to fetch readings:', err));

    // Listen for live updates pushed from the backend
    const socket = io(BACKEND_URL);
    socket.on('new-reading', (reading) => {
      setReadings((prev) => [reading, ...prev]);
    });

    return () => socket.disconnect();
  }, []);

  const tierColor = (tier) => {
    if (tier === 'Critical') return '#ff4d4d';
    if (tier === 'Warning') return '#ffaa00';
    return '#4caf50';
  };

  return (
    <div className="App">
      <header style={{ padding: '20px', backgroundColor: '#1e2327', color: 'white' }}>
        <h1>Jal Rakshak — Flood Risk Dashboard</h1>
        <p>Live sensor readings and risk tiers</p>
      </header>

      <main style={{ padding: '20px' }}>
        {readings.length === 0 && <p>No readings yet. Waiting for sensor data...</p>}

        {readings.map((r) => (
          <div
            key={r._id}
            style={{
              border: `2px solid ${tierColor(r.riskTier)}`,
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '10px',
              textAlign: 'left',
            }}
          >
            <strong>Node:</strong> {r.nodeId} &nbsp;|&nbsp;
            <strong>Risk Tier:</strong>{' '}
            <span style={{ color: tierColor(r.riskTier), fontWeight: 'bold' }}>
              {r.riskTier || 'N/A'}
            </span>
            &nbsp;|&nbsp;
            <strong>Score:</strong> {r.riskScore ?? 'N/A'}
            <br />
            <strong>Water Level:</strong> {r.waterLevel} cm &nbsp;|&nbsp;
            <strong>Blockage:</strong> {r.blockageSeverity} &nbsp;|&nbsp;
            <strong>Rainfall:</strong> {r.rainfall} mm

            {r.advisory && (
              <div style={{ marginTop: '8px', fontSize: '0.9em' }}>
                <strong>Resident Alert:</strong> {r.advisory.resident}
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  );
}

export default App;