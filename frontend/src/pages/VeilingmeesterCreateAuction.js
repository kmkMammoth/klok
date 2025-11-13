import { useState, useEffect } from 'react';
import '../styles/VeilingmeesterCreateAuction.css';

function CreateAuction({ auctions, addAuction }) {
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [localAuctions, setLocalAuctions] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        maxTime: '',
        startingPrice: ''
    });

    // Load veilingen op pagina load en wanneer de pagina weer zichtbaar wordt
    useEffect(() => {
        // initial load
        fetchAuctions();

        // refetch when window/tab regains focus or becomes visible again
        const onFocus = () => fetchAuctions();
        const onVisibility = () => {
            if (document.visibilityState === 'visible') fetchAuctions();
        };

        window.addEventListener('focus', onFocus);
        document.addEventListener('visibilitychange', onVisibility);

        return () => {
            window.removeEventListener('focus', onFocus);
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, []);

    const fetchAuctions = async () => {
        try {
            const response = await fetch('http://localhost:5102/api/auctions');
            if (!response.ok) {
                throw new Error('Fout bij het ophalen van veilingen');
            }
            const data = await response.json();
            setLocalAuctions(data);
        } catch (err) {
            console.error('Error fetching auctions:', err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Weet je zeker dat je deze veiling wilt verwijderen?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5102/api/auctions/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Fout bij het verwijderen van de veiling');
            }

            // Verwijder uit local state
            setLocalAuctions(localAuctions.filter(a => a.id !== id));
        } catch (err) {
            alert('Fout bij het verwijderen: ' + err.message);
            console.error('Error deleting auction:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.maxTime || !formData.startingPrice) {
            setError('Alle velden zijn verplicht');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5102/api/auctions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    maxTime: parseInt(formData.maxTime),
                    startingPrice: parseFloat(formData.startingPrice)
                })
            });

            if (!response.ok) {
                throw new Error('Fout bij het aanmaken van de veiling');
            }

            const newAuction = await response.json();
            addAuction(newAuction);
            setLocalAuctions([...localAuctions, newAuction]);
            setFormData({ name: '', maxTime: '', startingPrice: '' });
            setShowForm(false);
        } catch (err) {
            setError(err.message || 'Er is een fout opgetreden');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price) => {
        if (!price && price !== 0) return '€ 0.00';
        return `€ ${parseFloat(price).toFixed(2)}`;
    };

    const formatTime = (seconds) => {
        if (!seconds && seconds !== 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="create-container">
            <div className="create-header">
                <h1>Veilingen</h1>
                <button
                    className="add-button"
                    onClick={() => setShowForm(!showForm)}
                >
                    <span className="plus-icon">+</span>
                    Nieuwe Veiling
                </button>
            </div>

            {showForm && (
                <div className="form-overlay">
                    <div className="form-modal">
                        <div className="form-header">
                            <h2>Nieuwe Veiling Aanmaken</h2>
                            <button
                                className="close-button"
                                onClick={() => setShowForm(false)}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            {error && <div className="error-message">{error}</div>}
                            <div className="form-group">
                                <label>Veilingnaam</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="Bijv. Rode Rozen Boeket"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="form-group">
                                <label>Maximale Tijd (seconden)</label>
                                <input
                                    type="number"
                                    value={formData.maxTime}
                                    onChange={(e) => setFormData({...formData, maxTime: e.target.value})}
                                    placeholder="Bijv. 120"
                                    min="1"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="form-group">
                                <label>Startprijs (€)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.startingPrice}
                                    onChange={(e) => setFormData({...formData, startingPrice: e.target.value})}
                                    placeholder="Bijv. 100.00"
                                    min="0.01"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <button type="submit" className="submit-button" disabled={loading}>
                                {loading ? 'Bezig met opslaan...' : 'Bevestigen'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="auctions-list-create">
                <h2>Huidige Veilingen</h2>
                <div className="auctions-grid-create">
                    {localAuctions.length === 0 ? (
                        <div className="no-auctions">Geen veilingen gevonden.</div>
                    ) : (
                        localAuctions.map((auction) => {
                            return (
                                <div key={auction.id} className="auction-item">
                                    <div className="auction-item-header">
                                        <h3>{auction.name}</h3>
                                        <div className="auction-item-actions">
                                            <span className="auction-badge">#{auction.id}</span>
                                            <button 
                                                className="delete-button"
                                                onClick={() => handleDelete(auction.id)}
                                                title="Verwijder veiling"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                    <div className="auction-item-details">
                                        <div className="detail-small">
                                            <span>Startprijs:</span>
                                            <strong>{formatPrice(auction.startingPrice)}</strong>
                                        </div>
                                        <div className="detail-small">
                                            <span>Max. Tijd:</span>
                                            <strong>{formatTime(auction.maxTime)}</strong>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

export default CreateAuction;