import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import '../styles/DashboardNavbar.css';

const DashboardNavbar = ({ activePage = '/veilingzaal' }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const navRef = useRef(null);
    const userMenuRef = useRef(null);

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
            if (userMenuRef.current && !userMenuRef.current.contains(event.target) && userMenuOpen) {
                setUserMenuOpen(false);
            }
        };

        if (mobileMenuOpen || userMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [mobileMenuOpen, userMenuOpen]);

    const handleLogout = () => {
        // Clear any stored authentication data
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('user');
        sessionStorage.clear();
        
        // Navigate to login page
        navigate('/login');
    };

    return (
        <nav className="dashboard-nav" ref={navRef}>
            <div className="dashboard-nav-container">
                <div className="dashboard-logo" onClick={() => navigate('/veilingzaal')} style={{cursor: 'pointer'}}>
                    <span className="logo-text-top">Flora</span>
                    <span className="logo-text-bottom">Veiling</span>
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
                <div className={`dashboard-nav-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                    <ul>
                        <li>
                            <NavLink 
                                to="/veilingzaal" 
                                className={({isActive}) => `nav-link ${isActive ? 'nav-active' : ''}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Overzicht
                            </NavLink>
                        </li>
                        <li>
                            <NavLink 
                                to="/create" 
                                className={({isActive}) => `nav-link ${isActive ? 'nav-active' : ''}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Veiling Aanmaken (VM)
                            </NavLink>
                        </li>
                        <li>
                            <NavLink 
                                to="/kOverview" 
                                className={({isActive}) => `nav-link ${isActive ? 'nav-active' : ''}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Koper Overview (A)
                            </NavLink>
                        </li>
                        <li>
                            <NavLink 
                                to="/producten" 
                                className={({isActive}) => `nav-link ${isActive ? 'nav-active' : ''}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Product Overzicht (A)
                            </NavLink>
                        </li>
                        <li>
                            <NavLink 
                                to="/create-product" 
                                className={({isActive}) => `nav-link ${isActive ? 'nav-active' : ''}`}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Product Aanmaken (A)
                            </NavLink>
                        </li>
                    </ul>
                </div>
                <div className={`dashboard-nav-user ${mobileMenuOpen ? 'mobile-open' : ''}`} ref={userMenuRef}>
                    <button 
                        className="user-icon-button"
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        aria-label="User menu"
                    >
                        <div className="user-avatar">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </button>
                    {userMenuOpen && (
                        <div className="user-dropdown-menu">
                            <button className="user-menu-item" onClick={handleLogout}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                Uitloggen
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default DashboardNavbar;

