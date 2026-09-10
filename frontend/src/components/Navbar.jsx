import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, LayoutDashboard, ShieldAlert, Cpu } from 'lucide-react';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  const navLinks = [
    { path: '/', label: t('nav.home'), icon: <Home size={18} /> },
    { path: '/dashboard', label: t('nav.dashboard'), icon: <LayoutDashboard size={18} /> },
    { path: '/safe-zones', label: 'Safe Zones', icon: <ShieldAlert size={18} /> },
    { path: '/simulation', label: 'Simulation', icon: <Cpu size={18} /> },
  ];

  return (
    <nav className="nav">
      <div className="nav-logo">
        <Link to="/">
          <img src="/logo.png" alt="Jal Rakshak Logo" />
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
        <select 
          className="lang-switch" 
          onChange={changeLanguage} 
          value={i18n.language}
          aria-label="Language Selector"
        >
          <option value="en">English</option>
          <option value="hi">हिन्दी</option>
          <option value="te">తెలుగు</option>
        </select>
      </div>
    </nav>
  );
};

export default Navbar;