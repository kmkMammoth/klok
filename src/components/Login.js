import React, { useState } from 'react';
import './Login.css';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login submitted:', formData);
    // 这里添加登录逻辑
    alert('Inloggen succesvol!');
    // 登录成功后跳转到首页
    window.location.href = '#home';
  };

  return (
    <div className="login-page">
      {/* Header */}
      <header className="login-header">
        <div className="login-header-content">
          <div className="header-logo" onClick={() => window.location.href = '#home'}>
            <div className="logo-icon">
              <svg width="60" height="60" viewBox="0 0 100 100" fill="none">
                <ellipse cx="50" cy="20" rx="12" ry="20" fill="#D4A968" transform="rotate(0 50 50)"/>
                <ellipse cx="26" cy="30" rx="12" ry="20" fill="#C87855" transform="rotate(-72 50 50)"/>
                <ellipse cx="34" cy="70" rx="12" ry="20" fill="#7FA196" transform="rotate(-144 50 50)"/>
                <ellipse cx="66" cy="70" rx="12" ry="20" fill="#B8724E" transform="rotate(144 50 50)"/>
                <ellipse cx="74" cy="30" rx="12" ry="20" fill="#4A3F42" transform="rotate(72 50 50)"/>
                <circle cx="50" cy="50" r="12" fill="white"/>
                <circle cx="50" cy="50" r="8" fill="#3F4F45" stroke="white" strokeWidth="2"/>
              </svg>
            </div>
          </div>
          <button className="register-link-btn" onClick={() => window.location.href = '#register'}>
            Registreren
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="login-content">
        <div className="login-card">
          <div className="login-icon-wrapper">
            <div className="login-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="white" strokeWidth="2"/>
                <path d="M4 20C4 16.6863 6.68629 14 10 14H14C17.3137 14 20 16.6863 20 20" 
                      stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
          </div>
          
          <h1 className="login-title">Welkom terug</h1>
          <p className="login-subtitle">Log in op uw account om door te gaan</p>
          
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">E-mailadres of Gebruikersnaam</label>
              <input
                id="email"
                type="text"
                name="email"
                placeholder="Voer uw e-mail of gebruikersnaam in"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Wachtwoord</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Voer uw wachtwoord in"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Onthoud mij</span>
              </label>
              <a href="#forgot-password" className="forgot-password">
                Wachtwoord vergeten?
              </a>
            </div>

            <button type="submit" className="login-btn">
              Inloggen
            </button>
          </form>

          <div className="login-footer">
            <p className="signup-text">
              Nog geen account? <a href="#register" className="signup-link">Registreer nu</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

