import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <div className="live-pill">
            <span className="live-dot"></span>
            {t('home.live_status')}
          </div>
          <h1 className="hero-title">{t('home.tagline')}</h1>
          <p className="hero-subtitle">{t('home.subtitle')}</p>
          <div className="hero-actions">
            <button className="btn" onClick={() => navigate('/dashboard')}>
              {t('home.cta')} →
            </button>
            <button className="btn-secondary" onClick={() => navigate('/how-it-works')}>
              {t('nav.how_it_works')}
            </button>
          </div>
        </div>

        <div className="hero-card-preview">
          <div className="preview-stat">
            <h4>&lt; 30s</h4>
            <p>Multilingual Alert Dissemination</p>
          </div>
          <div className="preview-stat">
            <h4>ERA5 + Sensors</h4>
            <p>Rainfall & Inundation Data Fusion</p>
          </div>
          <div className="preview-stat">
            <h4>4 Stakeholder Roles</h4>
            <p>Customized Resident, Officer, Worker & Volunteer Advisories</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;