import React from 'react';
import { useTranslation } from 'react-i18next';

const HowItWorks = () => {
  const { t } = useTranslation();

  const steps = [
    { title: 'Sensing', desc: 'Sensors report water level and blockage continuously.' },
    { title: 'Ingestion', desc: 'Data is fused with live ERA5 rainfall records via MQTT.' },
    { title: 'Risk Scoring', desc: 'An algorithm computes a risk score and confidence based on water and rain.' },
    { title: 'Threshold Decision', desc: 'Classifies into Normal, Watch, Warning, Evacuate.' },
    { title: 'Advisory Generation', desc: 'AI generates custom, translated action plans for 4 different roles.' },
    { title: 'Delivery', desc: 'Simultaneous alerts sent via SMS, Voice (IVR), and Dashboard.' },
    { title: 'Outcome Logging', desc: 'System records the alert dispatch in the secure database.' },
    { title: 'Feedback Adaptation', desc: 'Escalates unacknowledged alerts to higher priority channels.' },
  ];

  return (
    <main style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{t('nav.how_it_works')}</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem' }}>
          Discover the end-to-end process of our AI-driven early warning system.
        </p>
      </div>

      <div className="steps-grid">
        {steps.map((step, idx) => (
          <div key={idx} className="step-card">
            <div className="step-num">0{idx + 1}</div>
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
};

export default HowItWorks;
