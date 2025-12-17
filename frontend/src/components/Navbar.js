import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

import '../styles/Navbar.css';
import { useRole } from '../auth/RoleContext';

function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    const token = localStorage.getItem('accessToken');
    const isLoggedIn = !!token;

    const { role } = useRole();

    const canSeeCreateAuction = role === 'Veilingmeester' || role === 'Admin';
    const canSeeKoperOverview = role === 'Aanvoerder' || role === 'Admin';
    const canSeeCreateProduct = role === 'Aanvoerder' || role === 'Admin';

    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const accountMenuRef = useRef(null);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        setIsAccountMenuOpen(false);
        navigate('/login', { replace: true });
    };

    useEffect(() => {
        if (!isAccountMenuOpen) return;

        const onMouseDown = (e) => {
            if (!accountMenuRef.current) return;
            if (!accountMenuRef.current.contains(e.target)) {
                setIsAccountMenuOpen(false);
            }
        };

        const onKeyDown = (e) => {
            if (e.key === 'Escape') setIsAccountMenuOpen(false);
        };

        document.addEventListener('mousedown', onMouseDown);
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('mousedown', onMouseDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [isAccountMenuOpen]);

    return (
        <nav className="navbar">
            <div className="nav-container">
                <p className="logo">
                    <img className="logo-img" src="/logo-flora-veiling.png" alt="Flora Veiling" />
                </p>

                <ul className="nav-menu">
                    {isAuthPage ? (
                        <>
                            <li>
                                <NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''}>
                                    Login
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/register" className={({ isActive }) => isActive ? 'active' : ''}>
                                    Register
                                </NavLink>
                            </li>
                        </>
                    ) : (
                        <>
                            {isLoggedIn && (
                                <>
                                    <li>
                                        <NavLink to="/overzicht" className={({ isActive }) => isActive ? 'active' : ''}>
                                            Overzicht
                                        </NavLink>
                                    </li>

                                    {canSeeCreateAuction && (
                                        <li>
                                            <NavLink to="/create-auction" className={({ isActive }) => isActive ? 'active' : ''}>
                                                Veiling Aanmaken
                                            </NavLink>
                                        </li>
                                    )}

                                    {canSeeKoperOverview && (
                                        <li>
                                            <NavLink to="/koper-overview" className={({ isActive }) => isActive ? 'active' : ''}>
                                                Koper Overview
                                            </NavLink>
                                        </li>
                                    )}

                                    {canSeeCreateProduct && (
                                        <li>
                                            <NavLink to="/create-product" className={({ isActive }) => isActive ? 'active' : ''}>
                                                Product Aanmaken
                                            </NavLink>
                                        </li>
                                    )}
                                </>
                            )}

                            {!isLoggedIn ? (
                                <>
                                    <li>
                                        <NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''}>
                                            Login
                                        </NavLink>
                                    </li>
                                    <li>
                                        <NavLink to="/register" className={({ isActive }) => isActive ? 'active' : ''}>
                                            Register
                                        </NavLink>
                                    </li>
                                </>
                            ) : (
                                <li ref={accountMenuRef} className={`nav-account ${isAccountMenuOpen ? 'open' : ''}`}>
                                    <button
                                        type="button"
                                        className="nav-account-trigger nav-account-icon-btn"
                                        onClick={() => setIsAccountMenuOpen(v => !v)}
                                        aria-haspopup="menu"
                                        aria-expanded={isAccountMenuOpen}
                                        aria-label="Account menu"
                                        title="Account"
                                    >
                                        <svg
                                            className="nav-account-icon"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                            <path
                                                d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </button>

                                    <div className="nav-account-menu" role="menu">
                                        <NavLink
                                            to="/account"
                                            className="nav-account-item"
                                            role="menuitem"
                                            onClick={() => setIsAccountMenuOpen(false)}
                                        >
                                            Account
                                        </NavLink>

                                        <button
                                            type="button"
                                            className="nav-account-item nav-account-logout"
                                            onClick={handleLogout}
                                            role="menuitem"
                                        >
                                            <span className="nav-account-item-content">
                                                <span>Uitloggen</span>
                                            </span>
                                        </button>
                                    </div>
                                </li>
                            )}
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;