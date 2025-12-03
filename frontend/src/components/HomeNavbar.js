import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';

const HomeNavbar = ({ activePage = '/', hideLoginButton = false, hideRegisterButton = false }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navRef = useRef(null);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [mobileMenuOpen]);

    // Close menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target) && mobileMenuOpen) {
                setMobileMenuOpen(false);
            }
        };

        if (mobileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [mobileMenuOpen]);

    return (
        <nav className="home-nav" ref={navRef}>
            <div className="home-nav-container">
                <div className="home-logo" onClick={() => {
                    // Only navigate to veilingzaal if user is logged in
                    // Otherwise, stay on current page or go to login
                    const isAuthenticated = 
                        localStorage.getItem('user') || 
                        sessionStorage.getItem('user') || 
                        localStorage.getItem('rememberMe') === 'true';
                    
                    if (isAuthenticated) {
                        navigate('/veilingzaal');
                    } else {
                        // If on login or register page, just stay there
                        // Otherwise, go to login
                        if (location.pathname !== '/login' && location.pathname !== '/register') {
                            navigate('/login');
                        }
                    }
                }} style={{cursor: 'pointer'}}>
                    <span className="logo-icon">🌺</span>
                    <span className="logo-text">Flora Veiling</span>
                </div>
                <button 
                    className="mobile-menu-toggle"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span className={mobileMenuOpen ? 'hamburger open' : 'hamburger'}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                </button>
                <div className={`home-nav-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                    <ul>
                        <li>
                            <NavLink 
                                to="/veilingzaal" 
                                className={({isActive}) => `nav-link ${isActive ? 'nav-active' : ''}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Veilingzaal
                            </NavLink>
                        </li>
                        <li>
                            <NavLink 
                                to="/mijn-veilingen" 
                                className={({isActive}) => `nav-link ${isActive ? 'nav-active' : ''}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Mijn Veilingen
                            </NavLink>
                        </li>
                        <li>
                            <NavLink 
                                to="/helpcentrum" 
                                className={({isActive}) => `nav-link ${isActive ? 'nav-active' : ''}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Helpcentrum
                            </NavLink>
                        </li>
                    </ul>
                </div>
                <div className={`home-nav-buttons ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                    {!hideLoginButton && (
                        <button className="btn-login" onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>
                            Inloggen
                        </button>
                    )}
                    {!hideRegisterButton && (
                        <button className="btn-register" onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}>
                            Registreren
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default HomeNavbar;

