import React from 'react';
import { useTranslation } from 'react-i18next';
import { Waves, CloudRain, Calculator, ShieldAlert, Languages, Radio, ArrowRight } from 'lucide-react';

const HowItWorks = () => {
  const { t } = useTranslation();
  const rawSteps = t('how_it_works.steps', { returnObjects: true }) || [];

  const icons = [
    <Waves size={24} color="#0066cc" />,
    <CloudRain size={24} color="#0066cc" />,
    <Calculator size={24} color="#0066cc" />,
    <ShieldAlert size={24} color="#f97316" />,
    <Languages size={24} color="#0284c7" />,
    <Radio size={24} color="#10b981" />
  ];

  return (
    <main className="pipeline-timeline-container">
      <div className="pipeline-header">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#e0f2fe', color: '#0369a1', padding: '0.35rem 0.9rem', borderRadius: '999px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem', border: '1px solid #bae6fd' }}>
          System Architecture Pipeline
        </div>
        <h2>{t('how_it_works.title')}</h2>
        <p style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '1.05rem', maxWidth: '600px', marginInline: 'auto' }}>
          {t('how_it_works.subtitle')}
        </p>
      </div>

      {/* Modern Connected Timeline Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginTop: '2.5rem' }}>
        {Array.isArray(rawSteps) && rawSteps.map((step, idx) => (
          <div 
            key={idx} 
            style={{
              background: '#ffffff',
              border: '1.5px solid var(--gov-border)',
              borderRadius: '14px',
              padding: '1.75rem',
              boxShadow: '0 4px 16px rgba(9, 30, 66, 0.04)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div className="pipeline-icon-badge" style={{ margin: 0 }}>
                  {icons[idx]}
                </div>
                <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 800, color: '#0066cc', background: '#f0f9ff', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid #bae6fd' }}>
                  STEP 0{idx + 1}
                </span>
              </div>

              <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#091e42', marginBottom: '0.5rem' }}>
                {step.title}
              </h4>
              <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.6' }}>
                {step.desc}
              </p>
            </div>

            {idx < rawSteps.length - 1 && (
              <div style={{ display: 'none', mdDisplay: 'flex', position: 'absolute', right: '-1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}>
                {/* Optional flow marker */}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
};

export default HowItWorks;