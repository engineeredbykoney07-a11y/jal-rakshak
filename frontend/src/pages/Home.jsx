import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, ShieldAlert, ArrowRight, Activity, Zap, CheckCircle2, AlertOctagon } from 'lucide-react';

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedTier, setSelectedTier] = useState('watch');

  const tierConfig = {
    normal: {
      val: 24,
      label: 'NORMAL STATUS',
      color: '#10b981',
      text: 'All upstream sensor nodes reporting standard hydrological flow.'
    },
    watch: {
      val: 59,
      label: 'ELEVATED WATCH',
      color: '#f59e0b',
      text: 'Sustained precipitation threshold detected in catchment zone.'
    },
    warning: {
      val: 82,
      label: 'HIGH WARNING',
      color: '#f97316',
      text: 'Runoff velocity approaching critical culvert retention limits.'
    },
    evacuate: {
      val: 96,
      label: 'CRITICAL EVACUATION',
      color: '#ef4444',
      text: 'Flash flood imminent. Multi-channel IVR broadcast automated.'
    }
  };

  const current = tierConfig[selectedTier];
  const circumference = 440;
  const strokeDashoffset = circumference - (circumference * current.val) / 100;

  return (
    <main>
      <section className="hero-gov">
        <div className="hero-gov-left">
          <div className="gov-pill-bar">
            <span className="pulse-dot" style={{ background: current.color }}></span>
            <ShieldCheck size={16} color="#0284c7" />
            <span>National Sensor Grid • Telemetry Ingestion Active</span>
          </div>
          
          <h1 className="hero-gov-title">
            {t('home.tagline_prefix')} <span>{t('home.tagline_highlight')}</span> {t('home.tagline_suffix')}
          </h1>
          
          <p className="hero-gov-desc">{t('home.subtitle')}</p>
          
          <div className="hero-action-row">
            <button className="btn-gov-primary" onClick={() => navigate('/dashboard')}>
              {t('home.cta_dashboard')} <ArrowRight size={18} />
            </button>
            <button className="btn-gov-outline" onClick={() => navigate('/how-it-works')}>
              {t('home.cta_pipeline')}
            </button>
          </div>

          {/* Micro Trust Indicators */}
          <div style={{ display: 'flex', gap: '2rem', marginTop: '2.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
              <CheckCircle2 size={18} color="#10b981" />
              <span>Realtime MQTT Telemetry</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
              <Zap size={18} color="#0284c7" />
              <span>&lt; 30s Multi-lingual IVR</span>
            </div>
          </div>
        </div>

        {/* Mission Console Card */}
        <div className="gov-console">
          <div className="gov-console-topbar">
            <span>TERMINAL ID: UK-HYDRO-08</span>
            <span style={{ color: current.color, display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800 }}>
              <Activity size={14} /> {current.label}
            </span>
          </div>
          
          <div className="gov-console-body">
            {/* Segmented Tier Switcher */}
            <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1.25rem', width: '100%', background: '#f1f5f9', padding: '0.3rem', borderRadius: '12px' }}>
              {Object.keys(tierConfig).map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedTier(tier)}
                  style={{
                    flex: 1,
                    padding: '0.45rem 0',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: selectedTier === tier ? '#ffffff' : 'transparent',
                    color: selectedTier === tier ? tierConfig[tier].color : '#64748b',
                    boxShadow: selectedTier === tier ? '0 2px 8px rgba(9,30,66,0.08)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {tier}
                </button>
              ))}
            </div>

            {/* Circular Gauge */}
            <div className="dial-wrapper">
              <svg className="dial-svg" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r="70" className="dial-bg" />
                <circle cx="80" cy="80" r="70" className="dial-progress" style={{ stroke: current.color, strokeDashoffset }} />
              </svg>
              <div className="dial-content">
                <div className="dial-val">{current.val}</div>
                <div className="dial-label" style={{ color: current.color }}>RISK INDEX</div>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#475569', textAlign: 'center', marginBottom: '1.5rem', minHeight: '38px', padding: '0 0.5rem', lineHeight: 1.45 }}>
              {current.text}
            </p>

            {/* Console Stat Grid */}
            <div className="console-grid">
              <div className="console-cell">
                <span className="console-cell-title">Dissemination</span>
                <span className="console-cell-val" style={{ color: '#0284c7' }}>&lt; 30s</span>
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

      {/* Hardware & Sensor Network Section */}
      <section className="hardware-section" style={{ padding: '4.5rem 2rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.2rem', color: '#0f172a', marginBottom: '1rem', textAlign: 'center', fontWeight: 800 }}>
            Monsoon Sentinel: Hardware Telemetry
          </h2>
          <p style={{ color: '#475569', fontSize: '1.1rem', textAlign: 'center', maxWidth: '750px', margin: '0 auto 3.5rem auto', lineHeight: '1.6' }}>
            Our autonomous solar-powered nodes are deployed along critical river basins and urban catchments. 
            They provide continuous real-time data ingestion for early flash flood detection.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '4rem', alignItems: 'center' }}>
            <div className="hardware-details" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              <div className="sensor-feature">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.3rem', color: '#0369a1', marginBottom: '0.6rem' }}>
                  <Zap size={22} strokeWidth={2.5} /> High-Precision Rainfall Gauges
                </h3>
                <p style={{ color: '#334155', lineHeight: '1.6', fontSize: '0.95rem' }}>
                  Acoustic and tipping-bucket rain gauges measure instantaneous precipitation intensity and cumulative 6-hour rainfall (mm). Critical for identifying localized cloudburst events before they escalate.
                </p>
              </div>

              <div className="sensor-feature">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.3rem', color: '#0369a1', marginBottom: '0.6rem' }}>
                  <Activity size={22} strokeWidth={2.5} /> Ultrasonic Water Level Sensors
                </h3>
                <p style={{ color: '#334155', lineHeight: '1.6', fontSize: '0.95rem' }}>
                  Non-contact ultrasonic transceivers continuously monitor river stage and storm drain capacity. Rapid spikes trigger immediate localized evacuation protocols.
                </p>
              </div>

              <div className="sensor-feature">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.3rem', color: '#0369a1', marginBottom: '0.6rem' }}>
                  <ShieldAlert size={22} strokeWidth={2.5} /> Blockage & Soil Saturation
                </h3>
                <p style={{ color: '#334155', lineHeight: '1.6', fontSize: '0.95rem' }}>
                  Deep-soil saturation probes predict landslide risks on steep slopes, while optical blockage sensors detect dangerous debris buildup in critical urban drainage chokepoints.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;