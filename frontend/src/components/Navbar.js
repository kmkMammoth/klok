import { NavLink, useLocation } from 'react-router-dom';

function Navbar() {
    const location = useLocation();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    return (
        <nav className="navbar">
            <div className="nav-container">
                <p className="logo">Flora Veiling</p>
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
                                <NavLink to="/create" className={({ isActive }) => isActive ? 'active' : ''}>
                                    Veiling Aanmaken (VM)
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/kOverview" className={({ isActive }) => isActive ? 'active' : ''}>
                                    Koper Overview (A)
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/producten" className={({ isActive }) => isActive ? 'active' : ''}>
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
                                <NavLink to="/app" className={({ isActive }) => isActive ? 'active' : ''}>
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