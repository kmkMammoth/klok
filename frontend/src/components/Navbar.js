import { NavLink, useLocation } from 'react-router-dom';

import '../styles/Navbar.css';

function Navbar() {
    const location = useLocation();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    return (
        <nav className="navbar">
            <div className="nav-container">
                <p className="logo">
                    <img className="logo-img" src="/logo-flora-veiling.png" />
                </p>
                
                <ul className="nav-menu">
                    {isAuthPage ? (
                        <>
                            <li>
                                <NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''}>
                                    Login test
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/register" className={({ isActive }) => isActive ? 'active' : ''}>
                                    Register test
                                </NavLink>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
                                    Overzicht
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/create-auction" className={({ isActive }) => isActive ? 'active' : ''}>
                                    Veiling Aanmaken (VM)
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/koper-overview" className={({ isActive }) => isActive ? 'active' : ''}>
                                    Koper Overview (A)
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/aanvoerder-producten" className={({ isActive }) => isActive ? 'active' : ''}>
                                    Productenoverzicht (A)
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/create-product" className={({ isActive }) => isActive ? 'active' : ''}>
                                    Product Aanmaken (A)
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/login" className={({ isActive }) => isActive ? 'active' : ''}>
                                    Login test
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/register" className={({ isActive }) => isActive ? 'active' : ''}>
                                    Register test
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/account" className={({ isActive }) => isActive ? 'active' : ''}>
                                    Welkom, (actor) !
                                </NavLink>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;