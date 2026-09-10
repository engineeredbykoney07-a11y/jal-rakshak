import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, LayoutDashboard, GitMerge, Globe2 } from 'lucide-react';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  const navLinks = [
    { path: '/', label: t('nav.home'), icon: <Home size={17} /> },
    { path: '/dashboard', label: t('nav.dashboard'), icon: <LayoutDashboard size={17} /> },
    { path: '/how-it-works', label: t('nav.how_it_works'), icon: <GitMerge size={17} /> },
  ];

  return (
    <nav className="nav">
      <div className="nav-logo">
        <Link to="/">
          <img src="/logo.png" alt="Jal Rakshak Emblem" />
          <span>Jal Rakshak</span>
        </Link>
      </div>

      <div className="nav-links">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
          >
            {link.icon}
            <span>{link.label}</span>
          </Link>
        ))}
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.5rem' }}>
          <Globe2 size={16} color="#64748b" />
          <select 
            className="lang-switch" 
            onChange={changeLanguage} 
            value={i18n.language}
            aria-label="Language Selector"
          >
            <option value="en">English (EN)</option>
            <option value="hi">हिन्दी (HI)</option>
            <option value="te">తెలుగు (TE)</option>
          </select>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;