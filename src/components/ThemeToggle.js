import React from 'react';
import './ThemeToggle.css';

const ThemeToggle = ({ isDarkMode, onToggle }) => {
  console.log('ThemeToggle rendered, isDarkMode:', isDarkMode);
  
  return (
    <div className="theme-toggle-container">
      <button 
        className={`theme-toggle ${isDarkMode ? 'dark' : 'light'}`}
        onClick={onToggle}
        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {/* Glow effect behind the icon */}
        <div className="theme-glow" />
        
        {isDarkMode ? (
          // Sun icon for dark mode (click to switch to light)
          <svg viewBox="0 0 24 24" fill="currentColor" className="theme-icon sun-icon">
            <defs>
              <radialGradient id="sunGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffd700" />
                <stop offset="50%" stopColor="#ffed4e" />
                <stop offset="100%" stopColor="#ffb347" />
              </radialGradient>
            </defs>
            <circle cx="12" cy="12" r="5" fill="url(#sunGradient)"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          </svg>
        ) : (
          // Moon icon for light mode (click to switch to dark)
          <svg viewBox="0 0 24 24" fill="currentColor" className="theme-icon moon-icon">
            <defs>
              <radialGradient id="moonGradient" cx="30%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="50%" stopColor="#e5e7eb" />
                <stop offset="100%" stopColor="#9ca3af" />
              </radialGradient>
              <filter id="moonGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="url(#moonGradient)" filter="url(#moonGlow)"/>
          </svg>
        )}
      </button>
    </div>
  );
};

export default ThemeToggle;
