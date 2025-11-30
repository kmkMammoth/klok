import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/MijnVeilingen.css';

const MijnVeilingen = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [mijnVeilingen, setMijnVeilingen] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Controleer of gebruiker is ingelogd als Koper
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login');
            return;
        }

        const parsedUser = JSON.parse(userData);
        if (parsedUser.accountType !== 'koper') {
            navigate('/');
            return;
        }

        setUser(parsedUser);

        // Mock data - later te vervangen door API call
        const mockVeilingen = [
            { id: 1, naam: 'Orchideeën Set', bod: 120.00, status: 'Gewonnen', datum: '28-11-2025', afbeelding: '🌺' },
            { id: 2, naam: 'Zonnebloemen', bod: 45.00, status: 'Overboden', datum: '27-11-2025', afbeelding: '🌻' },
            { id: 3, naam: 'Rode Rozen', bod: 65.00, status: 'Actief', datum: '30-11-2025', afbeelding: '🌹' },
            { id: 4, naam: 'Tulpen Mix', bod: 38.00, status: 'Gewonnen', datum: '25-11-2025', afbeelding: '🌷' },
        ];

        setTimeout(() => {
            setMijnVeilingen(mockVeilingen);
            setLoading(false);
        }, 500);
    }, [navigate]);

    if (!user) {
        return null;
    }

    return (
        <div className="mijn-veilingen-page">
            <Navbar />
            
            <main className="mijn-veilingen-main">
                <div className="mijn-veilingen-header">
                    <h1>Mijn Veilingen</h1>
                    <p>Bekijk uw biedingen en gewonnen veilingen</p>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Veilingen laden...</p>
                    </div>
                ) : mijnVeilingen.length > 0 ? (
                    <div className="veilingen-list">
                        {mijnVeilingen.map(veiling => (
                            <div key={veiling.id} className="mijn-veiling-card">
                                <div className="mijn-veiling-image">
                                    <span>{veiling.afbeelding}</span>
                                </div>
                                <div className="mijn-veiling-info">
                                    <h3>{veiling.naam}</h3>
                                    <p className="mijn-veiling-datum">{veiling.datum}</p>
                                </div>
                                <div className="mijn-veiling-bod">
                                    <span className="bod-label">Uw bod</span>
                                    <span className="bod-bedrag">€{veiling.bod.toFixed(2)}</span>
                                </div>
                                <span className={`mijn-veiling-status status-${veiling.status.toLowerCase()}`}>
                                    {veiling.status}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <span className="empty-icon">📋</span>
                        <h3>Geen veilingen gevonden</h3>
                        <p>U heeft nog geen biedingen geplaatst</p>
                        <button 
                            className="btn-primary"
                            onClick={() => navigate('/veilingzaal')}
                        >
                            Ga naar Veilingzaal
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MijnVeilingen;

