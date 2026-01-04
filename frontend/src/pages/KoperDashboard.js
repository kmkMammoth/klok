import { useState, useEffect, useRef } from 'react';
import '../styles/KoperDashboard.css';

function KoperDashboard() {
    const [auctions, setAuctions] = useState([]);
    const [selectedAuction, setSelectedAuction] = useState(null);
    const [products, setProducts] = useState([]);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [price, setPrice] = useState(0);
    const [error, setError] = useState('');
    const [buying, setBuying] = useState(false);
    const [expired, setExpired] = useState(new Set());

    // Refs voor timer logica
    const timerRef = useRef(null);
    const productStartTimeRef = useRef(null);

    // 1. Haal veilingen op bij laden
    useEffect(() => {
        fetchAuctions();
        const interval = setInterval(fetchAuctions, 5000); // Poll elke 5 sec voor nieuwe veilingen
        return () => clearInterval(interval);
    }, []);

    // 2. Als een veiling is geselecteerd, haal producten op en update elke paar seconden
    useEffect(() => {
        if (!selectedAuction) return;
        setExpired(new Set()); // Reset expired bij wisselen veiling
        fetchProducts(selectedAuction.id);
        
        const interval = setInterval(() => {
            fetchProducts(selectedAuction.id);
        }, 2000); // Snelle poll voor live gevoel

        return () => clearInterval(interval);
    }, [selectedAuction]);

    // 3. Bepaal wat het huidige product is (het eerste product zonder koper)
    useEffect(() => {
        if (products.length > 0) {
            // Filter producten die bij deze veiling horen en nog niet verkocht zijn
            // Let op: check zowel camelCase als snake_case voor koperId afhankelijk van je backend
            const unsold = products
                .filter(p => (p.veilingId === selectedAuction?.id || p.veiling_id === selectedAuction?.id))
                .filter(p => !p.koperId && !p.koper_id && !p.gebruikerIdKoper)
                .filter(p => !expired.has(p.id));

            if (unsold.length > 0) {
                // Sorteer op ID zodat we de volgorde behouden
                unsold.sort((a, b) => a.id - b.id);
                const next = unsold[0];

                // Alleen resetten als het product daadwerkelijk verandert
                if (currentProduct?.id !== next.id) {
                    setCurrentProduct(next);
                    productStartTimeRef.current = Date.now();
                    // Startprijs instellen (fallback naar minimumprijs als startprijs mist)
                    setPrice(next.startprijs ?? next.startPrice ?? next.minimumprijs ?? 0);
                }
            } else {
                setCurrentProduct(null);
                setPrice(0);
            }
        } else {
            setCurrentProduct(null);
        }
    }, [products, selectedAuction, expired]);

    // 4. De Klok (Prijs daling)
    useEffect(() => {
        if (!currentProduct) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }

        const updatePrice = () => {
            const startPrice = parseFloat(currentProduct.startprijs ?? currentProduct.startPrice ?? currentProduct.minimumprijs ?? 0);
            const minPrice = parseFloat(currentProduct.minimumprijs ?? 0);
            const increment = parseFloat(currentProduct.incrementPerSecond ?? 0);
            
            // Bereken verstreken tijd
            const elapsedSeconds = (Date.now() - productStartTimeRef.current) / 1000;
            
            // Bereken nieuwe prijs
            let newPrice = startPrice - (elapsedSeconds * increment);
            
            // Niet lager dan minimum
            if (newPrice <= minPrice) {
                newPrice = minPrice;
                // Markeer als verlopen zodat we naar het volgende product gaan
                setExpired(prev => {
                    const next = new Set(prev);
                    next.add(currentProduct.id);
                    return next;
                });
            }
            
            setPrice(newPrice);
        };

        timerRef.current = setInterval(updatePrice, 100); // Update elke 100ms voor vloeiende animatie
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [currentProduct]);

    const fetchAuctions = async () => {
        try {
            const response = await fetch('http://localhost:5102/api/auctions', {
                headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
            });
            if (!response.ok) throw new Error('Fout bij ophalen veilingen');
            const data = await response.json();
            setAuctions(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchProducts = async (auctionId) => {
        try {
            const response = await fetch('http://localhost:5102/api/products', {
                headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
            });
            if (!response.ok) throw new Error('Fout bij ophalen producten');
            const data = await response.json();
            setProducts(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleBuy = async () => {
        if (!currentProduct) return;
        setBuying(true);
        setError('');

        try {
            // POST request om te kopen. De backend haalt de Koper ID uit het token.
            const response = await fetch(`http://localhost:5102/api/products/${currentProduct.id}/buy`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}` 
                }
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Kopen mislukt. Mogelijk is iemand je voor.');
            }
            
            // Direct verversen om naar volgende product te gaan
            await fetchProducts(selectedAuction.id);
        } catch (err) {
            setError(err.message);
        } finally {
            setBuying(false);
        }
    };

    const formatPrice = (amount) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount);

    return (
        <div className="koper-dashboard-container">
            {!selectedAuction ? (
                <div className="dashboard-section">
                    <h1>Beschikbare Veilingen</h1>
                    <div className="auctions-grid">
                        {auctions.map(auction => (
                            <div key={auction.id} className="auction-card" onClick={() => setSelectedAuction(auction)}>
                                <h3>{auction.name}</h3>
                                <p>Starttijd: {new Date(auction.startTime || Date.now()).toLocaleTimeString()}</p>
                                <button className="enter-button">Deelnemen</button>
                            </div>
                        ))}
                        {auctions.length === 0 && <p>Geen actieve veilingen.</p>}
                    </div>
                </div>
            ) : (
                <div className="live-auction-view">
                    <button className="back-btn" onClick={() => setSelectedAuction(null)}>← Terug</button>
                    <h2>{selectedAuction.name} <span className="live-badge">LIVE</span></h2>
                    
                    {error && <div className="error-banner">{error}</div>}

                    <div className="live-content">
                        <div className="product-display">
                            {currentProduct ? (
                                <>
                                    <div className="img-container">
                                        {currentProduct.afbeelding ? <img src={currentProduct.afbeelding} alt={currentProduct.soort} /> : <div className="placeholder">Geen afbeelding</div>}
                                    </div>
                                    <h3>{currentProduct.soort}</h3>
                                    
                                    <div className="product-specs">
                                        <div className="spec-row">
                                            <strong>Aantal:</strong> <span>{currentProduct.hoeveelheid}</span>
                                        </div>
                                        <div className="spec-row">
                                            <strong>Potmaat:</strong> <span>{currentProduct.potmaat}</span>
                                        </div>
                                        <div className="spec-row">
                                            <strong>Steellengte:</strong> <span>{currentProduct.steellengte}</span>
                                        </div>
                                        <div className="spec-row">
                                            <strong>Locatie:</strong> <span>{currentProduct.kloklokatie}</span>
                                        </div>
                                        <div className="spec-row">
                                            <strong>Kweker:</strong> <span>{currentProduct.gebruikerId}</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="waiting">Wachten op volgend product of veiling afgelopen...</div>
                            )}
                        </div>
                        <div className="clock-panel">
                            <div className="clock-circle">
                                <span className="price">{formatPrice(currentProduct ? price : 0)}</span>
                            </div>
                            <button 
                                className="buy-btn-large" 
                                onClick={handleBuy} 
                                disabled={!currentProduct || buying}
                            >
                                {buying ? 'BEZIG...' : 'KOOP NU'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default KoperDashboard;