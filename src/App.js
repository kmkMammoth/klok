import { useState } from 'react';
import './App.css';
import Overview from './pages/VeilingmeesterOverview';
import CreateAuction from './pages/VeilingmeesterCreateAuction';
import KoperOverview from './pages/AanvoerderKoperOverview';
import Productenoverzicht from './pages/Productenoverzicht';
import { NavLink, Routes, Route } from 'react-router-dom';

function App() {
    const [currentPage, setCurrentPage] = useState('overview');
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
                    <h1 className="logo">Flora Veiling</h1>
                    <ul className="nav-menu">
                        <li>
                            <NavLink to="/" end className={({isActive}) => isActive ? 'active' : ''}>
                                Overzicht
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/create" className={({isActive}) => isActive ? 'active' : ''}>
                                Veiling Aanmaken
                            </NavLink>
                        </li>
                        <li>
                            <a 
                                href="#kOverview" 
                                className={currentPage === 'kOverview' ? 'active' : ''}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentPage('kOverview');
                                }}
                            >
                                Koper Overview
                            </a>
                        </li>
                        <li>
                            <a
                                href="#app"
                                className={currentPage === 'app' ? 'active' : ''}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentPage('app');
                                }}
                            >
                            <NavLink to="/producten" className={({isActive}) => isActive ? 'active' : ''}>
                                Productenoverzicht
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/app" className={({isActive}) => isActive ? 'active' : ''}>
                                Welkom, Veilingmeester!
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
                    <Route path="/producten" element={<Productenoverzicht auctions={auctions} />} />
                    <Route path="/app" element={<div><h2>Welkom, Veilingmeester!</h2></div>} />
                </Routes>
            </div>
        </div>
    );
}

export default App;
