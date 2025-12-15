import { useState, useEffect } from 'react';
import '../styles/VeilingmeesterCreateAuction.css';

function CreateAuction({ auctions, addAuction }) {
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [localAuctions, setLocalAuctions] = useState([]);
    const [products, setProducts] = useState([]);
    const [selected, setSelected] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        endTime: '' // ISO datetime-local string
    });

    // helper to open/close product detail
    const toggleProductExpanded = (id) => {
        setSelected(prev => ({ ...prev, [id]: { ...(prev[id] || {}), expanded: !(prev[id]?.expanded) } }));
    };

    const toggleProductSelected = (id) => {
        setSelected(prev => {
            const exists = prev[id];
            if (exists && exists.selected) {
                // unselect
                const copy = { ...prev };
                delete copy[id];
                return copy;
            } else {
                return { ...prev, [id]: { selected: true, startPrice: products.find(p=>p.id===id)?.startprijs ?? products.find(p=>p.id===id)?.minimumprijs ?? 0, incrementPerSecond: products.find(p=>p.id===id)?.incrementPerSecond ?? 0, expanded: false } };
            }
        });
    };


    // Load veilingen op pagina load en wanneer de pagina weer zichtbaar wordt
    useEffect(() => {
        // initial load
        fetchAuctions();

        // load products for selection
        fetchProducts();

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

    // fetch all products for selection
    const fetchProducts = async () => {
        try {
            const res = await fetch('http://localhost:5102/api/products');
            if (!res.ok) throw new Error('Fout bij ophalen producten');
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error('Error fetching products:', err);
        }
    };

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
        const selectedIds = Object.keys(selected).filter(k => selected[k].selected);
        if (!formData.name || !formData.endTime || selectedIds.length === 0) {
            setError('Vul naam, eindtijd en selecteer minimaal één product');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const endMillis = new Date(formData.endTime).getTime();
            const now = Date.now();
            const maxTime = Math.max(1, Math.round((endMillis - now)/1000));

            // pick a sensible auction-level starting price (min of per-product start prices)
            const selectedItems = selectedIds.map(id => ({ id: parseInt(id), ...selected[id] }));
            const minStart = Math.min(...selectedItems.map(i => parseFloat(i.startPrice || 0)));

            const response = await fetch('http://localhost:5102/api/auctions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: formData.name, maxTime: maxTime, startingPrice: minStart, veilingmeesterId: formData.veilingmeesterId })
            });

            if (!response.ok) throw new Error('Fout bij het aanmaken van de veiling');

            const newAuction = await response.json();

            // update UI immediately and close modal even if parent didn't pass `addAuction`
            if (typeof addAuction === 'function') {
                try { addAuction(newAuction); } catch (err) { console.warn('addAuction failed:', err); }
            }
            setLocalAuctions(prev => [...prev, newAuction]);
            setFormData({ name: '', endTime: '' });
            setSelected({});
            setShowForm(false);

            // assign each selected product to the created auction and set per-product start/increment
            try {
                await Promise.all(selectedItems.map(async (item) => {
                    const r = await fetch(`http://localhost:5102/api/products/${item.id}/assign-veiling`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ veilingId: newAuction.id, startprijs: parseFloat(item.startPrice), incrementPerSecond: parseFloat(item.incrementPerSecond) })
                    });
                    if (!r.ok) {
                        const text = await r.text();
                        throw new Error(`Kon product ${item.id} niet toewijzen: ${text}`);
                    }
                }));
            } catch (assignErr) {
                // products assignment failed; inform user but auction exists and modal is closed
                alert('Een of meerdere producten konden niet worden toegewezen: ' + (assignErr.message || assignErr));
                console.error('Error assigning products:', assignErr);
            }
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
                                <label>Eindtijd</label>
                                <input
                                    type="datetime-local"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label>Veilingmeester ID</label>
                                <input
                                    type="text"
                                    value={formData.veilingmeesterId || ''}
                                    onChange={(e) => setFormData({...formData, veilingmeesterId: e.target.value})}
                                    placeholder="bijv. vm1"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>Kies Producten</label>
                                <div className="products-list">
                                    {products.length === 0 ? (
                                        <div>Geen producten gevonden.</div>
                                    ) : (
                                        products.map(p => (
                                            <div key={p.id} className={`product-row ${selected[p.id]?.selected ? 'selected' : ''}`}>
                                                <div className="product-row-main">
                                                    <input type="checkbox" checked={!!selected[p.id]?.selected} onChange={() => toggleProductSelected(p.id)} disabled={loading} />
                                                    <button type="button" className="product-name" onClick={() => toggleProductExpanded(p.id)}>{p.soort} <span className="small">#{p.id}</span></button>
                                                </div>
                                                {selected[p.id]?.selected && (
                                                    <div className="product-settings">
                                                        <label>Startprijs (€)</label>
                                                        <input type="number" step="0.01" value={selected[p.id]?.startPrice} onChange={(e) => setSelected(prev => ({ ...prev, [p.id]: { ...prev[p.id], startPrice: e.target.value } }))} disabled={loading} />
                                                        <label>Increment per seconde (€/s)</label>
                                                        <input type="number" step="0.0001" value={selected[p.id]?.incrementPerSecond} onChange={(e) => setSelected(prev => ({ ...prev, [p.id]: { ...prev[p.id], incrementPerSecond: e.target.value } }))} disabled={loading} />
                                                    </div>
                                                )}
                                                {selected[p.id]?.expanded && (
                                                    <div className="product-detail">
                                                        <div><strong>Artikel ID:</strong> {p.id}</div>
                                                        <div><strong>Aanvoerder:</strong> {p.gebruiker_id}</div>
                                                        <div><strong>Soort:</strong> {p.soort}</div>
                                                        <div><strong>Potmaat:</strong> {p.potmaat ?? '-'}</div>
                                                        <div><strong>Steellengte:</strong> {p.steellengte ?? '-'}</div>
                                                        <div><strong>Hoeveelheid:</strong> {p.hoeveelheid ?? '-'}</div>
                                                        <div><strong>Minimumprijs:</strong> {p.minimumprijs ? `€ ${parseFloat(p.minimumprijs).toFixed(2)}` : '-'}</div>
                                                        <div><strong>Kloklocatie:</strong> {p.kloklokatie}</div>
                                                        {p.afbeelding && <div style={{marginTop:8}}><img src={p.afbeelding} alt="product" style={{maxWidth: '100%', maxHeight:150, borderRadius:8}}/></div>}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
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