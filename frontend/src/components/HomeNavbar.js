import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../styles/HomePage.css';

const HomeNavbar = ({ activePage = null }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, [location]);

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

    const handleHelpcentrumClick = (e) => {
        e.preventDefault();
        if (location.pathname === '/') {
            const footer = document.getElementById('footer');
            if (footer) {
                footer.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            navigate('/');
            setTimeout(() => {
                const footer = document.getElementById('footer');
                if (footer) {
                    footer.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
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
                            <button 
                                className="nav-link" 
                                onClick={handleHelpcentrumClick}
                            >
                                Helpcentrum
                            </button>
                        </li>
                    </ul>
                    <div className="home-nav-buttons">
                        {user ? (
                            <div className="home-user-section">
                                <span className="home-username">{user.gebruikersnaam}</span>
                                <button 
                                    className="btn-login"
                                    onClick={handleLogout}
                                >
                                    Uitloggen
                                </button>
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

