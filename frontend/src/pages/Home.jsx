import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div>
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content">
          <div className="live-pill">
            <span className="live-dot"></span>
            {t('home.live_status')}
          </div>
          <h1 className="hero-title">{t('home.tagline')}</h1>
          <p className="hero-subtitle">{t('home.subtitle')}</p>
          <button className="btn" onClick={() => navigate('/dashboard')}>
            {t('home.cta')}
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
