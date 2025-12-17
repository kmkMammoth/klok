import './App.css';
import Overview from './pages/VeilingmeesterOverview';
import CreateAuction from './pages/VeilingmeesterCreateAuction';
import KoperOverview from './pages/AanvoerderKoperOverview';
import AanvoerderCreateProduct from './pages/AanvoerderCreateProduct';
import { Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Account from './pages/VeilingmeesterAccount';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { RoleProvider } from './auth/RoleContext';
import RequireRole from './auth/RequireRole';

function App() {
    return (
        <RoleProvider>
            <div className="App">
                <Navbar />

                <div className="content">
                    <Routes>
                        <Route path="/" element={<Login />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        <Route
                            path="/overzicht"
                            element={
                                <RequireRole allow={['Koper', 'Veilingmeester', 'Aanvoerder', 'Admin']}>
                                    <>
                                        <div className="welcome-section">
                                            <h2>Welkom bij Flora Veiling</h2>
                                            <p>
                                                Ontdek de beste bloemen tegen de beste prijzen via ons unieke aflopende veiling
                                                systeem
                                            </p>
                                        </div>
                                        <Overview />
                                    </>
                                </RequireRole>
                            }
                        />

                        <Route
                            path="/create-auction"
                            element={
                                <RequireRole allow={['Veilingmeester', 'Admin']}>
                                    <CreateAuction />
                                </RequireRole>
                            }
                        />

                        <Route
                            path="/create-product"
                            element={
                                <RequireRole allow={['Aanvoerder', 'Admin']}>
                                    <AanvoerderCreateProduct />
                                </RequireRole>
                            }
                        />

                        <Route
                            path="/koper-overview"
                            element={
                                <RequireRole allow={['Aanvoerder', 'Admin']}>
                                    <KoperOverview />
                                </RequireRole>
                            }
                        />

                        <Route
                            path="/account"
                            element={
                                <RequireRole allow={['Koper', 'Veilingmeester', 'Aanvoerder', 'Admin']}>
                                    <Account />
                                </RequireRole>
                            }
                        />
                    </Routes>
                </div>

                <Footer />
            </div>
        </RoleProvider>
    );
}

export default App;