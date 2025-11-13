import { useState } from 'react';
import './App.css';
import Overview from './pages/VeilingmeesterOverview';
import CreateAuction from './pages/VeilingmeesterCreateAuction';
import ProductOverzicht from './pages/AanvoerderProductenoverzicht';
import KoperOverview from "./pages/AanvoerderKoperOverview";
import { NavLink, Routes, Route } from 'react-router-dom';

function App() {
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

    return (
        <div className="App">
            <nav className="navbar">
                <div className="nav-container">
                    <p className="logo">Flora Veiling</p>
                    <ul className="nav-menu">
                        <li>
                            <NavLink to="/" end className={({isActive}) => isActive ? 'active' : ''}>
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
                            <NavLink to="/app" className={({isActive}) => isActive ? 'active' : ''}>
                                Welkom, (actor) !
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </nav>

            <div className="content">
                <Routes>
                    <Route path="/" element={
                        <>
                            <div className="welcome-section">
                                <h2>Welkom bij Flora Veiling</h2>
                                <p>Ontdek de beste bloemen tegen de beste prijzen via ons unieke aflopende veiling systeem</p>
                            </div>
                            <Overview auctions={auctions} setAuctions={setAuctions} />
                        </>
                    } />
                    <Route path="/create" element={<CreateAuction auctions={auctions} addAuction={addAuction} />} />
                    <Route path="/producten" element={<ProductOverzicht auctions={auctions} />} />
                    <Route path="/kOverview" element={<KoperOverview auctions={auctions} />} />
                    <Route path="/app" element={<div><h1>Welkom, Veilingmeester! (Accountinformatie)</h1></div>} />
                </Routes>
            </div>
        </div>
    );
}

export default App;
