import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, ArrowRight, Activity, Zap, ShieldAlert, AlertTriangle } from 'lucide-react';

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState('watch'); // 'normal' | 'watch' | 'warning' | 'evacuate'

  // Tier configurations for the interactive console widget
  const tierConfig = {
    normal: { val: 24, label: 'NORMAL STATUS', color: '#10b981', dash: 334, text: 'All sensor nodes operating within nominal thresholds.' },
    watch: { val: 59, label: 'ELEVATED WATCH', color: '#f59e0b', dash: 180, text: 'Sustained rainfall detected. Monitoring catchment zones.' },
    warning: { val: 82, label: 'HIGH WARNING', color: '#f97316', dash: 79, text: 'Precipitation exceeding safe discharge rates in sector.' },
    evacuate: { val: 96, label: 'CRITICAL EVACUATION', color: '#ef4444', dash: 18, text: 'Immediate flash flood risk. Voice/SMS triggers active.' }
  };

  const current = tierConfig[selectedTier];
  const circumference = 440;
  const strokeDashoffset = circumference - (circumference * current.val) / 100;

  return (
    <main>
      <section className="hero-gov">
        <div className="hero-gov-left">
          <div className="gov-pill-bar">
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: current.color }}></span>
            <ShieldCheck size={16} color="#0284c7" />
            <span>National Sensor Grid • Realtime Mode</span>
          </div>
          
          <h1 className="hero-gov-title">
            {t('home.tagline_prefix')} <span>{t('home.tagline_highlight')}</span> {t('home.tagline_suffix')}
          </h1>

          <p className="hero-gov-desc">{t('home.subtitle')}</p>

          <div className="hero-action-row">
            <button className="btn-gov-primary" onClick={() => navigate('/dashboard')}>
              {t('home.cta_dashboard')}
              <ArrowRight size={18} />
            </button>
            <button className="btn-gov-outline" onClick={() => navigate('/how-it-works')}>
              {t('home.cta_pipeline')}
            </button>
          </div>
        </div>

        {/* Tactical Status Dial Box with Interactive Tier Switcher */}
        <div className="gov-console">
          <div className="gov-console-topbar">
            <span>SYS_ID: UK-HYDRO-08</span>
            <span style={{ color: current.color, display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800 }}>
              <Activity size={13} /> {current.label}
            </span>
          </div>

          <div className="gov-console-body">
            {/* Interactive Tier Buttons */}
            <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1rem', width: '100%', background: '#f1f5f9', padding: '0.25rem', borderRadius: '8px' }}>
              {Object.keys(tierConfig).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  style={{
                    flex: 1,
                    padding: '0.35rem 0',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: selectedTier === tier ? '#ffffff' : 'transparent',
                    color: selectedTier === tier ? tierConfig[tier].color : '#64748b',
                    boxShadow: selectedTier === tier ? '0 2px 5px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tier}
                </button>
              ))}
            </div>

            <div className="dial-wrapper">
              <svg className="dial-svg" viewBox="0 0 160 160">
                <defs>
                  <linearGradient id="dialGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0066cc" />
                    <stop offset="100%" stopColor={current.color} />
                  </linearGradient>
                </defs>
                <circle cx="80" cy="80" r="70" className="dial-bg" />
                <circle 
                  cx="80" 
                  cy="80" 
                  r="70" 
                  className="dial-progress" 
                  style={{ stroke: current.color, strokeDashoffset }}
                />
              </svg>
              <div className="dial-content">
                <div className="dial-val">{current.val}</div>
                <div className="dial-label" style={{ color: current.color }}>RISK INDEX</div>
              </div>
            </div>

            <p style={{ fontSize: '0.8rem', color: '#475569', textAlign: 'center', marginBottom: '1.25rem', minHeight: '36px', padding: '0 0.5rem' }}>
              {current.text}
            </p>

            <div className="console-grid">
              <div className="console-cell">
                <span className="console-cell-title">Dissemination</span>
                <span className="console-cell-val" style={{ color: '#0066cc' }}>&lt; 30s</span>
              </div>
              <div className="console-cell">
                <span className="console-cell-title">Model</span>
                <span className="console-cell-val">ECMWF ERA5</span>
              </div>
              <div className="console-cell">
                <span className="console-cell-title">Disaster Roles</span>
                <span className="console-cell-val">4 Tiered</span>
              </div>
              <div className="console-cell">
                <span className="console-cell-title">Channels</span>
                <span className="console-cell-val">IVR / SMS</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;