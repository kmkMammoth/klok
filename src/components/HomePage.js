import React from 'react';
import Navbar from './Navbar';
import '../App.css';

function HomePage() {
  return (
    <div className="App">
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Welkom bij <span className="gradient-text"> Flora Veiling </span>
            </h1>
            <p className="hero-subtitle">
              Professioneel bloemenveiling platform, met wereldwijde premium bloemen, realtime bieden, transparante transacties
            </p>
            <div className="hero-buttons">
              <button className="btn-primary">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2L12.5 7L18 8L14 12L15 18L10 15L5 18L6 12L2 8L7.5 7L10 2Z" 
                        fill="currentColor"/>
                </svg>
                Begin met bieden
              </button>
              <button className="btn-secondary">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" 
                        stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 10L10 12L12 10M10 6V12" 
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Meer informatie
              </button>
            </div>
          </div>
          <div className="hero-image">
            <div className="floating-card card-1">
              <div className="flower-preview">
                <div className="flower-icon pink">🌸</div>
                <div className="card-info">
                  <h4>Nederlandse Tulpen</h4>
                  <p className="price">€1.280</p>
                </div>
              </div>
            </div>
            <div className="floating-card card-2">
              <div className="flower-preview">
                <div className="flower-icon green">🌹</div>
                <div className="card-info">
                  <h4>Ecuadoriaanse Rozen</h4>
                  <p className="price">€890</p>
                </div>
              </div>
            </div>
            <div className="floating-card card-3">
              <div className="flower-preview">
                <div className="flower-icon purple">🌺</div>
                <div className="card-info">
                  <h4>Thaise Orchideeën</h4>
                  <p className="price">€1.650</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <h2 className="section-title">Waarom kiezen voor Flora Veiling</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon" style={{background: 'linear-gradient(135deg, #EB4511 0%, #FF6B3D 100%)'}}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" 
                        stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Premium Bloemen</h3>
              <p>Geselecteerde wereldwijde topbloemenleveranciers, gegarandeerde kwaliteit van elke bloem</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon" style={{background: 'linear-gradient(135deg, #587D71 0%, #6B9989 100%)'}}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C12 2 7 6 7 10C7 13.3137 9.68629 16 13 16C16.3137 16 19 13.3137 19 10C19 6 14 2 14 2" 
                        stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 22V16M8 18H16" 
                        stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3>Realtime Bieden</h3>
              <p>Innovatief realtime biedsysteem, eerlijke en transparante handelsomgeving</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon" style={{background: 'linear-gradient(135deg, #8A9D8F 0%, #6B9989 100%)'}}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" 
                        stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17M2 12L12 17L22 12" 
                        stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3>Veiligheidsgarantie</h3>
              <p>Compleet betalingssysteem en logistieke tracking, veilige transacties gegarandeerd</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon" style={{background: 'linear-gradient(135deg, #587D71 0%, #EB4511 100%)'}}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
                  <path d="M12 6V12L16 14" 
                        stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3>24/7 Service</h3>
              <p>24-uurs klantenservice, altijd beschikbaar voor uw vragen</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number">50K+</div>
            <div className="stat-label">Voltooide Bestellingen</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-number">1000+</div>
            <div className="stat-label">Bloemensoorten</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-number">98%</div>
            <div className="stat-label">Klanttevredenheid</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-number">24u</div>
            <div className="stat-label">Levertijd</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <p>&copy; 2025 Flora Veiling. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;

