import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    useEffect(() => {
        // Haal gebruikersgegevens op uit localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        setShowUserMenu(false);
        navigate('/');
    };

    const handleMijnVeilingenClick = () => {
        if (user && user.accountType === 'koper') {
            navigate('/mijn-veilingen');
        } else {
            setShowLoginPrompt(true);
        }
    };

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <nav className="main-nav">
                <div className="main-nav-container">
                    <Link to="/" className="main-logo">
                        <span className="logo-icon">🌸</span>
                        <span className="logo-text">Flora Veiling</span>
                    </Link>
                    
                    <div className="nav-links">
                        <Link 
                            to="/" 
                            className={`nav-link ${isActive('/') ? 'active' : ''}`}
                        >
                            Startpagina
                        </Link>
                        <Link 
                            to="/veilingzaal" 
                            className={`nav-link ${isActive('/veilingzaal') ? 'active' : ''}`}
                        >
                            Veilingzaal
                        </Link>
                        <button 
                            onClick={handleMijnVeilingenClick}
                            className={`nav-link nav-button ${isActive('/mijn-veilingen') ? 'active' : ''}`}
                        >
                            Mijn Veilingen
                        </button>
                        <Link 
                            to="/helpcentrum" 
                            className={`nav-link ${isActive('/helpcentrum') ? 'active' : ''}`}
                        >
                            Helpcentrum
                        </Link>
                    </div>

                    <div className="nav-actions">
                        {user ? (
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
                                            <span className="user-type">
                                                {user.accountType === 'koper' && 'Koper Account'}
                                                {user.accountType === 'aanvoerder' && 'Aanvoerder Account'}
                                                {user.accountType === 'veilingmeester' && 'Veilingmeester Account'}
                                            </span>
                                        </div>
                                        <button className="menu-item" onClick={() => { navigate('/account'); setShowUserMenu(false); }}>
                                            Mijn Account
                                        </button>
                                        {user.accountType === 'koper' && (
                                            <button className="menu-item" onClick={() => { navigate('/mijn-veilingen'); setShowUserMenu(false); }}>
                                                Mijn Veilingen
                                            </button>
                                        )}
                                        <button className="menu-item logout" onClick={handleLogout}>
                                            Uitloggen
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <Link to="/login" className="btn-login">Inloggen</Link>
                                <Link to="/register" className="btn-register">Registreren</Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Login Prompt Modal */}
            {showLoginPrompt && (
                <div className="modal-overlay" onClick={() => setShowLoginPrompt(false)}>
                    <div className="login-prompt-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowLoginPrompt(false)}>×</button>
                        <div className="modal-icon">🔐</div>
                        <h2>Inloggen vereist</h2>
                        <p>U moet ingelogd zijn als Koper om uw veilingen te bekijken.</p>
                        <div className="modal-buttons">
                            <button 
                                className="btn-modal-login"
                                onClick={() => { setShowLoginPrompt(false); navigate('/login'); }}
                            >
                                Inloggen
                            </button>
                            <button 
                                className="btn-modal-register"
                                onClick={() => { setShowLoginPrompt(false); navigate('/register'); }}
                            >
                                Registreren
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;

