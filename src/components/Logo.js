import React from 'react';
import './Logo.css';

const Logo = ({ isDarkMode }) => {
  return (
    <div className={`logo-container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="logo">
        <div className="logo-text">
          <span className="logo-axess">AXESS</span>
        </div>
        <div className="logo-subtitle">
          <span className="logo-intelligence">Intelligence</span>
        </div>
        <div className="logo-glow"></div>
        <div className="logo-glow-outer"></div>
      </div>
    </div>
  );
};

export default Logo;

