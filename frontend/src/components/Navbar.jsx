import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/dashboard', label: t('nav.dashboard') },
    { path: '/how-it-works', label: t('nav.how_it_works') },
  ];

  return (
    <nav className="nav">
      <div className="nav-logo">
        <Link to="/">
          <span className="logo-badge">✦</span> Jal Rakshak
        </Link>
      </div>
      <div className="nav-links">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
          >
            {link.label}
          </Link>
        ))}
        <select 
          className="lang-switch" 
          onChange={changeLanguage} 
          value={i18n.language}
          aria-label="Select Language"
        >
          <option value="en">English</option>
          <option value="hi">हिन्दी (Hindi)</option>
          <option value="te">తెలుగు (Telugu)</option>
        </select>
      </div>
    </nav>
  );
};

export default Navbar;