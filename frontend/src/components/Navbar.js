import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import '../styles/Navbar.css';
import { useRole } from '../auth/RoleContext';

/**
 * Navbar
 *
 * Header-navigatie getoond bovenaan elke pagina.
 * Functies en verantwoordelijkheden:
 * - Toont Flora Veiling logo (link naar home/login).
 * - Toont rol-specifieke navigatieknoppen:
 *   - Veilingmeester/Admin: "Veiling Dashboard" (CreateAuction)
 *   - Koper/Admin: "Koper Dashboard" (live veilingen)
 *   - Aanvoerder/Admin: "Koper Overview", "Product Dashboard"
 * - Toont openbare links (Login, Register) voor niet-ingelogde gebruikers.
 * - Toont account-dropdown-menu (Account, Uitloggen) voor ingelogde gebruikers.
 * - Sluit account-menu bij klik buiten (mousedown) of Esc-toets.
 */
function Navbar() {
    const navigate = useNavigate();

    // Check loginatus via localStorage token
    const token = localStorage.getItem('accessToken');
    const isLoggedIn = !!token;

    // Haal huidige rol op vanuit globale RoleContext
    const { role } = useRole();

    // Bepaal rol-specifieke zichtbaarheid van menu-items
    const canSeeCreateAuction = role === 'Veilingmeester' || role === 'Admin';
    const canSeeKoperOverview = role === 'Aanvoerder' || role === 'Admin';
    const canSeeCreateProduct = role === 'Aanvoerder' || role === 'Admin';
    const canSeeKoperDashboard = role === 'Koper' || role === 'Admin';

    // UI-state: account-menu open/dicht
    const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
    const accountMenuRef = useRef(null);

    /** Verwijder token en stuur terug naar login */
    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        setIsAccountMenuOpen(false);
        navigate('/login', { replace: true });
    };

    // Sluit account-menu bij klik buiten of Esc-toets
    useEffect(() => {
        if (!isAccountMenuOpen) return;

        // Klik buiten account-menu ref sluit menu
        const onMouseDown = (e) => {
            if (
                accountMenuRef.current &&
                !accountMenuRef.current.contains(e.target)
            ) {
                setIsAccountMenuOpen(false);
            }
        };

        // Esc-toets sluit menu
        const onKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsAccountMenuOpen(false);
            }
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
                {/* Logo */}
                <div className="logo">
                    <NavLink to={isLoggedIn ? '/' : '/login'}>
                        <img
                            className="logo-img"
                            src="/logo-flora-veiling.png"
                            alt="Flora Veiling"
                        />
                    </NavLink>
                </div>

                {/* Navigatieknop-lijst */}
                <ul className="nav-menu">
                    {/* Menu voor niet-ingelogde gebruikers */}
                    {!isLoggedIn && (
                        <>
                            <li>
                                <NavLink to="/login">
                                    Login
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/register">
                                    Register
                                </NavLink>
                            </li>
                        </>
                    )}

                    {/* Menu voor ingelogde gebruikers */}
                    {isLoggedIn && (
                        <>
                            {/* Rol-specifieke knoppen */}
                            {canSeeCreateAuction && (
                                <li>
                                    <NavLink to="/create-auction">
                                        Veiling Dashboard
                                    </NavLink>
                                </li>
                            )}

                            {canSeeKoperDashboard && (
                                <li>
                                    <NavLink to="/koper-dashboard">
                                        Koper Dashboard
                                    </NavLink>
                                </li>
                            )}

                            {canSeeKoperOverview && (
                                <li>
                                    <NavLink to="/koper-overview">
                                        Koper Overview
                                    </NavLink>
                                </li>
                            )}

                            {canSeeCreateProduct && (
                                <li>
                                    <NavLink to="/create-product">
                                        Product Dashboard
                                    </NavLink>
                                </li>
                            )}

                            {/* Account-dropdown menu */}
                            <li
                                ref={accountMenuRef}
                                className={`nav-account ${isAccountMenuOpen ? 'open' : ''}`}
                            >
                                {/* Account-trigger knop */}
                                <button
                                    type="button"
                                    className="nav-account-trigger nav-account-icon-btn"
                                    onClick={() => setIsAccountMenuOpen(v => !v)}
                                    aria-haspopup="menu"
                                    aria-expanded={isAccountMenuOpen}
                                    aria-label="Account menu"
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

                                {/* Account-dropdown inhoud */}
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
                                        Uitloggen
                                    </button>
                                </div>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;
