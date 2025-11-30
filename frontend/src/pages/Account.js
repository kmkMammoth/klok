import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeNavbar from '../components/HomeNavbar';
import '../styles/Account.css';

const Account = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Controleer of gebruiker is ingelogd
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        fetchUserDetails(parsedUser);
    }, [navigate]);

    const fetchUserDetails = async (userInfo) => {
        setLoading(true);
        try {
            const API_BASE_URL = 'http://localhost:5102/api';
            let endpoint = '';
            
            // Bepaal het juiste endpoint op basis van account type
            switch (userInfo.accountType) {
                case 'koper':
                    endpoint = `${API_BASE_URL}/Koper?id=${userInfo.roleId}`;
                    break;
                case 'aanvoerder':
                    endpoint = `${API_BASE_URL}/Aanvoerder?id=${userInfo.roleId}`;
                    break;
                case 'veilingmeester':
                    endpoint = `${API_BASE_URL}/Veilingmeester?id=${userInfo.roleId}`;
                    break;
                default:
                    setLoading(false);
                    return;
            }

            const response = await fetch(endpoint);
            if (response.ok) {
                const data = await response.json();
                // Data kan een array zijn of een object
                const details = Array.isArray(data) ? data[0] : data;
                setUserDetails(details);
            }
        } catch (err) {
            console.error('Error fetching user details:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return null;
    }

    const getAccountTypeLabel = (type) => {
        switch (type) {
            case 'koper':
                return 'Koper Account';
            case 'aanvoerder':
                return 'Aanvoerder Account';
            case 'veilingmeester':
                return 'Veilingmeester Account';
            default:
                return 'Account';
        }
    };

    const getAccountTypeIcon = (type) => {
        switch (type) {
            case 'koper':
                return '🛒';
            case 'aanvoerder':
                return '🚚';
            case 'veilingmeester':
                return '👔';
            default:
                return '👤';
        }
    };

    return (
        <div className="account-page">
            <HomeNavbar activePage="/account" />
            
            <main className="account-main">
                <div className="account-header">
                    <h1>Mijn Account</h1>
                    <p>Uw account informatie en instellingen</p>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Accountgegevens laden...</p>
                    </div>
                ) : (
                    <div className="account-content">
                        {/* Account Overview Card */}
                        <div className="account-card">
                            <div className="account-card-header">
                                <div className="account-avatar">
                                    <span className="account-icon">{getAccountTypeIcon(user.accountType)}</span>
                                </div>
                                <div className="account-title-section">
                                    <h2>{user.gebruikersnaam}</h2>
                                    <span className="account-type-badge">
                                        {getAccountTypeLabel(user.accountType)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Account Details */}
                        <div className="account-card">
                            <div className="card-header">
                                <h3>Accountgegevens</h3>
                            </div>
                            <div className="account-details">
                                <div className="detail-row">
                                    <span className="detail-label">Gebruikersnaam</span>
                                    <span className="detail-value">{user.gebruikersnaam}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Account Type</span>
                                    <span className="detail-value">{getAccountTypeLabel(user.accountType)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Gebruiker ID</span>
                                    <span className="detail-value">#{user.gebruikerId}</span>
                                </div>
                                {userDetails && (
                                    <>
                                        {(userDetails.email || userDetails.Email) && (
                                            <div className="detail-row">
                                                <span className="detail-label">E-mailadres</span>
                                                <span className="detail-value">{userDetails.email || userDetails.Email}</span>
                                            </div>
                                        )}
                                        {(userDetails.adres || userDetails.Adres) && (
                                            <div className="detail-row">
                                                <span className="detail-label">Adres</span>
                                                <span className="detail-value">{userDetails.adres || userDetails.Adres}</span>
                                            </div>
                                        )}
                                        {(userDetails.kvkNummer || userDetails.KvkNummer) && (
                                            <div className="detail-row">
                                                <span className="detail-label">KvK Nummer</span>
                                                <span className="detail-value">{userDetails.kvkNummer || userDetails.KvkNummer}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Account Actions */}
                        <div className="account-card">
                            <div className="card-header">
                                <h3>Account Acties</h3>
                            </div>
                            <div className="account-actions">
                                <button className="action-btn primary-btn" onClick={() => navigate('/helpcentrum')}>
                                    <span className="action-icon">❓</span>
                                    Help & Support
                                </button>
                                <button 
                                    className="action-btn secondary-btn"
                                    onClick={() => {
                                        localStorage.removeItem('user');
                                        navigate('/');
                                    }}
                                >
                                    <span className="action-icon">🚪</span>
                                    Uitloggen
                                </button>
                            </div>
                        </div>

                        {/* Account Statistics (for future use) */}
                        {user.accountType === 'koper' && (
                            <div className="account-card">
                                <div className="card-header">
                                    <h3>Statistieken</h3>
                                </div>
                                <div className="account-stats">
                                    <div className="stat-item">
                                        <span className="stat-label">Gewonnen Veilingen</span>
                                        <span className="stat-value">-</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Actieve Biedingen</span>
                                        <span className="stat-value">-</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Account;

