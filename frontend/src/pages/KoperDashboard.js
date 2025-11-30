import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/KoperDashboard.css';

const KoperDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('veilingzaal');
    const [showUserMenu, setShowUserMenu] = useState(false);

    useEffect(() => {
        // Haal gebruikersgegevens op uit localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        } else {
            // Geen gebruiker ingelogd, stuur naar login
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Mock data voor veilingen
    const veilingen = [
        { id: 1, naam: 'Rode Rozen Premium', prijs: 45.00, eindtijd: '14:30', status: 'Actief' },
        { id: 2, naam: 'Hollandse Tulpen Mix', prijs: 32.50, eindtijd: '15:00', status: 'Actief' },
        { id: 3, naam: 'Witte Lelies', prijs: 28.00, eindtijd: '15:30', status: 'Actief' },
        { id: 4, naam: 'Gerbera Collectie', prijs: 55.00, eindtijd: '16:00', status: 'Actief' },
    ];

    const mijnVeilingen = [
        { id: 1, naam: 'Orchideeën Set', bod: 120.00, status: 'Gewonnen', datum: '28-11-2025' },
        { id: 2, naam: 'Zonnebloemen', bod: 45.00, status: 'Overboden', datum: '27-11-2025' },
    ];

    if (!user) {
        return <div className="loading">Laden...</div>;
    }

    return (
        <div className="koper-dashboard">
            {/* Navigation */}
            <nav className="koper-nav">
                <div className="koper-nav-container">
                    <Link to="/" className="koper-logo">
                        <span className="logo-text">Flora Veiling</span>
                    </Link>
                    
                    <div className="nav-tabs">
                        <button 
                            className={`nav-tab ${activeTab === 'veilingzaal' ? 'active' : ''}`}
                            onClick={() => setActiveTab('veilingzaal')}
                        >
                            Veilingzaal
                        </button>
                        <button 
                            className={`nav-tab ${activeTab === 'mijnveilingen' ? 'active' : ''}`}
                            onClick={() => setActiveTab('mijnveilingen')}
                        >
                            Mijn Veilingen
                        </button>
                    </div>

                    <div className="user-section">
                        <button 
                            className="user-button"
                            onClick={() => setShowUserMenu(!showUserMenu)}
                        >
                            <div className="user-avatar">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                </svg>
                            </div>
                            <span className="user-name">{user.gebruikersnaam}</span>
                            <span className="dropdown-arrow">▼</span>
                        </button>
                        
                        {showUserMenu && (
                            <div className="user-menu">
                                <div className="user-menu-header">
                                    <span className="user-type">Koper Account</span>
                                </div>
                                <button className="menu-item" onClick={() => navigate('/account')}>
                                    Mijn Account
                                </button>
                                <button className="menu-item" onClick={handleLogout}>
                                    Uitloggen
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="koper-main">
                {activeTab === 'veilingzaal' && (
                    <div className="content-section">
                        <div className="section-header">
                            <h1>Veilingzaal</h1>
                            <p>Bekijk en bied op actieve veilingen</p>
                        </div>
                        
                        <div className="veilingen-grid">
                            {veilingen.map(veiling => (
                                <div key={veiling.id} className="veiling-card">
                                    <div className="veiling-image">
                                        <span>🌸</span>
                                    </div>
                                    <div className="veiling-info">
                                        <h3>{veiling.naam}</h3>
                                        <div className="veiling-details">
                                            <span className="veiling-prijs">€{veiling.prijs.toFixed(2)}</span>
                                            <span className="veiling-tijd">Eindigt om {veiling.eindtijd}</span>
                                        </div>
                                        <span className={`veiling-status status-${veiling.status.toLowerCase()}`}>
                                            {veiling.status}
                                        </span>
                                    </div>
                                    <button className="btn-bieden">Bieden</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'mijnveilingen' && (
                    <div className="content-section">
                        <div className="section-header">
                            <h1>Mijn Veilingen</h1>
                            <p>Bekijk uw biedingen en gewonnen veilingen</p>
                        </div>
                        
                        <div className="mijn-veilingen-list">
                            {mijnVeilingen.length > 0 ? (
                                mijnVeilingen.map(veiling => (
                                    <div key={veiling.id} className="mijn-veiling-card">
                                        <div className="mijn-veiling-image">
                                            <span>🌷</span>
                                        </div>
                                        <div className="mijn-veiling-info">
                                            <h3>{veiling.naam}</h3>
                                            <p className="mijn-veiling-datum">{veiling.datum}</p>
                                        </div>
                                        <div className="mijn-veiling-bod">
                                            <span className="bod-label">Uw bod</span>
                                            <span className="bod-bedrag">€{veiling.bod.toFixed(2)}</span>
                                        </div>
                                        <span className={`mijn-veiling-status status-${veiling.status.toLowerCase()}`}>
                                            {veiling.status}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <span className="empty-icon">📋</span>
                                    <h3>Geen veilingen gevonden</h3>
                                    <p>U heeft nog geen biedingen geplaatst</p>
                                    <button 
                                        className="btn-primary"
                                        onClick={() => setActiveTab('veilingzaal')}
                                    >
                                        Ga naar Veilingzaal
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default KoperDashboard;

