import './App.css';
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
import KoperDashboard from './pages/KoperDashboard';

function App() {
    const token = localStorage.getItem('accessToken');
    const isLoggedIn = !!token;
    console.log('isLoggedIn:', isLoggedIn);
    
    return (
        <RoleProvider>
            <div className="App">
                <Navbar />

                <div className="content">
                    
                    <Routes>
                        {!isLoggedIn ? (
                            
                            <Route path="/login" element={<Login />} />
                            
                        ) : (
                            
                            <Route path="/" element={<Account/>} />
                            
                        )}
                        
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        
                        <Route
                            path="/koper-dashboard"
                            element={
                                <RequireRole allow={['Koper', 'Admin']}>
                                    <KoperDashboard />
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