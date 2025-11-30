import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/HomePage.css';

const HomeNavbar = ({ activePage = null }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, [location]);

    // Sluit het gebruikersmenu wanneer er buiten geklikt wordt
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showUserMenu && !event.target.closest('.home-user-section')) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showUserMenu]);

    const handleMijnVeilingenClick = (e) => {
        e.preventDefault();
        if (user && user.accountType === 'koper') {
            navigate('/mijn-veilingen');
        } else {
            setShowLoginPrompt(true);
        }
    };

    const handleVeilingzaalClick = (e) => {
        e.preventDefault();
        navigate('/veilingzaal');
    };

    const handleStartpaginaClick = (e) => {
        e.preventDefault();
        if (location.pathname === '/') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            navigate('/');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        setShowUserMenu(false);
        navigate('/');
    };

    const getActiveClass = (page) => {
        if (activePage) {
            return activePage === page ? 'nav-active' : '';
        }
        return location.pathname === page ? 'nav-active' : '';
    };

    return (
        <>
            <nav className="home-nav">
                <div className="home-nav-container">
                    <div className="home-logo">
                        <Link to="/" className="logo-text-link">
                            <span className="logo-text">Flora Veiling</span>
                        </Link>
                    </div>
                    <ul className="home-nav-menu">
                        <li>
                            <button 
                                className={`nav-link ${getActiveClass('/')}`} 
                                onClick={handleStartpaginaClick}
                            >
                                Startpagina
                            </button>
                        </li>
                        <li>
                            <button 
                                className={`nav-link ${getActiveClass('/veilingzaal')}`} 
                                onClick={handleVeilingzaalClick}
                            >
                                Veilingzaal
                            </button>
                        </li>
                        <li>
                            <button 
                                className={`nav-link ${getActiveClass('/mijn-veilingen')}`} 
                                onClick={handleMijnVeilingenClick}
                            >
                                Mijn Veilingen
                            </button>
                        </li>
                        <li>
                            <Link 
                                to="/helpcentrum"
                                className={`nav-link ${getActiveClass('/helpcentrum')}`}
                            >
                                Helpcentrum
                            </Link>
                        </li>
                    </ul>
                    <div className="home-nav-buttons">
                        {user ? (
                            <div className="home-user-section">
                                <button 
                                    className="home-user-button"
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                >
                                    <div className="home-user-avatar">
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                        </svg>
                                    </div>
                                    <span className="home-username">{user.gebruikersnaam}</span>
                                    <span className="home-dropdown-arrow">▼</span>
                                </button>
                                
                                {showUserMenu && (
                                    <div className="home-user-menu">
                                        <div className="home-user-menu-header">
                                            <span className="home-user-type">
                                                {user.accountType === 'koper' && 'Koper Account'}
                                                {user.accountType === 'aanvoerder' && 'Aanvoerder Account'}
                                                {user.accountType === 'veilingmeester' && 'Veilingmeester Account'}
                                            </span>
                                        </div>
                                        <button 
                                            className="home-menu-item" 
                                            onClick={() => { navigate('/account'); setShowUserMenu(false); }}
                                        >
                                            Mijn Account
                                        </button>
                                        {user.accountType === 'koper' && (
                                            <button 
                                                className="home-menu-item" 
                                                onClick={() => { navigate('/mijn-veilingen'); setShowUserMenu(false); }}
                                            >
                                                Mijn Veilingen
                                            </button>
                                        )}
                                        <button 
                                            className="home-menu-item home-menu-logout" 
                                            onClick={handleLogout}
                                        >
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
                        <p>U moet ingelogd zijn als Koper om deze functie te gebruiken.</p>
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

export default HomeNavbar;

