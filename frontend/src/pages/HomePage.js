import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';

function HomePage() {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const [scrollY, setScrollY] = useState(0);
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        
        const handleScroll = () => {
            setScrollY(window.scrollY);
            setShowScrollTop(window.scrollY > 400);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    const features = [
        {
            icon: '⭐',
            title: 'Premium Bloemen',
            description: 'Geselecteerde wereldwijde topbloemenleveranciers, gegarandeerde kwaliteit van elke bloem',
            color: '#EA5A2B'
        },
        {
            icon: '💡',
            title: 'Realtime Bieden',
            description: 'Innovatief realtime biedsysteem, eerlijke en transparante handelsomgeving',
            color: '#5A7A6A'
        },
        {
            icon: '📚',
            title: 'Veiligheidsgarantie',
            description: 'Compleet betalingssysteem en logistieke tracking, veilige transacties gegarandeerd',
            color: '#5A7A6A'
        },
        {
            icon: '🕐',
            title: '24/7 Service',
            description: '24-uurs klantenservice, altijd beschikbaar voor uw vragen',
            color: '#B8794F'
        }
    ];

    const sampleProducts = [
        {
            name: 'Nederlandse Tulpen',
            price: '€1.280',
            emoji: '🌸',
            color: '#FDE4E9'
        },
        {
            name: 'Ecuadoriaanse Rozen',
            price: '€890',
            emoji: '🌹',
            color: '#FFE5E5'
        },
        {
            name: 'Thaise Orchideeën',
            price: '€1.650',
            emoji: '🌺',
            color: '#FFE4E0'
        }
    ];

    const stats = [
        { value: '50K+', label: 'Voltooide Bestellingen' },
        { value: '1000+', label: 'Bloemensoorten' },
        { value: '98%', label: 'Klanttevredenheid' },
        { value: '24u', label: 'Levertijd' }
    ];

    return (
        <div className={`homepage ${isVisible ? 'fade-in' : ''}`}>
            {/* Decorative Background Elements */}
            <div className="bg-decoration">
                <div className="decoration-circle circle-1" style={{ transform: `translateY(${scrollY * 0.3}px)` }}></div>
                <div className="decoration-circle circle-2" style={{ transform: `translateY(${scrollY * 0.2}px)` }}></div>
                <div className="decoration-circle circle-3" style={{ transform: `translateY(${scrollY * 0.4}px)` }}></div>
            </div>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <div className={`hero-text ${isVisible ? 'slide-in-left' : ''}`}>
                        <h1>Welkom bij <span className="brand-highlight">Flora Veiling</span></h1>
                        <p className="hero-description">
                            Professioneel bloemenveiling platform, met wereldwijde premium bloemen, 
                            realtime bieden, transparante transacties
                        </p>
                        <div className="hero-buttons">
                            <button className="btn-primary" onClick={() => navigate('/veilingzaal')}>
                                <span className="btn-icon">⭐</span> Begin met bieden
                            </button>
                            <button className="btn-secondary" onClick={() => navigate('/helpcentrum')}>
                                <span className="btn-icon">ℹ️</span> Meer informatie
                            </button>
                        </div>
                    </div>
                    <div className="hero-products">
                        <div className="floating-product-card card-1" style={{ top: '20px', right: '80px' }}>
                            <div className="product-card-inner">
                                <div className="product-image-wrapper">
                                    <div className="product-image" style={{ backgroundColor: sampleProducts[0].color }}>
                                        <span className="product-emoji">{sampleProducts[0].emoji}</span>
                                    </div>
                                    <div className="product-badge">Nieuw</div>
                                </div>
                                <div className="product-content">
                                    <h4 className="product-name">{sampleProducts[0].name}</h4>
                                    <div className="product-price-row">
                                        <span className="price-label">Startprijs</span>
                                        <p className="product-price">{sampleProducts[0].price}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="floating-product-card card-2" style={{ top: '200px', right: '240px' }}>
                            <div className="product-card-inner">
                                <div className="product-image-wrapper">
                                    <div className="product-image" style={{ backgroundColor: sampleProducts[1].color }}>
                                        <span className="product-emoji">{sampleProducts[1].emoji}</span>
                                    </div>
                                    <div className="product-badge hot">Hot</div>
                                </div>
                                <div className="product-content">
                                    <h4 className="product-name">{sampleProducts[1].name}</h4>
                                    <div className="product-price-row">
                                        <span className="price-label">Startprijs</span>
                                        <p className="product-price">{sampleProducts[1].price}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="floating-product-card card-3" style={{ top: '380px', right: '60px' }}>
                            <div className="product-card-inner">
                                <div className="product-image-wrapper">
                                    <div className="product-image" style={{ backgroundColor: sampleProducts[2].color }}>
                                        <span className="product-emoji">{sampleProducts[2].emoji}</span>
                                    </div>
                                    <div className="product-badge premium">Premium</div>
                                </div>
                                <div className="product-content">
                                    <h4 className="product-name">{sampleProducts[2].name}</h4>
                                    <div className="product-price-row">
                                        <span className="price-label">Startprijs</span>
                                        <p className="product-price">{sampleProducts[2].price}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <h2 className="section-title animate-on-scroll">Waarom kiezen voor Flora Veiling</h2>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div 
                            key={index} 
                            className="feature-card animate-on-scroll"
                            style={{ animationDelay: `${index * 0.15}s` }}
                        >
                            <div className="feature-icon" style={{ backgroundColor: feature.color }}>
                                {feature.icon}
                            </div>
                            <h3>{feature.title}</h3>
                            <p>{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="stats-container">
                    {stats.map((stat, index) => (
                        <div 
                            key={index} 
                            className="stat-item animate-on-scroll"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <h3 className="stat-value">{stat.value}</h3>
                            <p className="stat-label">{stat.label}</p>
                            <div className="stat-bar">
                                <div className="stat-bar-fill" style={{ animationDelay: `${index * 0.2}s` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer className="homepage-footer">
                <p>© 2025 Flora Veiling. All rights reserved.</p>
            </footer>

            {/* Scroll to Top Button */}
            <button 
                className={`scroll-to-top ${showScrollTop ? 'visible' : ''}`}
                onClick={scrollToTop}
                aria-label="Scroll to top"
            >
                ↑
            </button>
        </div>
    );
}

export default HomePage;

