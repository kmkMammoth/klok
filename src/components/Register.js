import React, { useState } from 'react';
import './Register.css';

function Register() {
  const [step, setStep] = useState('select'); // 'select', 'koper', 'aanvoerder', 'veilingmeester'
  const [formData, setFormData] = useState({
    bedrijfsnaam: '',
    kvkNummer: '',
    bedrijfsadres: '',
    email: '',
    iban: '',
    wachtwoord: '',
    bevestigWachtwoord: '',
    gebruikersnaam: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', step, formData);
    // Hier kun je de registratie logica toevoegen
    alert('Registratie succesvol!');
  };

  const selectAccountType = (type) => {
    setStep(type);
    // Reset form data
    setFormData({
      bedrijfsnaam: '',
      kvkNummer: '',
      bedrijfsadres: '',
      email: '',
      iban: '',
      wachtwoord: '',
      bevestigWachtwoord: '',
      gebruikersnaam: ''
    });
  };

  return (
    <div className="register-page">
      {/* Header */}
      <header className="register-header">
        <div className="register-header-content">
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
          <button className="login-link-btn" onClick={() => window.location.href = '#login'}>Login</button>
        </div>
      </header>

      {/* Main Content */}
      <div className="register-content">
        {step === 'select' && (
          <div className="register-card">
            <h1 className="register-title">Aanmelden</h1>
            <p className="register-subtitle">Kies een accounttype:</p>
            
            <div className="account-type-buttons">
              <button 
                className="account-type-btn"
                onClick={() => selectAccountType('koper')}
              >
                Koper
              </button>
              <button 
                className="account-type-btn"
                onClick={() => selectAccountType('aanvoerder')}
              >
                Aanvoerder
              </button>
              <button 
                className="account-type-btn"
                onClick={() => selectAccountType('veilingmeester')}
              >
                Veilingmeester
              </button>
            </div>

            <div className="register-footer">
              <p className="required-text">*Verplicht veld</p>
              <p className="login-text">
                Al een account? <a href="#login" className="login-link">Log hier in</a>
              </p>
            </div>
          </div>
        )}

        {step === 'koper' && (
          <div className="register-card">
            <h1 className="register-title">Aanmelden kopersaccount</h1>
            
            <form className="register-form" onSubmit={handleSubmit}>
              <input
                type="text"
                name="bedrijfsnaam"
                placeholder="Bedrijfsnaam"
                value={formData.bedrijfsnaam}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="kvkNummer"
                placeholder="KvK-nummer*"
                value={formData.kvkNummer}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="bedrijfsadres"
                placeholder="Bedrijfsadres*"
                value={formData.bedrijfsadres}
                onChange={handleInputChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="E-mail*"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="iban"
                placeholder="IBAN bedrijfsrekening*"
                value={formData.iban}
                onChange={handleInputChange}
                required
              />
              <div className="password-group">
                <input
                  type="password"
                  name="wachtwoord"
                  placeholder="Wachtwoord*"
                  value={formData.wachtwoord}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="password"
                  name="bevestigWachtwoord"
                  placeholder="Bevestig wachtwoord*"
                  value={formData.bevestigWachtwoord}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button type="submit" className="submit-btn">Aanmelden</button>
            </form>

            <div className="register-footer">
              <p className="required-text">*Verplicht veld</p>
              <p className="login-text">
                Al een account? <a href="#login" className="login-link">Log hier in</a>
              </p>
            </div>
            
            <button className="back-btn" onClick={() => setStep('select')}>
              ← Terug naar accounttype selectie
            </button>
          </div>
        )}

        {step === 'aanvoerder' && (
          <div className="register-card">
            <h1 className="register-title">Aanmelden aanvoerdersaccount</h1>
            
            <form className="register-form" onSubmit={handleSubmit}>
              <input
                type="text"
                name="bedrijfsnaam"
                placeholder="Bedrijfsnaam"
                value={formData.bedrijfsnaam}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="kvkNummer"
                placeholder="KvK-nummer*"
                value={formData.kvkNummer}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="bedrijfsadres"
                placeholder="Bedrijfsadres*"
                value={formData.bedrijfsadres}
                onChange={handleInputChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="E-mail*"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="iban"
                placeholder="IBAN bedrijfsrekening*"
                value={formData.iban}
                onChange={handleInputChange}
                required
              />
              <div className="password-group">
                <input
                  type="password"
                  name="wachtwoord"
                  placeholder="Wachtwoord*"
                  value={formData.wachtwoord}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="password"
                  name="bevestigWachtwoord"
                  placeholder="Bevestig wachtwoord*"
                  value={formData.bevestigWachtwoord}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button type="submit" className="submit-btn">Aanmelden</button>
            </form>

            <div className="register-footer">
              <p className="required-text">*Verplicht veld</p>
              <p className="login-text">
                Al een account? <a href="#login" className="login-link">Log hier in</a>
              </p>
            </div>
            
            <button className="back-btn" onClick={() => setStep('select')}>
              ← Terug naar accounttype selectie
            </button>
          </div>
        )}

        {step === 'veilingmeester' && (
          <div className="register-card">
            <h1 className="register-title">Aanmelden veilingmeestersaccount</h1>
            
            <form className="register-form" onSubmit={handleSubmit}>
              <input
                type="text"
                name="gebruikersnaam"
                placeholder="Gebruikersnaam"
                value={formData.gebruikersnaam}
                onChange={handleInputChange}
                required
              />
              <div className="password-group">
                <input
                  type="password"
                  name="wachtwoord"
                  placeholder="Wachtwoord*"
                  value={formData.wachtwoord}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="password"
                  name="bevestigWachtwoord"
                  placeholder="Bevestig wachtwoord*"
                  value={formData.bevestigWachtwoord}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <button type="submit" className="submit-btn">Aanmelden</button>
            </form>

            <div className="register-footer">
              <p className="required-text">*Verplicht veld</p>
              <p className="login-text">
                Al een account? <a href="#login" className="login-link">Log hier in</a>
              </p>
            </div>
            
            <button className="back-btn" onClick={() => setStep('select')}>
              ← Terug naar accounttype selectie
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Register;

