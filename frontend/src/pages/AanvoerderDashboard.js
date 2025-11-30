import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AanvoerderDashboard.css';

function AanvoerderDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [products, setProducts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    
    const [formData, setFormData] = useState({
        soort: '',
        potmaat: '',
        steellengte: '',
        hoeveelheid: '',
        minimumprijs: '',
        kloklokatie: 'Aalsmeer',
        afbeelding: null
    });

    useEffect(() => {
        // Haal gebruikersgegevens op uit localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            if (parsedUser.accountType !== 'aanvoerder') {
                navigate('/');
                return;
            }
            setUser(parsedUser);
        } else {
            navigate('/login');
            return;
        }
        
        fetchProducts();
    }, [navigate]);

    // Haal producten op van de API
    const fetchProducts = async () => {
        try {
            const response = await fetch('http://localhost:5102/api/products');
            if (!response.ok) throw new Error('Fout bij het ophalen van producten');
            const data = await response.json();
            setProducts(data);
        } catch (err) {
            console.error('Error fetching products:', err);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setFormData({ ...formData, afbeelding: reader.result });
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.soort) {
            setError('Vul minimaal het soort in.');
            return;
        }
        if (!formData.afbeelding) {
            setError('Upload een afbeelding.');
            return;
        }
        if (formData.minimumprijs && parseFloat(formData.minimumprijs) < 0) {
            setError('Minimumprijs mag niet negatief zijn.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const payload = {
                soort: formData.soort,
                potmaat: formData.potmaat ? parseInt(formData.potmaat) : null,
                steellengte: formData.steellengte ? parseFloat(formData.steellengte) : null,
                hoeveelheid: formData.hoeveelheid ? parseInt(formData.hoeveelheid) : null,
                minimumprijs: formData.minimumprijs ? parseFloat(formData.minimumprijs) : null,
                kloklokatie: formData.kloklokatie,
                afbeelding: formData.afbeelding,
                aanvoerderId: user?.roleId || 1
            };

            const response = await fetch('http://localhost:5102/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const responseText = await response.text();
                let errorMsg = `HTTP ${response.status}: ${responseText}`;
                try {
                    const errorData = JSON.parse(responseText);
                    errorMsg = errorData.message || errorData.title || errorMsg;
                } catch (e) {}
                throw new Error(errorMsg);
            }
            
            const newProduct = await response.json();
            setProducts([...products, newProduct]);
            setFormData({
                soort: '',
                potmaat: '',
                steellengte: '',
                hoeveelheid: '',
                minimumprijs: '',
                kloklokatie: 'Aalsmeer',
                afbeelding: null
            });
            setShowForm(false);
        } catch (err) {
            setError(err.message || 'Er is een fout opgetreden');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Weet je zeker dat je dit product wilt verwijderen?')) return;

        try {
            const response = await fetch(`http://localhost:5102/api/products/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Fout bij het verwijderen van product');
            setProducts(products.filter(p => p.id !== id));
        } catch (err) {
            alert('Fout bij verwijderen: ' + err.message);
        }
    };

    const openDetail = (product) => {
        setSelectedProduct(product);
        setShowDetail(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    const formatPrice = (price) => {
        if (price == null) return '€ 0.00';
        return `€ ${parseFloat(price).toFixed(2)}`;
    };

    return (
        <div className="av-dashboard">
            {/* Navigatiebalk */}
            <nav className="av-navbar">
                <div className="av-nav-container">
                    <div className="av-nav-logo">Flora Veiling</div>
                    <div className="av-nav-title">Aanvoerder Dashboard</div>
                    <div className="av-nav-user">
                        <div 
                            className="av-user-info"
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            <span className="av-user-icon">👤</span>
                            <span className="av-username">{user?.gebruikersnaam || 'Aanvoerder'}</span>
                            <span className="av-dropdown-arrow">▼</span>
                        </div>
                        {showDropdown && (
                            <div className="av-dropdown-menu">
                                <button onClick={handleLogout} className="av-dropdown-item">
                                    Uitloggen
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hoofdinhoud */}
            <div className="av-content">
                <div className="av-welcome">
                    <h1>Welkom, {user?.gebruikersnaam || 'Aanvoerder'}!</h1>
                    <p>Beheer uw producten en voeg nieuwe toe</p>
                </div>

                {/* Header met knop */}
                <div className="av-header">
                    <h2>📦 Mijn Producten</h2>
                    <button className="av-add-btn" onClick={() => setShowForm(true)}>
                        <span className="av-plus-icon">+</span>
                        Nieuw Product
                    </button>
                </div>

                {/* Producten grid */}
                <div className="av-products-grid">
                    {products.length === 0 ? (
                        <div className="av-empty">
                            <span className="av-empty-icon">📦</span>
                            <p>Nog geen producten toegevoegd</p>
                            <small>Klik op "Nieuw Product" om te beginnen</small>
                        </div>
                    ) : (
                        products.map(product => (
                            <div key={product.id} className="av-product-card" onClick={() => openDetail(product)}>
                                <div className="av-product-image">
                                    {product.afbeelding ? (
                                        <img src={product.afbeelding} alt={product.soort} />
                                    ) : (
                                        <div className="av-no-image">📷</div>
                                    )}
                                </div>
                                <div className="av-product-info">
                                    <div className="av-product-header">
                                        <h3>{product.soort}</h3>
                                        <span className="av-product-id">#{product.id}</span>
                                    </div>
                                    <div className="av-product-details">
                                        <span>💰 {formatPrice(product.minimumprijs)}</span>
                                        <span>📍 {product.kloklokatie}</span>
                                    </div>
                                    <div className="av-product-meta">
                                        <span>📊 {product.hoeveelheid || '-'} stuks</span>
                                    </div>
                                </div>
                                <button 
                                    className="av-delete-btn"
                                    onClick={(e) => { e.stopPropagation(); handleDelete(product.id); }}
                                >
                                    🗑️
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Nieuw product form modal */}
            {showForm && (
                <div className="av-modal-overlay" onClick={() => setShowForm(false)}>
                    <div className="av-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="av-modal-header">
                            <h2>📦 Nieuw Product Toevoegen</h2>
                            <button className="av-close-btn" onClick={() => setShowForm(false)}>×</button>
                        </div>
                        <div className="av-modal-content">
                            <form onSubmit={handleSubmit}>
                                {error && <div className="av-error">{error}</div>}
                                
                                <div className="av-form-grid">
                                    <div className="av-form-group">
                                        <label>🌷 Soort *</label>
                                        <input
                                            type="text"
                                            value={formData.soort}
                                            onChange={(e) => setFormData({...formData, soort: e.target.value})}
                                            placeholder="Bijv. Rode Rozen"
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="av-form-group">
                                        <label>🪴 Potmaat</label>
                                        <input
                                            type="number"
                                            value={formData.potmaat}
                                            onChange={(e) => setFormData({...formData, potmaat: e.target.value})}
                                            placeholder="Bijv. 10"
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="av-form-group">
                                        <label>📏 Steellengte (cm)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={formData.steellengte}
                                            onChange={(e) => setFormData({...formData, steellengte: e.target.value})}
                                            placeholder="Bijv. 50.5"
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="av-form-group">
                                        <label>📊 Hoeveelheid</label>
                                        <input
                                            type="number"
                                            value={formData.hoeveelheid}
                                            onChange={(e) => setFormData({...formData, hoeveelheid: e.target.value})}
                                            placeholder="Bijv. 100"
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="av-form-group">
                                        <label>💰 Minimumprijs (€)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.minimumprijs}
                                            onChange={(e) => setFormData({...formData, minimumprijs: e.target.value})}
                                            placeholder="Bijv. 25.00"
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="av-form-group">
                                        <label>📍 Kloklocatie</label>
                                        <select
                                            value={formData.kloklokatie}
                                            onChange={(e) => setFormData({...formData, kloklokatie: e.target.value})}
                                            disabled={loading}
                                        >
                                            <option>Aalsmeer</option>
                                            <option>Naaldwijk</option>
                                            <option>Rijnsburg</option>
                                            <option>Eelde</option>
                                            <option>Rhein-Maas</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="av-form-group av-full-width">
                                    <label>📷 Afbeelding *</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        disabled={loading}
                                        className="av-file-input"
                                    />
                                    {formData.afbeelding && (
                                        <div className="av-image-preview">
                                            <img src={formData.afbeelding} alt="preview" />
                                        </div>
                                    )}
                                </div>

                                <button type="submit" className="av-submit-btn" disabled={loading}>
                                    {loading ? 'Bezig met opslaan...' : '📦 Product Toevoegen'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Product detail modal */}
            {showDetail && selectedProduct && (
                <div className="av-modal-overlay" onClick={() => setShowDetail(false)}>
                    <div className="av-modal av-detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="av-modal-header">
                            <h2>{selectedProduct.soort} <span className="av-product-id">#{selectedProduct.id}</span></h2>
                            <button className="av-close-btn" onClick={() => setShowDetail(false)}>×</button>
                        </div>
                        <div className="av-modal-content">
                            {selectedProduct.afbeelding && (
                                <div className="av-detail-image">
                                    <img src={selectedProduct.afbeelding} alt={selectedProduct.soort} />
                                </div>
                            )}
                            <div className="av-detail-info">
                                <div className="av-detail-row">
                                    <span className="av-detail-label">🌷 Soort:</span>
                                    <span className="av-detail-value">{selectedProduct.soort}</span>
                                </div>
                                <div className="av-detail-row">
                                    <span className="av-detail-label">🪴 Potmaat:</span>
                                    <span className="av-detail-value">{selectedProduct.potmaat || '-'}</span>
                                </div>
                                <div className="av-detail-row">
                                    <span className="av-detail-label">📏 Steellengte:</span>
                                    <span className="av-detail-value">{selectedProduct.steellengte ? `${selectedProduct.steellengte} cm` : '-'}</span>
                                </div>
                                <div className="av-detail-row">
                                    <span className="av-detail-label">📊 Hoeveelheid:</span>
                                    <span className="av-detail-value">{selectedProduct.hoeveelheid || '-'}</span>
                                </div>
                                <div className="av-detail-row">
                                    <span className="av-detail-label">💰 Minimumprijs:</span>
                                    <span className="av-detail-value">{formatPrice(selectedProduct.minimumprijs)}</span>
                                </div>
                                <div className="av-detail-row">
                                    <span className="av-detail-label">📍 Kloklocatie:</span>
                                    <span className="av-detail-value">{selectedProduct.kloklokatie}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AanvoerderDashboard;

