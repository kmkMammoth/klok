import { useState, useEffect } from 'react';
import '../styles/VeilingmeesterCreateAuction.css';

/**
 * CreateAuction (VeilingmeesterCreateAuction)
 *
 * Veilingmeesterscherm voor beheer en creatie van veilingen.
 * Functies en verantwoordelijkheden:
 * - Toont een lijst van bestaande veilingen met status (IDLE, LIVE, GEEÏNDIGD).
 * - Biedt formulier om nieuwe veiling aan te maken met naam, eindtijd, en product-selectie.
 * - Haalt beschikbare producten op en filtert op basis van toewijzing en voorraad.
 * - Ondersteunt product-selectie met rol-specifieke prijsinstellingen (startprijs, increment/s).
 * - Toont product-details in modal (soort, potmaat, steellengte, hoeveelheid, etc.).
 * - Ondersteunt start-actie (status wijzigen van Idle naar Ongoing).
 * - Ondersteunt verwijderings-actie met bevestiging.
 * - Poll veilingen en producten bij focus/visibility-wijziging (altijd actueel).
 * - Postverwerkingsstap: voegt geselecteerde producten toe aan de net-gemaakte veiling.
 */
function CreateAuction({ auctions, addAuction }) {
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    // UI-state
    const [localAuctions, setLocalAuctions] = useState([]);
    const [products, setProducts] = useState([]);
    // Product-selectie mapping: { [productId]: { selected, startPrice, incrementPerSecond } }
    const [selected, setSelected] = useState({});
    // Modal state voor product-details
    const [productModal, setProductModal] = useState(null);
    const [productLoading, setProductLoading] = useState(false);
    // Filtertoggle: toon producten die al zijn toegewezen of geen voorraad hebben
    const [showUnavailable, setShowUnavailable] = useState(true);

    const openProductModal = async (id, initialProduct = null) => {
        try {
            // Als productgegevens al lokaal beschikbaar zijn, toon ze onmiddellijk
            if (initialProduct) setProductModal(initialProduct);
            setProductLoading(true);
            // Haal volledige productgegevens op vanuit API
            const res = await fetch(`http://localhost:5102/api/products/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } });
            if (!res.ok) {
                const text = await res.text();
                if (!initialProduct) throw new Error(text || 'Fout bij ophalen productinformatie');
                console.warn('Could not refresh product details, keeping local data:', text);
                return;
            }
            const data = await res.json();
            setProductModal(data);
        } catch (err) {
            console.error('Error fetching product details:', err);
            if (!initialProduct) alert('Kon productinformatie niet ophalen: ' + (err.message || err));
        } finally {
            setProductLoading(false);
        }
    };

    const [formData, setFormData] = useState({
        name: '',
        endTime: ''
    });

    /** Schakel product-selectie aan/uit en initialiseer prijsinstellingen */
    const toggleProductSelected = (id) => {
        setSelected(prev => {
            const exists = prev[id];
            if (exists && exists.selected) {
                const copy = { ...prev };
                delete copy[id];
                return copy;
            } else {
                return { ...prev, [id]: { selected: true, startPrice: products.find(p=>p.id===id)?.startprijs ?? products.find(p=>p.id===id)?.minimumprijs ?? 0, incrementPerSecond: products.find(p=>p.id===id)?.incrementPerSecond ?? 0, expanded: false } };
            }
        });
    };

    useEffect(() => {
        // Initiële fetch: haal veilingen en producten op
        fetchAuctions();

        fetchProducts();

        // Re-fetch veilingen bij terugkeer naar window (focus)
        const onFocus = () => fetchAuctions();
        // Re-fetch veilingen bij terugkeer naar tab/window (visibilitychange)
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

    useEffect(() => {
        // Keybinding: Esc sluit product-detail modal
        if (!productModal && !productLoading) return;
        const onKeyDown = (e) => {
            const isEscape = e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27;
            if (isEscape) {
                e.preventDefault();
                e.stopPropagation();
                setProductModal(null);
                setProductLoading(false);
            }
        };
        document.addEventListener('keydown', onKeyDown, true);
        if (!productLoading) {
            const el = document.getElementById('product-modal-title');
            if (el && typeof el.focus === 'function') {
                el.focus();
            }
        }
        return () => document.removeEventListener('keydown', onKeyDown, true);
    }, [productModal, productLoading]);

    // Keybinding: Esc sluit formulier-modal (bij open)
    useEffect(() => {
        if (!showForm) return;
        const handleKeyDown = (e) => {
            const isEscape = e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27;
            if (isEscape) {
                e.preventDefault();
                e.stopPropagation();
                // Sluit eerst eventueel geopende product-modal, anders sluit formulier
                if (productModal) {
                    setProductModal(null);
                    return;
                }
                setShowForm(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown, true);
        const el = document.getElementById('create-form-title');
        if (el && typeof el.focus === 'function') el.focus();

        return () => {
            document.removeEventListener('keydown', handleKeyDown, true);
        };
    }, [showForm, productModal]);

    /** Haal alle beschikbare producten op */
    const fetchProducts = async () => {
        try {
            const res = await fetch('http://localhost:5102/api/products',
                {headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }}
            );
            if (!res.ok) throw new Error('Fout bij ophalen producten');
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error('Error fetching products:', err);
        }
    };

    /** Haal alle veilingen op (niet alleen de geïnitialeerde) */
    const fetchAuctions = async () => {
        try {
            const response = await fetch('http://localhost:5102/api/auctions',
                {headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}`}}
            );
            if (!response.ok) {
                throw new Error('Fout bij het ophalen van veilingen');
            }
            const data = await response.json();
            setLocalAuctions(data);
        } catch (err) {
            console.error('Error fetching auctions:', err);
        }
    };

    /** Verwijder veiling met bevestiging en ververs lijsten */
    const handleDelete = async (id) => {
        if (!window.confirm('Weet je zeker dat je deze veiling wilt verwijderen?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5102/api/auctions/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
            });

            if (!response.ok) {
                throw new Error('Fout bij het verwijderen van de veiling');
            }

            setLocalAuctions(localAuctions.filter(a => a.id !== id));

            await fetchProducts();
        } catch (err) {
            alert('Fout bij het verwijderen: ' + err.message);
            console.error('Error deleting auction:', err);
        }
    };

    /** Start veiling: wijzig status naar "Ongoing" en ververs lijsten */
    const handleStart = async (id) => {
        if (!window.confirm('Wil je deze veiling starten?')) return;

        try {
            const response = await fetch(`http://localhost:5102/api/auctions/${id}?status=Ongoing`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Kon veiling niet starten');
            }

            // Ververs lijst en producten om nieuwe status en tijden te tonen
            await fetchAuctions();
            await fetchProducts();
        } catch (err) {
            alert('Kon veiling niet starten: ' + (err.message || err));
            console.error('Error starting auction:', err);
        }
    };

    /**
     * Creatie-handler: valideer, bouw veiling-payload, POST naar API,
     * voeg geselecteerde producten toe aan veiling via PUT /api/products/{id}.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        const selectedIds = Object.keys(selected).filter(k => selected[k].selected);
        if (!formData.name || !formData.endTime || selectedIds.length === 0) {
            setError('Vul naam en eindtijd in en selecteer minimaal één product');
            return;
        }
        setLoading(true);
        setError('');

        try {
            const endMillis = new Date(formData.endTime).getTime();
            const now = Date.now();
            const maxTime = Math.max(1, Math.round((endMillis - now)/1000));

            const selectedItems = selectedIds.map(id => ({ id: parseInt(id), ...selected[id] }));
            const minStart = Math.min(...selectedItems.map(i => parseFloat(i.startPrice || 0)));

            const response = await fetch('http://localhost:5102/api/auctions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    maxTime: maxTime,
                    startingPrice: minStart,
                    veilingmeesterId: formData.veilingmeesterId
                })
            });

            if (!response.ok) throw new Error('Fout bij het aanmaken van de veiling');

            const newAuction = await response.json();

            if (typeof addAuction === 'function') {
                try { addAuction(newAuction); } catch (err) { console.warn('addAuction failed:', err); }
            }
            setLocalAuctions(prev => [...prev, newAuction]);
            setFormData({ name: '', endTime: '' });
            setSelected({});
            setShowForm(false);

            try {
                await Promise.all(selectedItems.map(async (item) => {
                    const r = await fetch(`http://localhost:5102/api/products/${item.id}/assign-veiling`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
                        body: JSON.stringify({ veilingId: newAuction.id, startprijs: parseFloat(item.startPrice), incrementPerSecond: parseFloat(item.incrementPerSecond) })
                    });
                    if (!r.ok) {
                        const text = await r.text();
                        throw new Error(`Kon product ${item.id} niet toewijzen: ${text}`);
                    }
                }));

                await fetchProducts();
            } catch (assignErr) {
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

    /** Helper: format bedrag als euro-waarde in NL-locale */
    const formatPrice = (price) => {
        if (!price && price !== 0) return '€ 0.00';
        return `€ ${parseFloat(price).toFixed(2)}`;
    };

    /** Helper: bepaal veilingId van product (flexibel voor verschillende veld-namen) */
    const getProductAuctionId = (p) => p.veilingId ?? p.veiling_id ?? (p.veiling && p.veiling.id) ?? null;

    // UI-state voor uitvouwbare veilingen
    const [expandedAuctions, setExpandedAuctions] = useState({});

    /** Toggle veilinguitvouwing voor product-details weergave */
    const toggleAuction = (id) => {
        setExpandedAuctions(prev => {
            const next = { ...prev, [id]: !prev[id] };
            if (!prev[id]) fetchProducts();
            return next;
        });
    };

    /** Helper: filter producten die aan een specifieke veiling zijn toegewezen */
    const getProductsForAuction = (auctionId) => products.filter(p => getProductAuctionId(p) === auctionId);

    /** Helper: filter producten die nog niet zijn toegewezen aan een veiling */
    const availableProducts = products.filter(p => getProductAuctionId(p) === null);

    return (
        <div className="create-container">
            {/* Header: titel en knop voor nieuwe veiling */}
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

            {/* Formulier-overlay: creatie van nieuwe veiling */}
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
                            {/* Algemene foutmelding */}
                            {error && <div className="error-message">{error}</div>}
                            
                            {/* Veilingnaam veld */}
                            <div className="form-group">
                                <label>Veilingnaam</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    autoFocus onFocus={(e) => e.target.select()}
                                    placeholder="Bijv. Rode Rozen Boeket"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            
                            {/* Eindtijd veld */}
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

                            {/* Product-selectie met filter-toggle */}
                            <div className="form-group full-width">
                                <div className="product-header-with-toggle">
                                    <label>Kies Producten</label>
                                    <div className="toggle-container">
                                        <label className="toggle-label">
                                            <span>Toon niet-beschikbare producten</span>
                                            <div className="toggle-wrapper">
                                                <input
                                                    type="checkbox"
                                                    checked={showUnavailable}
                                                    onChange={(e) => setShowUnavailable(e.target.checked)}
                                                    className="toggle-checkbox"
                                                />
                                                <span className="toggle-switch"></span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                <div className="product-selection">
                                    {products.length === 0 ? (
                                        <div className="empty-products">Geen producten gevonden.</div>
                                    ) : (
                                        <>
                                            {availableProducts.length === 0 && (
                                                <div className="empty-products">Geen beschikbare producten: alle producten zijn al toegewezen aan een veiling.</div>
                                            )}

                                            <div className="product-grid">
                                                {products
                                                    .filter(p => {
                                                        if (showUnavailable) return true;
                                                        const assignedId = getProductAuctionId(p);
                                                        const isAssigned = assignedId !== null && assignedId !== undefined;
                                                        const hasZeroQuantity = !p.hoeveelheid || p.hoeveelheid === 0;
                                                        return !isAssigned && !hasZeroQuantity;
                                                    })
                                                    .sort((a, b) => {
                                                        const aAssignedId = getProductAuctionId(a);
                                                        const aIsAssigned = aAssignedId !== null && aAssignedId !== undefined;
                                                        const aHasZeroQuantity = !a.hoeveelheid || a.hoeveelheid === 0;
                                                        const aIsDisabled = aIsAssigned || aHasZeroQuantity;

                                                        const bAssignedId = getProductAuctionId(b);
                                                        const bIsAssigned = bAssignedId !== null && bAssignedId !== undefined;
                                                        const bHasZeroQuantity = !b.hoeveelheid || b.hoeveelheid === 0;
                                                        const bIsDisabled = bIsAssigned || bHasZeroQuantity;

                                                        // Available (not disabled) products first
                                                        if (!aIsDisabled && bIsDisabled) return -1;
                                                        if (aIsDisabled && !bIsDisabled) return 1;
                                                        return 0;
                                                    })
                                                    .map(p => {
                                                    const assignedId = getProductAuctionId(p);
                                                    const isAssigned = assignedId !== null && assignedId !== undefined;
                                                    const hasZeroQuantity = !p.hoeveelheid || p.hoeveelheid === 0;
                                                    const isDisabled = isAssigned || hasZeroQuantity;
                                                    return (
                                                        <div
                                                            key={p.id}
                                                            className={`product-card ${selected[p.id]?.selected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                                                            role="button"
                                                            tabIndex={0}
                                                            aria-pressed={!!selected[p.id]?.selected}
                                                            aria-disabled={isDisabled}
                                                            onClick={() => { if (isDisabled) return; toggleProductSelected(p.id); }}
                                                            onKeyDown={(e) => {
                                                                if (isDisabled) {
                                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                                        e.preventDefault();
                                                                        openProductModal(p.id, p);
                                                                    }
                                                                    return;
                                                                }
                                                                if (e.key === 'Enter') { e.preventDefault(); toggleProductSelected(p.id); }
                                                            }}
                                                        >
                                                            <img className="product-thumbnail" src={p.afbeelding || ''} alt={p.soort} onError={(e)=>{e.target.src=''; e.target.style.backgroundColor='#f3f3f3'}} />
                                                            <div className="product-meta">
                                                                <div className="product-name">{p.soort} <span className="small">#{p.id}</span></div>
                                                                <div className="product-price">{p.minimumprijs ? formatPrice(p.minimumprijs) : '—'}</div>
                                                            </div>
                                                            <div className="product-actions">
                                                                <button
                                                                    type="button"
                                                                    className="info-button"
                                                                    onClick={(e) => { e.stopPropagation(); openProductModal(p.id, p); }}
                                                                    onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProductModal(p.id, p); } }}
                                                                >
                                                                    Info
                                                                </button>
                                                                <div className="select-indicator">{selected[p.id]?.selected ? '✓' : ''}</div>
                                                            </div>

                                                            {isAssigned && (
                                                                <div className="assigned-badge">Toegevoegd aan veiling #{assignedId}</div>
                                                            )}
                                                            
                                                            {hasZeroQuantity && !isAssigned && (
                                                                <div className="assigned-badge">Hoeveelheid = 0</div>
                                                            )}

                                                            {selected[p.id]?.selected && (
                                                                // Rol-specifieke prijsinstellingen bij selectie
                                                                <div className="product-settings" onClick={(e)=>e.stopPropagation()}>
                                                                    <label>Startprijs (€)</label>
                                                                    <input type="number" step="0.01" value={selected[p.id]?.startPrice} onChange={(e) => setSelected(prev => ({ ...prev, [p.id]: { ...prev[p.id], startPrice: e.target.value } }))} disabled={loading} />
                                                                    <label>Increment per seconde (€/s)</label>
                                                                    <input type="number" step="0.01" value={selected[p.id]?.incrementPerSecond} onChange={(e) => setSelected(prev => ({ ...prev, [p.id]: { ...prev[p.id], incrementPerSecond: e.target.value } }))} disabled={loading} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Submit knop */}
                            <button type="submit" className="submit-button" disabled={loading}>
                                {loading ? 'Bezig met opslaan...' : 'Bevestigen'}
                            </button>
                        </form>

                    </div>
                </div>
            )}

            {/* Product-detail modal */}
            {(productLoading || productModal) && (
                <div className="detail-modal-overlay" onClick={() => setProductModal(null)}>
                    <div className="detail-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
                        <div className="detail-modal-header">
                            <h3 id="product-modal-title">{productLoading ? 'Laden...' : productModal.soort} <span className="auction-badge">{productModal ? `#${productModal.id}` : ''}</span></h3>
                            <button className="close-button" onClick={() => setProductModal(null)}>×</button>
                        </div>
                        <div className="detail-modal-body">
                            {productLoading ? (
                                <div style={{padding: 24}}>Productinformatie wordt geladen…</div>
                            ) : (
                                <>
                                    {/* Productafbeelding */}
                                    {productModal.afbeelding && (
                                        <div className="detail-image">
                                            <img src={productModal.afbeelding} alt="product" onError={(e)=>{e.target.src=''; e.target.style.backgroundColor='#f3f3f3'}} />
                                        </div>
                                    )}

                                    {/* Product details: soort, maten, hoeveelheid, prijzen, etc. */}
                                    <div className="detail-fields">
                                        <div className="detail-row"><strong>Soort:</strong> <span>{productModal.soort}</span></div>
                                        <div className="detail-row"><strong>Potmaat:</strong> <span>{productModal.potmaat ?? '-'}</span></div>
                                        <div className="detail-row"><strong>Steellengte:</strong> <span>{productModal.steellengte ?? '-'}</span></div>
                                        <div className="detail-row"><strong>Hoeveelheid:</strong> <span>{productModal.hoeveelheid ?? '-'}</span></div>
                                        <div className="detail-row"><strong>Minimumprijs:</strong> <span>{productModal.minimumprijs ? `€ ${parseFloat(productModal.minimumprijs).toFixed(2)}` : '-'}</span></div>
                                        <div className="detail-row"><strong>Kloklocatie:</strong> <span>{productModal.kloklokatie ?? '-'}</span></div>
                                        <div className="detail-row"><strong>Aanvoerder ID:</strong> <span>{productModal.gebruiker_id ?? productModal.gebruikerId ?? '-'}</span></div>
                                        <div className="detail-row"><strong>Artikel ID:</strong> <span>{productModal.id}</span></div>
                                        <div className="detail-row"><strong>Startprijs:</strong> <span>{(productModal.startprijs ?? productModal.startPrice) ? `€ ${parseFloat(productModal.startprijs ?? productModal.startPrice).toFixed(2)}` : '-'}</span></div>
                                        <div className="detail-row"><strong>Increment:</strong> <span>{productModal.incrementPerSecond ? `${parseFloat(productModal.incrementPerSecond).toFixed(2)} €/s` : '-'}</span></div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Lijst: bestaande veilingen met uitvouwbare product-details */}
            <div className="auctions-list-create">
                <h2>Huidige Veilingen</h2>
                <div className="auctions-grid-create">
                    {localAuctions.length === 0 ? (
                        <div className="no-auctions">Geen veilingen gevonden.</div>
                    ) : (
                        localAuctions.map((auction) => {
                            return (
                                <div key={auction.id} className={`auction-item ${expandedAuctions[auction.id] ? 'expanded' : ''}`} role="button" tabIndex={0} onClick={() => toggleAuction(auction.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') {toggleAuction(auction.id); } }}>
                                    <div className="auction-item-header stacked">
                                        <div className="auction-item-actions top">
                                            <span className="auction-badge">#{auction.id}</span>

                                            {/* Start knop: alleen zichtbaar wanneer veiling nog niet gestart is */}
                                            {auction.status === 'Idle' && (
                                                <button
                                                    className="start-button"
                                                    onClick={(e) => { e.stopPropagation(); handleStart(auction.id); }}
                                                    title="Start veiling"
                                                >
                                                    ▶️
                                                </button>
                                            )}

                                            <button 
                                                className="delete-button"
                                                onClick={(e) => { e.stopPropagation(); handleDelete(auction.id); }}
                                                title="Verwijder veiling"
                                            >
                                                🗑️
                                            </button>
                                        </div>

                                        <div className="auction-item-title">
                                            <h3 style={{ margin: '0.25rem 0 0 0' }}>{auction.name}</h3>
                                            <div style={{ marginTop: 6 }}>
                                                {auction.status === 'Done' ? (
                                                    <span className="status-badge-sold">GEEÏNDIGD</span>
                                                ) : auction.status === 'Idle' ? (
                                                    <span className="status-badge">NIET GESTART</span>
                                                ) : (
                                                    <span className="live-badge">LIVE</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="auction-item-details">
                                        {/* Veilingdetails: startprijs en eindtijd */}
                                        <div className="detail-small">
                                            <span>Startprijs:</span>
                                            <strong>{formatPrice(auction.startingPrice)}</strong>
                                        </div>
                                        <div className="detail-small">
                                            <span>Eindtijd:</span>
                                            <strong>
                                            {auction.endTime
                                                ? new Intl.DateTimeFormat('nl-NL', {
                                                    dateStyle: 'short',
                                                    timeStyle: 'short'
                                                }).format(new Date(auction.endTime))
                                                : '-'}
                                            </strong>
                                        </div>
                                    </div>

                                    {/* Uitvouwbare sectie: producten in deze veiling */}
                                    {expandedAuctions[auction.id] && (
                                        <div className="auction-products" onClick={(e) => e.stopPropagation()}>
                                            <h4>Producten in deze veiling</h4>
                                            {getProductsForAuction(auction.id).length === 0 ? (
                                                <div className="empty-products">Geen producten in deze veiling.</div>
                                            ) : (
                                                <div className="product-list-auction">
                                                    {getProductsForAuction(auction.id).map(p => (
                                                        <div key={p.id} className="auction-item auction-product-card" tabIndex={0} onClick={(e) => { e.stopPropagation(); openProductModal(p.id, p); }} onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProductModal(p.id, p); } }}>
                                                            <div className="auction-item-header">
                                                                <h3>{p.soort} {p.hoeveelheid ? `(x${p.hoeveelheid})` : ''}</h3>
                                                                <div className="auction-item-actions">
                                                                    <span className="auction-badge">#{p.id}</span>
                                                                </div>
                                                            </div>
                                                            <div className="auction-item-details">
                                                                <div className="detail-small"><span>Minimumprijs:</span><strong>{p.minimumprijs ? formatPrice(p.minimumprijs) : '€ 0.00'}</strong></div>
                                                                <div className="detail-small"><span>Kloklocatie:</span><strong>{p.kloklokatie ?? '-'}</strong></div>
                                                                {p.afbeelding && <div style={{marginTop:8}}><img src={p.afbeelding} alt="product" style={{maxWidth: '100%', maxHeight:150, borderRadius:8}}/></div>}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
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