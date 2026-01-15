import './App.css';
import CreateAuction from './pages/VeilingmeesterCreateAuction';
import KoperOverview from './pages/AanvoerderKoperOverview';
import AanvoerderCreateProduct from './pages/AanvoerderCreateProduct';
import {Routes, Route, Navigate} from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Account from './pages/ActorAccount';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { RoleProvider } from './auth/RoleContext';
import RequireRole from './auth/RequireRole';
import KoperDashboard from './pages/KoperDashboard';

/**
 * App
 *
 * Hoofd-app component met centraliseerde routing en role-based access control.
 * Functies en verantwoordelijkheden:
 * - Controleert loginstatus via localStorage accessToken.
 * - Wraps alle content met RoleProvider voor globale rol-state.
 * - Definieert routes voor openbare pagina's (Login, Register).
 * - Definieert rol-beschermde routes via RequireRole HOC:
 *   - Koper: KoperDashboard (live veilingen)
 *   - Veilingmeester: CreateAuction (veilingbeheer)
 *   - Aanvoerder: AanvoerderCreateProduct (productcreatie), KoperOverview (koophistorie)
 *   - Admin: toegang tot alle pagina's
 * - Toont Navbar (header) en Footer (footer) op alle pagina's.
 * - Standaardroute: Account (ActorAccount) voor ingelogde gebruikers, anders Login.
 */
function App() {
    // Check loginstatus: token aanwezig = ingelogd
    const token = localStorage.getItem('accessToken');
    const isLoggedIn = !!token;
    console.log('isLoggedIn:', isLoggedIn);
    
    return (
        // RoleProvider: verzorgt globale rol-state en auto-refresh bij mount
        <RoleProvider>
            <div className="App">
                <Navbar />

                <div className="content">

                    <Routes>
                        {/* Standaardroute: Account voor ingelogd, anders redirect naar Login */}
                        <Route
                            path="/"
                            element={isLoggedIn ? <Account /> : <Navigate to="/login" />}
                        />

                        {/* Openbare routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        
                        {/* Rol-beschermde routes */}
                        {/* Koper-route: live veilingen */}
                        <Route
                            path="/koper-dashboard"
                            element={
                                <RequireRole allow={['Koper', 'Admin']}>
                                    <KoperDashboard />
                                </RequireRole>
                            }
                        />

                        {/* Veilingmeester-route: veilingbeheer en creatie */}
                        <Route
                            path="/create-auction"
                            element={
                                <RequireRole allow={['Veilingmeester', 'Admin']}>
                                    <CreateAuction />
                                </RequireRole>
                            }
                        />

                        {/* Aanvoerder-route: productcreatie */}
                        <Route
                            path="/create-product"
                            element={
                                <RequireRole allow={['Aanvoerder', 'Admin']}>
                                    <AanvoerderCreateProduct />
                                </RequireRole>
                            }
                        />

                        {/* Aanvoerder-route: koophistorie weergave */}
                        <Route
                            path="/koper-overview"
                            element={
                                <RequireRole allow={['Aanvoerder', 'Admin']}>
                                    <KoperOverview />
                                </RequireRole>
                            }
                        />

                        {/* Account-route: rol-specifieke account-pagina (alle rollen) */}
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