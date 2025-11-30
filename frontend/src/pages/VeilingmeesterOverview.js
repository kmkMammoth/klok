import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/VeilingmeesterOverview.css';

function Overview({ auctions, setAuctions }) {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [selectedAuction, setSelectedAuction] = useState(null);
    const [localAuctions, setLocalAuctions] = useState([]);
    const [products, setProducts] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    
    // Veiling aanmaken state
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showAuctionForm, setShowAuctionForm] = useState(false);
    const [auctionFormData, setAuctionFormData] = useState({
        maxTime: '',
        startingPrice: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Haal gebruikersgegevens op
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            if (parsedUser.accountType !== 'veilingmeester') {
                navigate('/');
                return;
            }
            setUser(parsedUser);
        } else {
            navigate('/login');
            return;
        }
    }, [navigate]);

    const fetchAuctions = async () => {
        try {
            const res = await fetch('http://localhost:5102/api/auctions');
            if (!res.ok) throw new Error('Fout bij ophalen veilingen');
            const data = await res.json();
            const mapped = (data || []).map(a => ({
                ...a,
                startingPrice: a.startingPrice ?? 0,
                maxTime: a.maxTime ?? 0,
                startTime: a.startTime ?? Date.now(),
                endTime: a.endTime ?? (a.startTime ?? Date.now()) + ((a.maxTime ?? 0) * 1000),
                currentPrice: a.startingPrice ?? 0,
                timeRemaining: a.maxTime ?? 0
            }));
            setLocalAuctions(mapped);
            if (setAuctions) setAuctions(mapped);
        } catch (err) {
            console.error('fetchAuctions error:', err);
            setLocalAuctions([]);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch('http://localhost:5102/api/products');
            if (!res.ok) throw new Error('Fout bij ophalen producten');
            const data = await res.json();
            setProducts(data || []);
        } catch (err) {
            console.error('fetchProducts error:', err);
            setProducts([]);
        }
    };

    // interval to update dynamic price/time
    useEffect(() => {
        const interval = setInterval(() => {
            setLocalAuctions(prev => prev.map(auction => {
                const elapsed = Math.floor((Date.now() - (auction.startTime || Date.now())) / 1000);
                const progress = auction.maxTime > 0 ? (elapsed / auction.maxTime) : 0;
                const priceReduction = (auction.startingPrice || 0) * progress;
                const newPrice = Math.max(1, (auction.startingPrice || 0) - priceReduction);
                return {
                    ...auction,
                    currentPrice: elapsed >= (auction.maxTime || 0) ? 1 : newPrice,
                    timeRemaining: Math.max(0, (auction.maxTime || 0) - elapsed)
                };
            }));
        }, 200);

        return () => clearInterval(interval);
    }, []);

    // fetch on mount
    useEffect(() => {
        fetchAuctions();
        fetchProducts();
        const onFocus = () => { fetchAuctions(); fetchProducts(); };
        const onVisibility = () => { if (document.visibilityState === 'visible') { fetchAuctions(); fetchProducts(); } };
        window.addEventListener('focus', onFocus);
        document.addEventListener('visibilitychange', onVisibility);
        const poll = setInterval(() => { fetchAuctions(); fetchProducts(); }, 30000);
        return () => {
            window.removeEventListener('focus', onFocus);
            document.removeEventListener('visibilitychange', onVisibility);
            clearInterval(poll);
        };
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Weet je zeker dat je deze veiling wilt verwijderen?')) return;
        try {
            const res = await fetch(`http://localhost:5102/api/auctions/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Fout bij verwijderen');
            setLocalAuctions(prev => prev.filter(a => a.id !== id));
            if (selectedAuction?.id === id) setSelectedAuction(null);
            if (setAuctions) setAuctions(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            alert('Fout bij verwijderen: ' + err.message);
            console.error(err);
        }
    };

    // Selecteer product voor veiling
    const handleSelectProduct = (product) => {
        setSelectedProduct(product);
        setAuctionFormData({
            maxTime: '',
            startingPrice: product.minimumprijs ? product.minimumprijs.toString() : ''
        });
        setShowAuctionForm(true);
        setError('');
    };

    // Maak veiling aan
    const handleCreateAuction = async (e) => {
        e.preventDefault();
        if (!auctionFormData.maxTime || !auctionFormData.startingPrice) {
            setError('Alle velden zijn verplicht');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://localhost:5102/api/auctions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: selectedProduct.soort,
                    productId: selectedProduct.id,
                    maxTime: parseInt(auctionFormData.maxTime),
                    startingPrice: parseFloat(auctionFormData.startingPrice)
                })
            });

            if (!response.ok) throw new Error('Fout bij het aanmaken van de veiling');

            const newAuction = await response.json();
            setLocalAuctions([...localAuctions, {
                ...newAuction,
                currentPrice: newAuction.startingPrice,
                timeRemaining: newAuction.maxTime,
                startTime: Date.now()
            }]);
            setShowAuctionForm(false);
            setSelectedProduct(null);
            setAuctionFormData({ maxTime: '', startingPrice: '' });
        } catch (err) {
            setError(err.message || 'Er is een fout opgetreden');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    const formatPrice = (price) => {
        if (price == null) return '€ 0.00';
        return `€ ${parseFloat(price).toFixed(2)}`;
    };

    const formatTime = (seconds) => {
        if (!seconds && seconds !== 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="vm-page">
            {/* Navigatiebalk */}
            <nav className="vm-navbar">
                <div className="vm-nav-container">
                    <div className="vm-nav-logo">Flora Veiling</div>
                    <div className="vm-nav-title">Veilingmeester Dashboard</div>
                    <div className="vm-nav-user">
                        <div 
                            className="vm-user-info"
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            <span className="vm-user-icon">👤</span>
                            <span className="vm-username">{user?.gebruikersnaam || 'Veilingmeester'}</span>
                            <span className="vm-dropdown-arrow">▼</span>
                        </div>
                        {showDropdown && (
                            <div className="vm-dropdown-menu">
                                <button onClick={handleLogout} className="vm-dropdown-item">
                                    Uitloggen
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hoofdinhoud */}
            <div className="vm-main-content">
                <div className="vm-welcome-section">
                    <h1>Welkom, {user?.gebruikersnaam || 'Veilingmeester'}!</h1>
                    <p>Selecteer een product om een veiling te starten</p>
                </div>

                <div className="vm-three-column">
                    {/* Producten sectie */}
                    <section className="vm-section">
                        <h2>📦 Beschikbare Producten</h2>
                        <p className="vm-section-desc">Selecteer een product om een veiling te starten</p>
                        <div className="vm-products-list">
                            {products.length === 0 ? (
                                <div className="vm-empty">
                                    <span className="vm-empty-icon">📦</span>
                                    <p>Geen producten beschikbaar</p>
                                </div>
                            ) : (
                                products.map(product => (
                                    <div key={product.id} className="vm-product-card">
                                        {product.afbeelding && (
                                            <div className="vm-product-image">
                                                <img src={product.afbeelding} alt={product.soort} />
                                            </div>
                                        )}
                                        <div className="vm-product-info">
                                            <h3>{product.soort}</h3>
                                            <div className="vm-product-details">
                                                <span>📊 {product.hoeveelheid || '-'} stuks</span>
                                                <span>💰 {formatPrice(product.minimumprijs)}</span>
                                            </div>
                                            <button 
                                                className="vm-select-btn"
                                                onClick={() => handleSelectProduct(product)}
                                            >
                                                🔨 Veiling Starten
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* Veilingen sectie */}
                    <section className="vm-section">
                        <h2>🔨 Actieve Veilingen</h2>
                        <div className="auctions-list">
                            {localAuctions.length === 0 ? (
                                <div className="no-auctions">Geen veilingen gevonden.</div>
                            ) : (
                                localAuctions.map(auction => (
                                    <div 
                                        key={auction.id}
                                        className={`auction-card ${selectedAuction?.id === auction.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedAuction(auction)}
                                    >
                                        <div className="auction-card-header">
                                            <h3>{auction.name}</h3>
                                            <span className="auction-id">#{auction.id}</span>
                                        </div>
                                        <div className="auction-card-price">
                                            {formatPrice(auction.currentPrice)}
                                        </div>
                                        <div className="auction-card-time">
                                            {formatTime(auction.timeRemaining || 0)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* Details sectie */}
                    {selectedAuction && (
                        <section className="vm-section auction-details-section">
                            <h2>Veilingdetails</h2>
                            <div className="details-content">
                                <div className="detail-row">
                                    <span className="detail-label">Veilingnaam:</span>
                                    <span className="detail-value">{selectedAuction.name}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Veiling ID:</span>
                                    <span className="detail-value">#{selectedAuction.id}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Startprijs:</span>
                                    <span className="detail-value">{formatPrice(selectedAuction.startingPrice)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Huidige Prijs:</span>
                                    <span className="detail-value price-highlight">
                                        {formatPrice(selectedAuction.currentPrice)}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Resterende Tijd:</span>
                                    <span className="detail-value time-highlight">
                                        {formatTime(selectedAuction.timeRemaining || 0)}
                                    </span>
                                </div>
                                <div className="price-bar">
                                    <div 
                                        className="price-progress"
                                        style={{
                                            width: `${((selectedAuction.startingPrice - selectedAuction.currentPrice) / selectedAuction.startingPrice) * 100}%`
                                        }}
                                    />
                                </div>
                                <button 
                                    className="vm-delete-btn"
                                    onClick={() => handleDelete(selectedAuction.id)}
                                >
                                    🗑️ Veiling Verwijderen
                                </button>
                            </div>
                        </section>
                    )}
                </div>
            </div>

            {/* Veiling aanmaken modal */}
            {showAuctionForm && selectedProduct && (
                <div className="vm-modal-overlay" onClick={() => setShowAuctionForm(false)}>
                    <div className="vm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="vm-modal-header">
                            <h2>🔨 Veiling Aanmaken</h2>
                            <button className="vm-close-btn" onClick={() => setShowAuctionForm(false)}>×</button>
                        </div>
                        <div className="vm-modal-content">
                            <div className="vm-selected-product-info">
                                <h3>Geselecteerd Product</h3>
                                <div className="vm-product-preview">
                                    {selectedProduct.afbeelding && (
                                        <img src={selectedProduct.afbeelding} alt={selectedProduct.soort} />
                                    )}
                                    <div>
                                        <strong>{selectedProduct.soort}</strong>
                                        <p>Hoeveelheid: {selectedProduct.hoeveelheid || '-'}</p>
                                        <p>Minimumprijs: {formatPrice(selectedProduct.minimumprijs)}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <form onSubmit={handleCreateAuction}>
                                {error && <div className="vm-error">{error}</div>}
                                
                                <div className="vm-form-group">
                                    <label>⏱️ Maximale Tijd (seconden)</label>
                                    <input
                                        type="number"
                                        value={auctionFormData.maxTime}
                                        onChange={(e) => setAuctionFormData({...auctionFormData, maxTime: e.target.value})}
                                        placeholder="Bijv. 120"
                                        min="1"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                
                                <div className="vm-form-group">
                                    <label>💰 Startprijs (€)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={auctionFormData.startingPrice}
                                        onChange={(e) => setAuctionFormData({...auctionFormData, startingPrice: e.target.value})}
                                        placeholder="Bijv. 100.00"
                                        min="0.01"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                
                                <button type="submit" className="vm-submit-btn" disabled={loading}>
                                    {loading ? 'Bezig...' : '🔨 Veiling Starten'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Overview;
