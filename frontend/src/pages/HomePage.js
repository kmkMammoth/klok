import React from 'react';
import { Link } from 'react-router-dom';
import HomeNavbar from '../components/HomeNavbar';
import '../styles/HomePage.css';

const HomePage = () => {
    const scrollToSection = (sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="home-page">
            {/* Navigation */}
            <HomeNavbar activePage="/" />

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1>
                        <span className="hero-title-dark">Welkom bij </span>
                        <span className="hero-title-accent">Flora Veiling</span>
                    </h1>
                    <p className="hero-description">
                        Professioneel bloemenveiling platform, met wereldwijde premium bloemen, realtime bieden, transparante transacties
                    </p>
                    <div className="hero-buttons">
                        <Link to="/dashboard" className="btn-primary">
                            <span className="btn-icon">★</span>
                            Begin met bieden
                        </Link>
                        <button onClick={() => scrollToSection('features')} className="btn-secondary">
                            <span className="btn-icon">ⓘ</span>
                            Meer informatie
                        </button>
                    </div>
                </div>
                <div className="hero-cards">
                    <div className="flower-card card-1">
                        <div className="flower-image">🌷</div>
                        <div className="flower-info">
                            <h3>Nederlandse Tulpen</h3>
                            <p className="flower-price">€1.280</p>
                        </div>
                    </div>
                    <div className="flower-card card-2">
                        <div className="flower-image">🌺</div>
                        <div className="flower-info">
                            <h3>Thaise Orchideeën</h3>
                            <p className="flower-price">€1.650</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section" id="features">
                <h2 className="section-title">Waarom kiezen voor Flora Veiling</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon icon-orange">
                            <span>☆</span>
                        </div>
                        <h3>Premium Bloemen</h3>
                        <p>Geselecteerde wereldwijde topbloemenleveranciers, gegarandeerde kwaliteit van elke bloem</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon icon-green">
                            <span>⚡</span>
                        </div>
                        <h3>Realtime Bieden</h3>
                        <p>Innovatief realtime biedsysteem, eerlijke en transparante handelsomgeving</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon icon-green">
                            <span>≡</span>
                        </div>
                        <h3>Veiligheidsgarantie</h3>
                        <p>Compleet betalingssysteem en logistieke tracking, veilige transacties gegarandeerd</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon icon-orange">
                            <span>⏰</span>
                        </div>
                        <h3>24/7 Service</h3>
                        <p>24-uurs klantenservice, altijd beschikbaar voor uw vragen</p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section" id="stats">
                <div className="stats-grid">
                    <div className="stat-item">
                        <h3>50K+</h3>
                        <p>Voltooide Bestellingen</p>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                        <h3>1000+</h3>
                        <p>Bloemensoorten</p>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                        <h3>98%</h3>
                        <p>Klanttevredenheid</p>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                        <h3>24u</h3>
                        <p>Levertijd</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="home-footer" id="footer">
                <p>© 2025 Flora Veiling. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default HomePage;

