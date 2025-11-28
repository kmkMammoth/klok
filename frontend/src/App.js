import { useState } from 'react';
import './App.css';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import TestAPIPage from './pages/TestAPIPage';
import Overview from './pages/VeilingmeesterOverview';
import CreateAuction from './pages/VeilingmeesterCreateAuction';
import ProductOverzicht from './pages/AanvoerderProductenoverzicht';
import KoperOverview from "./pages/AanvoerderKoperOverview";
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import { NavLink, Routes, Route, useLocation, useNavigate } from 'react-router-dom';

function App() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [auctions, setAuctions] = useState([
        {
            id: 1,
            name: 'Rode Rozen Boeket',
            maxTime: 120,
            currentPrice: 45.00,
            startingPrice: 100.00,
            startTime: Date.now()
        },
        {
            id: 2,
            name: 'Tulpen Mix',
            maxTime: 90,
            currentPrice: 28.50,
            startingPrice: 60.00,
            startTime: Date.now()
        }
    ]);

    const addAuction = (auction) => {
        const newAuction = {
            ...auction,
            id: auctions.length + 1,
            currentPrice: auction.startingPrice,
            startTime: Date.now()
        };
        setAuctions([...auctions, newAuction]);
    };

    // Hide main navbar on register and login pages
    const hideNavbarPaths = ['/register', '/login'];
    const showNavbar = !hideNavbarPaths.includes(location.pathname);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="App">
            {showNavbar && (
            <nav className="navbar">
                <div className="nav-container">
                    <p className="logo"> Flora Veiling</p>
                    <ul className="nav-menu">
                        <li>
                            <NavLink to="/" end className={({isActive}) => isActive ? 'active' : ''}>
                                Startpagina
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/veilingzaal" className={({isActive}) => isActive ? 'active' : ''}>
                                Veilingzaal
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/mijn-veilingen" className={({isActive}) => isActive ? 'active' : ''}>
                                Mijn Veilingen
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/helpcentrum" className={({isActive}) => isActive ? 'active' : ''}>
                                Helpcentrum
                            </NavLink>
                        </li>
                    </ul>
                    <div className="nav-buttons">
                        {user ? (
                            <>
                                <span className="user-welcome">Welkom, {user.name}!</span>
                                <button className="nav-btn-logout" onClick={handleLogout}>Uitloggen</button>
                            </>
                        ) : (
                            <>
                                <button className="nav-btn-login" onClick={() => navigate('/login')}>Inloggen</button>
                                <button className="nav-btn-register" onClick={() => navigate('/register')}>Registreren</button>
                            </>
                        )}
                    </div>
                </div>
            </nav>
            )}

            <div className="content-wrapper">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/test-api" element={<TestAPIPage />} />
                    <Route path="/helpcentrum" element={<div className="content"><h1>Helpcentrum</h1><p>Hier vindt u hulp en ondersteuning.</p></div>} />
                    
                    {/* Protected Routes - Veilingmeester */}
                    <Route path="/veilingzaal" element={
                        <ProtectedRoute allowedRoles={['veilingmeester']}>
                        <>
                            <div className="welcome-section">
                                <h2>Welkom bij Flora Veiling</h2>
                                <p>Ontdek de beste bloemen tegen de beste prijzen via ons unieke aflopende veiling systeem</p>
                            </div>
                            <Overview auctions={auctions} setAuctions={setAuctions} />
                        </>
                        </ProtectedRoute>
                    } />
                    <Route path="/mijn-veilingen" element={
                        <ProtectedRoute allowedRoles={['veilingmeester']}>
                            <CreateAuction auctions={auctions} addAuction={addAuction} />
                        </ProtectedRoute>
                    } />
                    
                    {/* Protected Routes - Aanvoerder */}
                    <Route path="/producten" element={
                        <ProtectedRoute allowedRoles={['aanvoerder']}>
                            <ProductOverzicht auctions={auctions} />
                        </ProtectedRoute>
                    } />
                    
                    {/* Protected Routes - Koper */}
                    <Route path="/kOverview" element={
                        <ProtectedRoute allowedRoles={['koper']}>
                            <KoperOverview auctions={auctions} />
                        </ProtectedRoute>
                    } />
                </Routes>
            </div>
        </div>
    );
}

export default App;
