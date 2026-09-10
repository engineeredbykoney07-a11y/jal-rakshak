import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Waves, 
  CloudRain, 
  Calculator, 
  ShieldAlert, 
  Languages, 
  Radio, 
  ArrowRight,
  Cpu,
  CheckCircle2,
  Zap,
  Server,
  Network
} from 'lucide-react';

const HowItWorks = () => {
  const { t } = useTranslation();
  const [activeStage, setActiveStage] = useState(null);

  // Technical metadata and badges for each pipeline stage
  const pipelineSpecs = [
    {
      step: '01',
      title: 'Sensing Layer & Telemetry',
      protocol: 'MQTT / LoRaWAN',
      latency: '< 5s Acquisition',
      desc: 'Ultrasonic water level sensors and hydrological flow meters stream continuous depth, culvert clearance, and river velocity readings to edge gateways.',
      icon: <Waves size={24} color="#0284c7" />,
      tag: 'Edge Ingestion',
      color: '#0284c7'
    },
    {
      step: '02',
      title: 'Atmospheric Ingestion',
      protocol: 'ECMWF ERA5 + IMD Radar',
      latency: 'Hourly Reanalysis',
      desc: 'Real-time ground station rainfall data is fused with high-resolution ERA5 atmospheric precipitation modeling and cloud Doppler radar grids.',
      icon: <CloudRain size={24} color="#0369a1" />,
      tag: 'Meteorological Fusion',
      color: '#0369a1'
    },
    {
      step: '03',
      title: 'Confidence & Slope Scoring',
      protocol: 'Hydrological Kinematic Wave',
      latency: '< 1.2s Computation',
      desc: 'Topographical Digital Elevation Models (DEM) evaluate upstream terrain slope, soil moisture saturation levels, and instantaneous runoff velocities.',
      icon: <Calculator size={24} color="#0891b2" />,
      tag: 'Predictive Modeling',
      color: '#0891b2'
    },
    {
      step: '04',
      title: 'Deterministic Tiering',
      protocol: 'NDMA Classification Protocol',
      latency: 'Real-time Matrix',
      desc: 'Multi-sensor scoring is evaluated against deterministic thresholds: classifying the catchment zone into Normal, Elevated Watch, Warning, or Critical Evacuation.',
      icon: <ShieldAlert size={24} color="#f59e0b" />,
      tag: 'Risk Stratification',
      color: '#f59e0b'
    },
    {
      step: '05',
      title: 'Multilingual GenAI Advisories',
      protocol: 'Bhashini / Regional NLP',
      latency: '< 4s Synthesis',
      desc: 'Role-specific action plans (for district magistrates, rescue teams, panchayats, and citizens) are dynamically synthesized in Hindi, Telugu, and English.',
      icon: <Languages size={24} color="#8b5cf6" />,
      tag: 'Contextual Localization',
      color: '#8b5cf6'
    },
    {
      step: '06',
      title: 'Omnichannel Dissemination',
      protocol: 'Automated IVR + SMS Gateway',
      latency: '< 30s Broadcast',
      desc: 'Disaster warning sirens, automated telephone voice calls (IVR), emergency SMS broadcasts, and geospatial command dashboards activate concurrently.',
      icon: <Radio size={24} color="#ef4444" />,
      tag: 'Emergency Trigger',
      color: '#ef4444'
    }
  ];

  return (
    <main className="pipeline-timeline-container" style={{ maxWidth: '1360px', margin: '3.5rem auto 6rem', padding: '0 2.5rem' }}>
      {/* Header Banner */}
      <div className="pipeline-header" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.6rem', 
          background: '#f0f9ff', 
          color: '#0369a1', 
          padding: '0.45rem 1.2rem', 
          borderRadius: '999px', 
          fontSize: '0.78rem', 
          fontWeight: 800, 
          textTransform: 'uppercase', 
          marginBottom: '1.25rem', 
          border: '1.5px solid #bae6fd',
          letterSpacing: '0.04em'
        }}>
          <Network size={15} />
          <span>Operational Architecture & End-to-End Pipeline</span>
        </div>

        <h2 style={{ fontSize: '2.8rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--gov-navy)' }}>
          How <span style={{ 
            background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent' 
          }}>Jal Rakshak</span> Protects Catchments
        </h2>

        <p style={{ color: '#64748b', marginTop: '0.85rem', fontSize: '1.1rem', maxWidth: '680px', marginInline: 'auto', lineHeight: 1.6 }}>
          From edge ultrasonic telemetry stations to automated multilingual voice broadcast — our system achieves sub-30 second alert dispatches across mountainous terrains.
        </p>
      </div>

      {/* Connected Architectural Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', 
        gap: '1.75rem', 
        marginTop: '2.5rem' 
      }}>
        {pipelineSpecs.map((stage, idx) => {
          const isSelected = activeStage === idx;
          return (
            <div 
              key={idx}
              onMouseEnter={() => setActiveStage(idx)}
              onMouseLeave={() => setActiveStage(null)}
              style={{
                background: '#ffffff',
                border: `1.5px solid ${isSelected ? stage.color : 'var(--gov-border)'}`,
                borderRadius: '18px',
                padding: '1.85rem',
                boxShadow: isSelected 
                  ? `0 16px 36px -8px ${stage.color}25, 0 4px 12px rgba(9,30,66,0.04)`
                  : '0 4px 16px rgba(9, 30, 66, 0.04)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: isSelected ? 'translateY(-4px)' : 'none'
              }}
            >
              <div>
                {/* Top Card Navigation Strip */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    background: `${stage.color}15`,
                    border: `1.5px solid ${stage.color}35`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {stage.icon}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      fontFamily: 'var(--mono-font)',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: stage.color,
                      background: `${stage.color}10`,
                      padding: '0.25rem 0.65rem',
                      borderRadius: '6px',
                      border: `1px solid ${stage.color}30`
                    }}>
                      PHASE {stage.step}
                    </span>
                  </div>
                </div>

                <div style={{
                  display: 'inline-block',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: '#64748b',
                  letterSpacing: '0.04em',
                  marginBottom: '0.4rem'
                }}>
                  {stage.tag}
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gov-navy)', marginBottom: '0.65rem', letterSpacing: '-0.015em' }}>
                  {stage.title}
                </h3>

                <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: '1.65', marginBottom: '1.5rem' }}>
                  {stage.desc}
                </p>
              </div>

              {/* Technical Footprint Strip */}
              <div style={{ 
                borderTop: '1px solid #f1f5f9', 
                paddingTop: '1rem',
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '0.5rem',
                fontFamily: 'var(--mono-font)',
                fontSize: '0.75rem'
              }}>
                <div style={{ background: '#f8fafc', padding: '0.45rem 0.65rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.66rem', display: 'block', textTransform: 'uppercase' }}>PROTOCOL</span>
                  <strong style={{ color: 'var(--gov-navy)' }}>{stage.protocol}</strong>
                </div>
                <div style={{ background: '#f8fafc', padding: '0.45rem 0.65rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.66rem', display: 'block', textTransform: 'uppercase' }}>BENCHMARK</span>
                  <strong style={{ color: stage.color }}>{stage.latency}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tactical Guarantees Footer Strip */}
      <div style={{
        marginTop: '4.5rem',
        background: 'linear-gradient(135deg, #091a36 0%, #162a4d 100%)',
        borderRadius: '24px',
        padding: '2.5rem 3rem',
        color: '#ffffff',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2.5rem',
        boxShadow: '0 20px 40px rgba(9, 26, 54, 0.25)'
      }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '0.75rem', borderRadius: '12px' }}>
            <Zap size={24} color="#38bdf8" />
          </div>
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.35rem' }}>Sub-30s Omnichannel Delivery</h4>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Automated telecom trunks trigger emergency voice broadcasts and SMS blasts directly to registered community numbers.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '0.75rem', borderRadius: '12px' }}>
            <CheckCircle2 size={24} color="#10b981" />
          </div>
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.35rem' }}>Dual-Source Model Verification</h4>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Zero false-positive thresholding by cross-referencing physical gauge hydro-telemetry against meteorological radar grids.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '0.75rem', borderRadius: '12px' }}>
            <Server size={24} color="#f59e0b" />
          </div>
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.35rem' }}>Decentralized Edge Redundancy</h4>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Local gateway nodes cache catchment models locally, guaranteeing alert generation even under cellular backhaul outage.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HowItWorks;