import { useState } from 'react';
import './App.css';
import Overview from './pages/VeilingmeesterOverview';
import CreateAuction from './pages/VeilingmeesterCreateAuction';
import ProductOverzicht from './pages/AanvoerderProductenoverzicht';
import KoperOverview from "./pages/AanvoerderKoperOverview";
import AanvoerderCreateProduct from './pages/AanvoerderCreateProduct';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Veilingzaal from './pages/Veilingzaal';
import MijnVeilingen from './pages/MijnVeilingen';
import { NavLink, Routes, Route, useLocation } from 'react-router-dom';

function App() {
    const location = useLocation();
    
    // 公共页面（有自己的导航栏）
    const publicPages = ['/', '/login', '/register', '/veilingzaal', '/mijn-veilingen'];
    const isPublicPage = publicPages.includes(location.pathname);

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

    // 使用 Navbar 组件的页面
    if (isPublicPage) {
        return (
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/veilingzaal" element={<Veilingzaal />} />
                <Route path="/mijn-veilingen" element={<MijnVeilingen />} />
            </Routes>
        );
    }

    // 内部页面（Veilingmeester/Aanvoerder dashboard）
    return (
        <div className="App">
            <nav className="navbar">
                <div className="nav-container">
                    <NavLink to="/" className="logo">Flora Veiling</NavLink>
                    <ul className="nav-menu">
                        <li>
                            <NavLink to="/dashboard" end className={({isActive}) => isActive ? 'active' : ''}>
                                Overzicht
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/create" className={({isActive}) => isActive ? 'active' : ''}>
                                Veiling Aanmaken (VM)
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/kOverview" className={({isActive}) => isActive ? 'active' : ''}>
                                Koper Overview (A)
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/producten" className={({isActive}) => isActive ? 'active' : ''}>
                                Productenoverzicht (A)
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/create-product" className={({isActive}) => isActive ? 'active' : ''}>
                                Product Aanmaken (A)
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/account" className={({isActive}) => isActive ? 'active' : ''}>
                                Welkom, (actor) !
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </nav>

            <div className="content">
                <Routes>
                    <Route path="/dashboard" element={
                        <>
                            <div className="welcome-section">
                                <h2>Welkom bij Flora Veiling</h2>
                                <p>Ontdek de beste bloemen tegen de beste prijzen via ons unieke aflopende veiling systeem</p>
                            </div>
                            <Overview auctions={auctions} setAuctions={setAuctions} />
                        </>
                    } />
                    <Route path="/create" element={<CreateAuction auctions={auctions} addAuction={addAuction} />} />
                    <Route path="/create-product" element={<AanvoerderCreateProduct />} />
                    <Route path="/producten" element={<ProductOverzicht auctions={auctions} />} />
                    <Route path="/kOverview" element={<KoperOverview auctions={auctions} />} />
                    <Route path="/account" element={<div><h1>Welkom, Veilingmeester! (Accountinformatie)</h1></div>} />
                </Routes>
            </div>
        </div>
    );
}

export default App;
