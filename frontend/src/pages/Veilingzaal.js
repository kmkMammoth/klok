import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HomeNavbar from '../components/HomeNavbar';
import '../styles/Veilingzaal.css';
import '../styles/HomePage.css';

const Veilingzaal = () => {
    const navigate = useNavigate();
    const [veilingen, setVeilingen] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);

    useEffect(() => {
        // Mock data - later te vervangen door API call
        const mockVeilingen = [
            { id: 1, naam: 'Rode Rozen Premium', prijs: 45.00, eindtijd: '14:30', status: 'Actief', afbeelding: '🌹' },
            { id: 2, naam: 'Hollandse Tulpen Mix', prijs: 32.50, eindtijd: '15:00', status: 'Actief', afbeelding: '🌷' },
            { id: 3, naam: 'Witte Lelies', prijs: 28.00, eindtijd: '15:30', status: 'Actief', afbeelding: '🌸' },
            { id: 4, naam: 'Gerbera Collectie', prijs: 55.00, eindtijd: '16:00', status: 'Actief', afbeelding: '🌼' },
            { id: 5, naam: 'Orchideeën Set', prijs: 85.00, eindtijd: '16:30', status: 'Actief', afbeelding: '🌺' },
            { id: 6, naam: 'Zonnebloemen Bundel', prijs: 38.00, eindtijd: '17:00', status: 'Actief', afbeelding: '🌻' },
        ];

        setTimeout(() => {
            setVeilingen(mockVeilingen);
            setLoading(false);
        }, 500);
    }, []);

    const handleBieden = (veilingId) => {
        const user = localStorage.getItem('user');
        if (!user) {
            setShowLoginPrompt(true);
            return;
        }
        const userData = JSON.parse(user);
        if (userData.accountType !== 'koper') {
            alert('Alleen Koper accounts kunnen bieden.');
            return;
        }
        // TODO: Implement bidding logic
        console.log('Bieden op veiling:', veilingId);
    };

    return (
        <div className="veilingzaal-page">
            {/* Navigation */}
            <HomeNavbar activePage="/veilingzaal" />
            
            <main className="veilingzaal-main">
                <div className="veilingzaal-header">
                    <h1>Veilingzaal</h1>
                    <p>Bekijk en bied op actieve bloemen veilingen</p>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Veilingen laden...</p>
                    </div>
                ) : (
                    <div className="veilingen-grid">
                        {veilingen.map(veiling => (
                            <div key={veiling.id} className="veiling-card">
                                <div className="veiling-image">
                                    <span>{veiling.afbeelding}</span>
                                </div>
                                <div className="veiling-content">
                                    <h3>{veiling.naam}</h3>
                                    <div className="veiling-details">
                                        <div className="veiling-prijs">
                                            <span className="prijs-label">Huidige prijs</span>
                                            <span className="prijs-bedrag">€{veiling.prijs.toFixed(2)}</span>
                                        </div>
                                        <div className="veiling-tijd">
                                            <span className="tijd-label">Eindigt om</span>
                                            <span className="tijd-waarde">{veiling.eindtijd}</span>
                                        </div>
                                    </div>
                                    <div className="veiling-footer">
                                        <span className={`veiling-status status-${veiling.status.toLowerCase()}`}>
                                            {veiling.status}
                                        </span>
                                        <button 
                                            className="btn-bieden"
                                            onClick={() => handleBieden(veiling.id)}
                                        >
                                            Bieden
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Login Prompt Modal for Bidding */}
            {showLoginPrompt && (
                <div className="modal-overlay" onClick={() => setShowLoginPrompt(false)}>
                    <div className="login-prompt-modal" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowLoginPrompt(false)}>×</button>
                        <div className="modal-icon">🔐</div>
                        <h2>Inloggen vereist</h2>
                        <p>U moet ingelogd zijn als Koper om te kunnen bieden.</p>
                        <div className="modal-buttons">
                            <button 
                                className="btn-modal-login"
                                onClick={() => { setShowLoginPrompt(false); navigate('/login'); }}
                            >
                                Inloggen
                            </button>
                            <button 
                                className="btn-modal-register"
                                onClick={() => { setShowLoginPrompt(false); navigate('/register'); }}
                            >
                                Registreren
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Veilingzaal;

