import { useState } from 'react';
import './App.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Overview from './pages/VeilingmeesterOverview';
import CreateAuction from './pages/VeilingmeesterCreateAuction';
import ProductOverzicht from './pages/AanvoerderProductenoverzicht';
import KoperOverview from "./pages/AanvoerderKoperOverview";
import AanvoerderCreateProduct from './pages/AanvoerderCreateProduct';
import DashboardNavbar from './components/DashboardNavbar';
import ProtectedRoute from './components/ProtectedRoute';
import { Routes, Route, Navigate } from 'react-router-dom';

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
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/veilingzaal" element={
                    <ProtectedRoute>
                        <div>
                            <DashboardNavbar activePage="/veilingzaal" />
                            <div className="content">
                                <div className="welcome-section">
                                    <h2>Welkom bij Flora Veiling</h2>
                                    <p>Ontdek de beste bloemen tegen de beste prijzen via ons unieke aflopende veiling systeem</p>
                                </div>
                                <Overview auctions={auctions} setAuctions={setAuctions} />
                            </div>
                        </div>
                    </ProtectedRoute>
                } />
                <Route path="/create" element={
                    <ProtectedRoute>
                        <div>
                            <DashboardNavbar activePage="/create" />
                            <div className="content">
                                <CreateAuction auctions={auctions} addAuction={addAuction} />
                            </div>
                        </div>
                    </ProtectedRoute>
                } />
                <Route path="/create-product" element={
                    <ProtectedRoute>
                        <div>
                            <DashboardNavbar activePage="/create-product" />
                            <div className="content">
                                <AanvoerderCreateProduct />
                            </div>
                        </div>
                    </ProtectedRoute>
                } />
                <Route path="/producten" element={
                    <ProtectedRoute>
                        <div>
                            <DashboardNavbar activePage="/producten" />
                            <div className="content">
                                <ProductOverzicht auctions={auctions} />
                            </div>
                        </div>
                    </ProtectedRoute>
                } />
                <Route path="/kOverview" element={
                    <ProtectedRoute>
                        <div>
                            <DashboardNavbar activePage="/kOverview" />
                            <div className="content">
                                <KoperOverview auctions={auctions} />
                            </div>
                        </div>
                    </ProtectedRoute>
                } />
                <Route path="/mijn-veilingen" element={
                    <div className="content">
                        <KoperOverview auctions={auctions} />
                    </div>
                } />
                <Route path="/helpcentrum" element={
                    <div className="content">
                        <h1>Helpcentrum</h1>
                        <p>Hier vindt u hulp en ondersteuning.</p>
                    </div>
                } />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/app" element={
                    <div className="content">
                        <h1>Welkom, Veilingmeester! (Accountinformatie)</h1>
                    </div>
                } />
            </Routes>
        </div>
    );
}

export default App;
