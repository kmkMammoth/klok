import React, { useState } from 'react';
import './Navbar.css';

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeNav, setActiveNav] = useState('home');

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          {/* Logo */}
          <div className="navbar-logo">
            <div className="logo-icon">
              <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
                {/* Top petal - Yellow */}
                <ellipse cx="50" cy="20" rx="12" ry="20" fill="#D4A968" transform="rotate(0 50 50)"/>
                
                {/* Top-left petal - Orange/Brown */}
                <ellipse cx="26" cy="30" rx="12" ry="20" fill="#C87855" transform="rotate(-72 50 50)"/>
                
                {/* Bottom-left petal - Teal/Sage */}
                <ellipse cx="34" cy="70" rx="12" ry="20" fill="#7FA196" transform="rotate(-144 50 50)"/>
                
                {/* Bottom-right petal - Orange/Rust */}
                <ellipse cx="66" cy="70" rx="12" ry="20" fill="#B8724E" transform="rotate(144 50 50)"/>
                
                {/* Top-right petal - Dark purple/brown */}
                <ellipse cx="74" cy="30" rx="12" ry="20" fill="#4A3F42" transform="rotate(72 50 50)"/>
                
                {/* Center circle - White */}
                <circle cx="50" cy="50" r="12" fill="white"/>
                <circle cx="50" cy="50" r="8" fill="#3F4F45" stroke="white" strokeWidth="2"/>
              </svg>
            </div>
            <span className="logo-text">FLora Veiling</span>
          </div>

          {/* Navigation Links */}
          <ul className="navbar-menu">
            <li className={activeNav === 'home' ? 'active' : ''}>
              <a href="#home" onClick={() => setActiveNav('home')}>Startpagina</a>
            </li>
            <li className={activeNav === 'auction' ? 'active' : ''}>
              <a href="#auction" onClick={() => setActiveNav('auction')}>Veilingzaal</a>
            </li>
            <li className={activeNav === 'my-auction' ? 'active' : ''}>
              <a href="#my-auction" onClick={() => setActiveNav('my-auction')}>Mijn Veilingen</a>
            </li>
            <li className={activeNav === 'help' ? 'active' : ''}>
              <a href="#help" onClick={() => setActiveNav('help')}>Helpcentrum</a>
            </li>
          </ul>

          {/* User Actions */}
          <div className="navbar-actions">
            {isLoggedIn ? (
              <div className="user-menu">
                <div className="user-avatar">
                  <img src="https://via.placeholder.com/36" alt="Gebruiker" />
                </div>
                <span className="user-name">Gebruikersnaam</span>
                <button className="btn-logout" onClick={handleLogout}>Uitloggen</button>
              </div>
            ) : (
              <div className="auth-buttons">
                <button className="btn-login" onClick={() => window.location.href = '#login'}>
                  Inloggen
                </button>
                <button className="btn-register" onClick={() => window.location.href = '#register'}>
                  Registreren
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;

