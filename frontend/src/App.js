import React from 'react';
import './i18n';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import SafeZones from './pages/SafeZones';
import Simulation from './pages/Simulation';
import './i18n';
import './index.css';

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/safe-zones" element={<SafeZones />} />
            <Route path="/simulation" element={<Simulation />} />
          </Routes>
        </div>
        <footer className="gov-footer">
          <div className="footer-status-indicator">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
            <span>JAL RAKSHAK TELEMETRY CORE • PROTOCOL V2.4</span>
          </div>
          <div>
            <span>Open-Source Disaster Risk Reduction Engine</span>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;