import { useState } from 'react';
import '../styles/VeilingmeesterCreateAuction.css';

function CreateAuction({ auctions, addAuction }) {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        maxTime: '',
        startingPrice: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.name && formData.maxTime && formData.startingPrice) {
            addAuction({
                name: formData.name,
                maxTime: parseInt(formData.maxTime),
                startingPrice: parseFloat(formData.startingPrice)
            });
            setFormData({ name: '', maxTime: '', startingPrice: '' });
            setShowForm(false);
        }
    };

    const formatPrice = (price) => {
        return `€ ${price.toFixed(2)}`;
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="create-container">
            <div className="create-header">
                <h2>Veilingen Beheren</h2>
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
                            <h3>Nieuwe Veiling Aanmaken</h3>
                            <button
                                className="close-button"
                                onClick={() => setShowForm(false)}
                            >
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Veilingnaam</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="Bijv. Rode Rozen Boeket"
                                    required
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
                                />
                            </div>
                            <button type="submit" className="submit-button">
                                Bevestigen
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="auctions-list-create">
                <h3>Huidige Veilingen</h3>
                <div className="auctions-grid-create">
                    {auctions.map(auction => (
                        <div key={auction.id} className="auction-item">
                            <div className="auction-item-header">
                                <h4>{auction.name}</h4>
                                <span className="auction-badge">#{auction.id}</span>
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
                    ))}
                </div>
            </div>
        </div>
    );
}

export default CreateAuction;