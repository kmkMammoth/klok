import { useState, useEffect, useRef } from 'react';
import '../styles/KoperDashboard.css';
import * as signalR from '@microsoft/signalr';

function KoperDashboard() {
    const [auctions, setAuctions] = useState([]);
    const [selectedAuction, setSelectedAuction] = useState(null);
    const [products, setProducts] = useState([]);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [price, setPrice] = useState(0);
    const [error, setError] = useState('');
    const [buying, setBuying] = useState(false);
    const [expired, setExpired] = useState(new Set());
    const [soldMessage, setSoldMessage] = useState('');
    const [redirectTimer, setRedirectTimer] = useState(null);

    // Refs / state voor realtime
    const timerRef = useRef(null);
    const connectionRef = useRef(null);
    const selectedAuctionRef = useRef(null);
    const serverTimeIntervalRef = useRef(null);
    const lastStartedPayloadRef = useRef({});
    const [serverOffsetMs, setServerOffsetMs] = useState(0); // serverUtc - clientNow

    const [refreshingOverview, setRefreshingOverview] = useState(false);

    const refreshOverviewData = async () => {
        setRefreshingOverview(true);
        try {
            const token = localStorage.getItem('accessToken');

            const [auctionsData, productsData] = await Promise.all([
                fetch('http://localhost:5102/api/auctions', {
                    headers: { Authorization: `Bearer ${token}` }
                }).then(r => r.json()),
                fetch('http://localhost:5102/api/products', {
                    headers: { Authorization: `Bearer ${token}` }
                }).then(r => r.json())
            ]);

            setAuctions(auctionsData);
            setProducts(productsData);
        } catch (e) {
            console.error('Overview refresh failed', e);
        } finally {
            setRefreshingOverview(false);
        }
    };

    // 1. Haal veilingen op bij laden en zet SignalR connection + haal servertijd op
    useEffect(() => {
        refreshOverviewData();
        fetchAuctions();
        fetchProducts(); // Haal direct producten op voor de afbeeldingen in het overzicht
        const interval = setInterval(fetchAuctions, 5000); // Poll elke 5 sec voor nieuwe veilingen

        const initRealtime = async () => {
            try {
                // haal servertijd
                const r = await fetch('http://localhost:5102/api/time');
                if (r.ok) {
                    const d = await r.json();
                    const serverUtc = new Date(d.utcNow).getTime();
                    setServerOffsetMs(serverUtc - Date.now());

                    // refresh server time offset periodically
                    serverTimeIntervalRef.current = setInterval(async () => {
                        try {
                            const r2 = await fetch('http://localhost:5102/api/time');
                            if (r2.ok) {
                                const d2 = await r2.json();
                                const serverUtc2 = new Date(d2.utcNow).getTime();
                                setServerOffsetMs(serverUtc2 - Date.now());
                            }
                        } catch (e) { /* ignore */ }
                    }, 30000);
                }

                // setup SignalR
                const conn = new signalR.HubConnectionBuilder()
                    .withUrl('http://localhost:5102/hubs/auction', {
                        accessTokenFactory: () => localStorage.getItem('accessToken') || ''
                    })
                    .withAutomaticReconnect()
                    .build();

                conn.on('AuctionStarted', (payload) => {
                    fetchAuctions();
                    if (selectedAuction && selectedAuction.id === payload.auctionId) {
                        fetchProducts(selectedAuction.id);
                    }
                });

                conn.on('ProductStarted', async (payload) => {
                    lastStartedPayloadRef.current[payload.productId] = payload;
                    setSoldMessage(''); // Reset melding als er een nieuw product start
                    setRedirectTimer(null);

                    if (selectedAuctionRef.current && selectedAuctionRef.current.id === payload.auctionId) {
                        const prod = await fetchProductById(payload.productId);
                        if (prod) {
                            setCurrentProduct({ ...prod, status: 'RUNNING' });
                            return;
                        }
                    }

                    setCurrentProduct(prev => (prev && prev.id === payload.productId) ? { ...prev, startedAtUtc: payload.startedAtUtc, startprijs: payload.startPrice, incrementPerSecond: payload.incrementPerSecond, minimumprijs: payload.minimumPrice, status: 'RUNNING' } : (selectedAuctionRef.current && selectedAuctionRef.current.id === payload.auctionId ? { id: payload.productId, startedAtUtc: payload.startedAtUtc, startprijs: payload.startPrice, incrementPerSecond: payload.incrementPerSecond, minimumprijs: payload.minimumPrice, status: 'RUNNING' } : prev));
                });

                conn.on('ProductSold', (payload) => {
                    setExpired(prev => {
                        const next = new Set(prev);
                        next.add(payload.productId);
                        return next;
                    });

                    // Toon melding in de klok als het huidige veiling betreft
                    if (selectedAuctionRef.current && selectedAuctionRef.current.id === payload.auctionId) {
                        setSoldMessage('De veiling van dit product is beëindigd door een bieder.');
                    }

                    setCurrentProduct(prev => (prev && prev.id === payload.productId) ? null : prev);
                    fetchProducts(selectedAuctionRef.current?.id);
                });

                conn.on('AuctionEnded', (payload) => {
                    fetchAuctions(); // Ververs lijst om status 'Finished' te zien
                    if (selectedAuctionRef.current?.id === payload.auctionId) {
                        setCurrentProduct(null);
                        setSoldMessage('De veiling is afgelopen.');
                    }
                });

                await conn.start();
                if (selectedAuctionRef.current) {
                    conn.invoke('JoinAuction', selectedAuctionRef.current.id.toString()).catch(err => console.error('JoinAuction failed', err));
                }

                conn.onreconnected(() => {
                    const a = selectedAuctionRef.current;
                    if (a) {
                        conn.invoke('JoinAuction', a.id.toString()).catch(err => console.error('Rejoin failed', err));
                    }
                });

                connectionRef.current = conn;

            } catch (err) {
                console.error('Realtime init failed', err);
            }
        };

        initRealtime();

        return () => {
            clearInterval(interval);
            if (serverTimeIntervalRef.current) clearInterval(serverTimeIntervalRef.current);
            if (connectionRef.current) {
                connectionRef.current.stop().catch(() => {});
                connectionRef.current = null;
            }
        };
    }, []);

    // 2. Als een veiling is geselecteerd, haal producten op en join de SignalR groep
    useEffect(() => {
        selectedAuctionRef.current = selectedAuction;
        if (!selectedAuction) return;
        setExpired(new Set());
        setSoldMessage('');
        setRedirectTimer(null);

        (async () => {
            const data = await fetchProducts(selectedAuction.id);
            if (data) {
                const running = data.find(p => (p.status === 'RUNNING' || p.startedAtUtc) && !expired.has(p.id));
                if (running) {
                    const prod = await fetchProductById(running.id);
                    if (prod) {
                        setCurrentProduct({ ...prod, status: 'RUNNING' });
                        return;
                    }
                }
            }
        })();

        const conn = connectionRef.current;
        if (conn && conn.state === signalR.HubConnectionState.Connected) {
            conn.invoke('JoinAuction', selectedAuction.id.toString()).catch(err => console.error(err));
        }

        const interval = setInterval(() => {
            fetchProducts(selectedAuction.id);
        }, 10000);

        return () => {
            if (conn && conn.state === signalR.HubConnectionState.Connected) {
                conn.invoke('LeaveAuction', selectedAuction.id.toString()).catch(err => console.error(err));
            }
            clearInterval(interval);
        };
    }, [selectedAuction]);

    // 3. Bepaal wat het huidige product is
    useEffect(() => {
        if (products.length === 0) {
            setCurrentProduct(null);
            return;
        }

        const auctionProducts = products
            .filter(p => (p.veilingId === selectedAuction?.id));

        const running = auctionProducts
            .filter(p => (p.status === 'RUNNING' && !expired.has(p.id)));

        if (running.length > 0) {
            running.sort((a, b) => a.id - b.id);
            const nextRunning = running[0];

            if (currentProduct?.id !== nextRunning.id || !currentProduct?.startedAtUtc) {
                setCurrentProduct({ ...nextRunning, startedAtUtc: nextRunning.startedAtUtc, status: 'RUNNING' });
            }
            return;
        }

        const unsold = auctionProducts
            .filter(p => !p.koperId && !p.koper_id && !p.gebruikerIdKoper)
            .filter(p => !expired.has(p.id));

        if (unsold.length > 0) {
            unsold.sort((a, b) => a.id - b.id);
            const next = unsold[0];

            if (currentProduct?.id !== next.id) {
                setCurrentProduct({ ...next, startedAtUtc: next.startedAtUtc });
            }
        } else {
            setCurrentProduct(null);
            setPrice(0);
        }
    }, [products, selectedAuction, expired, currentProduct]);

    // 4. De Klok (Prijs daling)
    const fetchedProductDetailsRef = useRef(new Set());

    const parseStartedAtMs = (s) => {
        if (!s) return null;
        try {
            if (typeof s !== 'string') return new Date(s).getTime();
            if (/[zZ]$|[+\-]\d{2}:?\d{2}$/.test(s)) return new Date(s).getTime();
            return new Date(s + 'Z').getTime();
        } catch (e) {
            console.error('parseStartedAtMs failed', s, e);
            return new Date(s).getTime();
        }
    };

    useEffect(() => {
        if (!currentProduct) {
            if (timerRef.current) clearInterval(timerRef.current);
            return;
        }

        const updatePrice = async () => {
            const startPriceRaw = currentProduct.startprijs ?? currentProduct.startPrice ?? currentProduct.minimumprijs ?? 0;
            let startPrice = parseFloat(startPriceRaw) || 0;
            const minPrice = parseFloat(currentProduct.minimumprijs ?? 0) || 0;
            const increment = parseFloat(currentProduct.incrementPerSecond ?? 0) || 0;

            const startedAt = currentProduct.startedAtUtc ? parseStartedAtMs(currentProduct.startedAtUtc) : null;
            if (!startedAt) {
                setPrice(startPrice);
                return;
            }

            const nowClient = Date.now();
            const serverNow = nowClient + serverOffsetMs;
            const elapsedSeconds = (serverNow - startedAt) / 1000;

            if ((startPrice <= minPrice) && elapsedSeconds < 3 && !fetchedProductDetailsRef.current.has(currentProduct.id)) {
                fetchedProductDetailsRef.current.add(currentProduct.id);
                const refreshed = await fetchProductById(currentProduct.id);
                if (refreshed) {
                    setCurrentProduct(prev => (prev && prev.id === refreshed.id) ? { ...refreshed, status: 'RUNNING' } : prev);
                    if (refreshed.startprijs && parseFloat(refreshed.startprijs) > minPrice) {
                        startPrice = parseFloat(refreshed.startprijs);
                    }
                }
            }

            const payload = lastStartedPayloadRef.current[currentProduct.id];
            if ((startPrice <= minPrice) && payload && payload.startPrice && parseFloat(payload.startPrice) > minPrice) {
                startPrice = parseFloat(payload.startPrice);
            }

            let newPrice = startPrice - (elapsedSeconds * increment);
            if (newPrice <= minPrice) newPrice = minPrice;
            setPrice(newPrice);
        };

        timerRef.current = setInterval(() => { updatePrice().catch(() => {}); }, 200);
        updatePrice().catch(() => {});
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [currentProduct, serverOffsetMs]);

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
            const url = auctionId ? `http://localhost:5102/api/products?veilingId=${auctionId}` : 'http://localhost:5102/api/products';
            const response = await fetch(url, {
                headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
            });
            if (!response.ok) throw new Error('Fout bij ophalen producten');
            const data = await response.json();
            setProducts(data);
            return data;
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    const fetchProductById = async (productId) => {
        try {
            const r = await fetch(`http://localhost:5102/api/products/${productId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
            });
            if (!r.ok) throw new Error('Fout bij ophalen product');
            return await r.json();
        } catch (err) {
            console.error('Failed to fetch product by id', err);
            return null;
        }
    };

    const handleBuy = async () => {
        if (!currentProduct) return;
        setBuying(true);
        setError('');

        try {
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

            setAuctions(prev => prev.map(a => a.id === selectedAuction.id ? { ...a, status: 'Finished' } : a));

            setExpired(prev => {
                const next = new Set(prev);
                next.add(currentProduct.id);
                return next;
            });

            setCurrentProduct(null);

            // Ververs server data
            fetchAuctions();
            fetchProducts(selectedAuction.id).catch(() => {});

        } catch (err) {
            setError(err.message);
        } finally {
            setBuying(false);
        }
    };

    const isAuctionSoldOut = (auctionId) => {
        const auctionProducts = products.filter(p => p.veilingId === auctionId);
        return (
            auctionProducts.length > 0 &&
            auctionProducts.every(p => p.status === 'GEKOCHT')
        );
    };

    const isAuctionRejected = (auctionId) => { 
        const auctionProducts = products.filter(p => p.veilingId === auctionId); 
        return auctionProducts.some(p => p.status === 'VERWORPEN'); 
    };

    const formatPrice = (amount) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount);

    return (
        <div className="koper-dashboard-container">
            {!selectedAuction ? (
                <div className="dashboard-section">
                    <h1>Beschikbare Veilingen</h1>
                    <div className="auctions-grid">
                        {auctions.map(auction => {
                            const rejected = isAuctionRejected(auction.id);
                            const soldOut = isAuctionSoldOut(auction.id);
                            const isOngoing = auction.status === 'Ongoing';
                            const canJoin = isOngoing && !soldOut && !rejected;

                            let buttonText = 'Niet gestart';
                            if (rejected) buttonText = 'VERWORPEN';
                            if (soldOut) buttonText = 'VERKOCHT';
                            else if (isOngoing) buttonText = 'Deelnemen';

                            return (
                                <div
                                    key={auction.id}
                                    className={`auction-card ${canJoin ? 'active' : 'disabled-auction'}`}
                                    onClick={() => {
                                        if (canJoin) setSelectedAuction(auction);
                                    }}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                        if ((e.key === 'Enter' || e.key === ' ') && canJoin) {
                                            e.preventDefault();
                                            setSelectedAuction(auction);
                                        }
                                    }}
                                >
                                    <h3>{auction.name}</h3>

                                    <button
                                        className={`enter-button ${rejected ? 'rejected-button' : soldOut ? 'sold-button' : ''}`}
                                        disabled={!canJoin}
                                    >
                                        {buttonText}
                                    </button>
                                </div>
                            );
                        })}

                        {auctions.length === 0 && (
                            <p>Geen veilingen gevonden.</p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="live-auction-view">
                    <button className="back-btn" onClick={() => setSelectedAuction(null)}>← Terug</button>
                    <h2> {isAuctionRejected(selectedAuction.id) ? 
                        ( <span className="rejected-badge">VERWORPEN</span> ) 
                        : isAuctionSoldOut(selectedAuction.id) 
                            ? ( <span className="sold-badge">VERKOCHT</span> ) 
                            : ( <span className="live-badge">LIVE</span> )} 
                    </h2>

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
                                            <strong>Aanvoerder:</strong> <span>{currentProduct.gebruiker_id}</span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="waiting">
                                    <div style={{ marginBottom: '10px' }}>{soldMessage || "Wachten op volgend product..."}</div>
                                    {redirectTimer !== null && (
                                        <div style={{ fontWeight: 'bold', color: '#666' }}>
                                            Je wordt over {redirectTimer} seconden teruggestuurd naar het overzicht.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="clock-panel">
                            <div className="clock-circle">
                                {soldMessage ? (
                                    <div className="sold-ui" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <span className="sold-text" style={{ fontSize: '1.1rem', color: '#d32f2f', textAlign: 'center', padding: '10px', fontWeight: 'bold' }}>
                                            {soldMessage}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="price">{formatPrice(currentProduct ? price : 0)}</span>
                                )}
                            </div>
                            <button
                                className="buy-btn-large"
                                onClick={handleBuy}
                                disabled={!currentProduct || buying || currentProduct?.status !== 'RUNNING'}
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