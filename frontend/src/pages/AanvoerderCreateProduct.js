import { useState, useEffect } from 'react';
import '../styles/AanvoerderCreateProduct.css';

/**
 * AanvoerderCreateProduct
 * Beheert het aanmaken, tonen en verwijderen van producten door de aanvoerder.
 * - Laadt bestaande producten bij initiële render
 * - Biedt formulier met basisvalidatie (soort/minimumprijs)
 * - Uploadt optionele afbeelding (base64 DataURL)
 * - Gebruikt Bearer-token uit localStorage voor API-calls
 * - Toont detailmodal en ondersteunt ESC/Enter toegankelijkheid
 */

function AanvoerderCreateProduct() {
    const [showForm, setShowForm] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [localProducts, setLocalProducts] = useState([]);
    const [formData, setFormData] = useState({
        soort: '',
        potmaat: '',
        steellengte: '',
        hoeveelheid: '',
        minimumprijs: '',
        kloklokatie: 'Aalsmeer',
        afbeelding: null,
        gebruikerId: ''
    });

    useEffect(() => {
        // Initieel producten ophalen bij mount.
        fetchProducts();
    }, []);

    useEffect(() => {
    // Globale ESC-sneltoets: sluit detailmodal of formulier indien open.
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            if (showDetail) closeDetail();
            if (showForm) setShowForm(false);
        }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
}, [showForm, showDetail]);


    /**
     * Haal alle producten op voor de aanvoerder.
     * Vereist geldig Bearer-token in localStorage onder 'accessToken'.
     */
    const fetchProducts = async () => {
        try {
            const response = await fetch('http://localhost:5102/api/products', {headers: {Authorization: `Bearer ${localStorage.getItem('accessToken')}`}});
            if (!response.ok) throw new Error('Fout bij het ophalen van producten');
            const data = await response.json();
            setLocalProducts(data);
        } catch (err) {
            console.error('Error fetching products:', err);
        }
    };

    /**
     * Verwijder product met bevestiging.
     * Bij succes: update lokale lijst zonder nieuwe fetch.
     */
    const handleDelete = async (id) => {
        if (!window.confirm('Weet je zeker dat je dit product wilt verwijderen?')) return;

        try {
            const response = await fetch(`http://localhost:5102/api/products/${id}`, {
                method: 'DELETE',
                headers: {Authorization: `Bearer ${localStorage.getItem('accessToken')}`}
            });
            if (!response.ok) throw new Error('Fout bij het verwijderen van product');
            setLocalProducts(localProducts.filter(p => p.id !== id));
        } catch (err) {
            alert('Fout bij verwijderen: ' + err.message);
            console.error('Error deleting product:', err);
        }
    };

    // Detailmodal open/sluit helpers.
    const openDetail = (product) => {
        setSelectedProduct(product);
        setShowDetail(true);
    };

    const closeDetail = () => {
        setSelectedProduct(null);
        setShowDetail(false);
    };

    /**
     * Bestand-upload handler: converteer afbeelding naar base64 DataURL
     * en sla op in formulierstate voor directe preview en POST.
     */
    const handleFileChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            setFormData({ ...formData, afbeelding: reader.result });
        };
        reader.readAsDataURL(file);
    };

    /**
     * Verstuur nieuw product naar backend.
     * - Basisvalidatie client-side (verplicht soort, minprijs >= 0)
     * - Normaliseert numerieke velden naar getal of null
     * - Stuurt Bearer-token mee in headers
     * - Foutafhandeling: toont backend-bericht indien beschikbaar
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.soort) {
            setError('Vul minimaal `soort` en `gebruikerId` in.');
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
                gebruikerId: formData.gebruikerId
            };

            const response = await fetch('http://localhost:5102/api/products', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const responseText = await response.text();
                console.log('Response status:', response.status);
                console.log('Response text:', responseText);
                let errorMsg = `HTTP ${response.status}: ${responseText}`;
                try {
                    const errorData = JSON.parse(responseText);
                    errorMsg = errorData.message || errorData.title || errorMsg;
                } catch (e) {
                }
                throw new Error(errorMsg);
            }
            const newProduct = await response.json();
            setLocalProducts([...localProducts, newProduct]);
            setFormData({
                soort: '',
                potmaat: '',
                steellengte: '',
                hoeveelheid: '',
                minimumprijs: '',
                kloklokatie: 'Aalsmeer',
                afbeelding: null,
                gebruikerId: formData.gebruikerId
            });
            setShowForm(false);
        } catch (err) {
            const errorMsg = err.message || 'Er is een fout opgetreden';
            setError(errorMsg);
            console.error('Full error:', err);
            console.error('Error message:', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-container">
            <div className="create-header">
                <h1>Producten</h1>
                <button className="add-button" onClick={() => setShowForm(!showForm)}>
                    <span className="plus-icon">+</span>
                    Nieuw Product
                </button>
            </div>

            {showForm && (
                /* Formulier-overlay en modal voor aanmaken nieuw product */
                <div className="form-overlay">
                    <div className="form-modal">
                        <div className="form-header">
                            <h2>Nieuw Product Aanmaken</h2>
                            <button className="close-button" onClick={() => setShowForm(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            {error && <div className="error-message">{error}</div>}

                            <div className="form-grid">
                                {/* Basis productvelden: soort/potmaat/steellengte/hoeveelheid/minimumprijs */}
                                <div className="form-group">
                                    <label>Soort</label>
                                    <input autoFocus onFocus={(e) => e.target.select()} placeholder="bijv. Roos" type="text" value={formData.soort} onChange={(e) => setFormData({...formData, soort: e.target.value})} required disabled={loading} />
                                </div>

                                <div className="form-group">
                                    <label>Potmaat (Ø cm)</label>
                                    <input placeholder="bijv. 10" type="number" value={formData.potmaat} onChange={(e) => setFormData({...formData, potmaat: e.target.value})} disabled={loading} />
                                </div>

                                <div className="form-group">
                                    <label>Steellengte (cm)</label>
                                    <input placeholder="bijv. 30.5" type="number" step="0.01" value={formData.steellengte} onChange={(e) => setFormData({...formData, steellengte: e.target.value})} disabled={loading} />
                                </div>

                                <div className="form-group">
                                    <label>Hoeveelheid (stuks)</label>
                                    <input placeholder="bijv. 50" type="number" value={formData.hoeveelheid} onChange={(e) => setFormData({...formData, hoeveelheid: e.target.value})} disabled={loading} />
                                </div>

                                <div className="form-group">
                                    <label>Minimumprijs (€)</label>
                                    <input placeholder="bijv. 12.50" type="number" step="0.01" value={formData.minimumprijs} onChange={(e) => setFormData({...formData, minimumprijs: e.target.value})} disabled={loading} />
                                </div>

                                <div className="form-group">
                                    <label>Kloklocatie</label>
                                    <select value={formData.kloklokatie} onChange={(e) => setFormData({...formData, kloklokatie: e.target.value})} disabled={loading}>
                                        <option>Aalsmeer</option>
                                        <option>Naaldwijk</option>
                                        <option>Rijnsburg</option>
                                        <option>Eelde</option>
                                        <option>Rhein-Maas</option>
                                    </select>
                                </div>

                                <div className="form-group full-width">
                                    <label>Afbeelding (upload)</label>
                                    <input type="file" accept="image/*" onChange={handleFileChange} disabled={loading} />
                                    {formData.afbeelding && <div style={{marginTop: '0.75rem'}}><img src={formData.afbeelding} alt="preview" style={{maxWidth: '100%', maxHeight: 200, borderRadius: 8}}/></div>}
                                </div>

                                <div className="form-group full-width">
                                    <button type="submit" className="submit-button" disabled={loading}>{loading ? 'Bezig met opslaan...' : 'Bevestigen'}</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="auctions-list-create">
                <h2>Huidige Producten</h2>
                <div className="auctions-grid-create">
                    {/* Overzicht van bestaande producten met delete-actie en detail-openen */}
                    {localProducts.length === 0 ? (
                        <div className="no-auctions">Geen producten gevonden.</div>
                    ) : (
                        localProducts.map((product) => (
                            <div key={product.id} className="auction-item" tabIndex="0" onClick={() => openDetail(product)} onKeyDown={(e) => { if (e.key === 'Enter') openDetail(product); }}>
                                <div className="auction-item-header">
                                    <h3>{product.soort} (x{product.hoeveelheid})</h3>
                                    <div className="auction-item-actions">
                                        <span className="auction-badge">#{product.id}</span>
                                        <button className="delete-button" onClick={(e) => { e.stopPropagation(); handleDelete(product.id); }} title="Verwijder product">🗑️</button>
                                    </div>
                                </div>
                                <div className="auction-item-details">
                                    <div className="detail-small"><span>Minimumprijs:</span><strong>{product.minimumprijs ? `€ ${parseFloat(product.minimumprijs).toFixed(2)}` : '€ 0.00'}</strong></div>
                                    <div className="detail-small"><span>Kloklocatie:</span><strong>{product.kloklokatie}</strong></div>
                                    {product.afbeelding && <div style={{marginTop:8}}><img src={product.afbeelding} alt="product" style={{maxWidth: '100%', maxHeight:150, borderRadius:8}}/></div>}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {showDetail && selectedProduct && (
                /* Detailmodal voor snelle inspectie van productvelden */
                <div className="detail-modal-overlay" onClick={closeDetail}>
                    <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="detail-modal-header">
                            <h3>{selectedProduct.soort} <span className="auction-badge">#{selectedProduct.id}</span></h3>
                            <button className="close-button" onClick={closeDetail}>×</button>
                        </div>
                        <div className="detail-modal-body">
                            {selectedProduct.afbeelding && (
                                <div className="detail-image">
                                    <img src={selectedProduct.afbeelding} alt="product" />
                                </div>
                            )}
                            <div className="detail-fields">
                                <div className="detail-row"><strong>Soort:</strong> <span>{selectedProduct.soort}</span></div>
                                <div className="detail-row"><strong>Potmaat:</strong> <span>{selectedProduct.potmaat ?? '-'}</span></div>
                                <div className="detail-row"><strong>Steellengte:</strong> <span>{selectedProduct.steellengte ?? '-'}</span></div>
                                <div className="detail-row"><strong>Hoeveelheid:</strong> <span>{selectedProduct.hoeveelheid ?? '-'}</span></div>
                                <div className="detail-row"><strong>Minimumprijs:</strong> <span>{selectedProduct.minimumprijs ? `€ ${parseFloat(selectedProduct.minimumprijs).toFixed(2)}` : '-'}</span></div>
                                <div className="detail-row"><strong>Kloklocatie:</strong> <span>{selectedProduct.kloklokatie}</span></div>
                                <div className="detail-row"><strong>Aanvoerder ID:</strong> <span>{selectedProduct.gebruiker_id ?? selectedProduct.gebruikerId ?? '-'}</span></div>
                                <div className="detail-row"><strong>Artikel ID:</strong> <span>{selectedProduct.id}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AanvoerderCreateProduct;
