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
    const [buyQuantity, setBuyQuantity] = useState(1);
    const [expired, setExpired] = useState(new Set());
    const [soldMessage, setSoldMessage] = useState('');
    const [redirectTimer, setRedirectTimer] = useState(null);

    // Development debug state (commented out). Used to surface price calc anomalies.
    // To enable: uncomment the state below and the setDebugInfo / console calls throughout this file.
    /* const [debugInfo, setDebugInfo] = useState(null); // dev-only visible debug info */

    // Refs / state voor realtime
    const timerRef = useRef(null);
    const connectionRef = useRef(null);
    const selectedAuctionRef = useRef(null);
    const serverTimeIntervalRef = useRef(null);
    const lastStartedPayloadRef = useRef({});
    const [serverOffsetMs, setServerOffsetMs] = useState(0); // serverUtc - clientNow

    // 1. Haal veilingen op bij laden en zet SignalR connection + haal servertijd op
    useEffect(() => {
        fetchAuctions();
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
                    // payload: { auctionId, startedAtUtc }
                    // refresh auctions list and products
                    fetchAuctions();
                    if (selectedAuction && selectedAuction.id === payload.auctionId) {
                        fetchProducts(selectedAuction.id);
                    }
                });

                conn.on('ProductStarted', async (payload) => {
                    // payload contains productId, startedAtUtc and other details
                    // Debug: ProductStarted payload received (disabled in production)
                    /* console.error('ProductStarted payload received', payload); */

                    // cache payload so price calculation can use it if product record is stale
                    lastStartedPayloadRef.current[payload.productId] = payload;

                    // Only fetch the single product details if this client is viewing that auction
                    if (selectedAuctionRef.current && selectedAuctionRef.current.id === payload.auctionId) {
                        const prod = await fetchProductById(payload.productId);
                        /* console.error('ProductStarted: fetched product', prod); */
                        if (prod) {
                            setCurrentProduct({ ...prod, status: 'RUNNING' });

                            // If product record lacks proper startprijs (<= minimum), surface debug info immediately (disabled)
                            const prodStart = parseFloat(prod.startprijs ?? prod.startPrice ?? 0);
                            const prodMin = parseFloat(prod.minimumprijs ?? 0);
                            if (prodStart <= prodMin) {
                                const info = { time: new Date().toISOString(), productId: prod.id, startPrice: prodStart, minPrice: prodMin, increment: prod.incrementPerSecond ?? prod.IncrementPerSecond, elapsedSeconds: 0, payload: payload };
                                /* setDebugInfo(info);
                                console.error('ProductStarted: product record has start<=min', info); */
                            }

                            return;
                        }
                    }

                    // fallback to payload if fetching failed
                    setCurrentProduct(prev => (prev && prev.id === payload.productId) ? { ...prev, startedAtUtc: payload.startedAtUtc, startprijs: payload.startPrice, incrementPerSecond: payload.incrementPerSecond, minimumprijs: payload.minimumPrice, status: 'RUNNING' } : (selectedAuctionRef.current && selectedAuctionRef.current.id === payload.auctionId ? { id: payload.productId, startedAtUtc: payload.startedAtUtc, startprijs: payload.startPrice, incrementPerSecond: payload.incrementPerSecond, minimumprijs: payload.minimumPrice, status: 'RUNNING' } : prev));
                });

                conn.on('ProductSold', (payload) => {
                    // payload: { productId, buyerId, price, soldAtUtc }
                    // If this was the current product, mark it expired and clear current product immediately
                    setExpired(prev => {
                        const next = new Set(prev);
                        next.add(payload.productId);
                        return next;
                    });
                    setCurrentProduct(prev => (prev && prev.id === payload.productId) ? null : prev);
                    // refresh product list to show updated ownership and upcoming product
                    fetchProducts(selectedAuctionRef.current?.id);
                });

                conn.on('ProductUpdated', async (payload) => {
                    // payload: { productId, remaining }
                    try {
                        if (!payload || !payload.productId) return;
                        // Refresh the single product to get full details if possible
                        const prod = await fetchProductById(payload.productId);
                        if (prod) {
                            setProducts(prev => prev.map(p => (p.id === prod.id ? prod : p)));
                            setCurrentProduct(prev => (prev && prev.id === prod.id) ? { ...prev, hoeveelheid: prod.hoeveelheid, status: prod.status } : prev);
                        } else {
                            // fallback to applying remaining if fetch failed
                            setCurrentProduct(prev => (prev && prev.id === payload.productId) ? { ...prev, hoeveelheid: payload.remaining } : prev);
                        }
                    } catch (e) {
                        console.error('ProductUpdated handling failed', e);
                    }
                });

                conn.on('AuctionEnded', (payload) => {
                    fetchAuctions();
                    fetchProducts(selectedAuction?.id);
                });

                await conn.start();
                // If an auction is already selected, join its group
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
        // keep ref in sync so SignalR handlers can access the latest selection
        selectedAuctionRef.current = selectedAuction;
        if (!selectedAuction) return;
        setExpired(new Set()); // Reset expired bij wisselen veiling
        (async () => {
            const data = await fetchProducts(selectedAuction.id);
            if (data) {
                // If server already started a product, prefer explicit RUNNING one and fetch its details
                const running = data.find(p => (p.status === 'RUNNING' || p.Status === 'RUNNING' || p.startedAtUtc) && !expired.has(p.id));
                if (running) {
                    // Debug: running product found (logging disabled). Uncomment for development troubleshooting.
                    /* console.error('Selection effect: found running product in list', running); */
                    const prod = await fetchProductById(running.id);
                    /* console.error('Selection effect: fetched product details', prod); */
                    if (prod) {
                        setCurrentProduct({ ...prod, status: 'RUNNING' });
                        return;
                    }
                }
            }
        })();

        // Join SignalR group for realtime updates
        const conn = connectionRef.current;
        if (conn && conn.state === signalR.HubConnectionState.Connected) {
            conn.invoke('JoinAuction', selectedAuction.id.toString()).catch(err => console.error(err));
        }

        // Periodiek fallback refresh (langzamer)
        const interval = setInterval(() => {
            fetchProducts(selectedAuction.id);
        }, 10000); // Poll 10s als fallback

        return () => {
            // leave group
            if (conn && conn.state === signalR.HubConnectionState.Connected) {
                conn.invoke('LeaveAuction', selectedAuction.id.toString()).catch(err => console.error(err));
            }
            clearInterval(interval);
        };
    }, [selectedAuction]);

    // 3. Bepaal wat het huidige product is (voorkeur voor een RUNNING product met startedAtUtc)
    // We voorkomen dat een recent ProductStarted event overschreven wordt door een latere products refresh.
    useEffect(() => {
        if (products.length === 0) {
            setCurrentProduct(null);
            return;
        }

        const auctionProducts = products
            .filter(p => (p.veilingId === selectedAuction?.id || p.veiling_id === selectedAuction?.id));

        // Prefer products that are RUNNING (server started) and not expired
        const running = auctionProducts
            .filter(p => (p.status === 'RUNNING' || p.Status === 'RUNNING') && !expired.has(p.id));

        if (running.length > 0) {
            running.sort((a, b) => a.id - b.id);
            const nextRunning = running[0];

            // Only set/replace if it's a different product or if we don't already have a valid startedAtUtc
            if (currentProduct?.id !== nextRunning.id || !currentProduct?.startedAtUtc) {
                setCurrentProduct({ ...nextRunning, startedAtUtc: nextRunning.startedAtUtc, status: 'RUNNING' });

                // If the selected running product has invalid start price, surface debug info (disabled)
                const sr = parseFloat(nextRunning.startprijs ?? nextRunning.startPrice ?? 0);
                const mn = parseFloat(nextRunning.minimumprijs ?? 0);
                if (sr <= mn) {
                    const info = { time: new Date().toISOString(), productId: nextRunning.id, startPrice: sr, minPrice: mn, increment: nextRunning.incrementPerSecond ?? nextRunning.IncrementPerSecond, elapsedSeconds: 0, payload: lastStartedPayloadRef.current[nextRunning.id] };
                    /* setDebugInfo(info);
                    console.error('Selected running product has start<=min', info); */
                }
            }
            // running product takes precedence
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

    // 4. De Klok (Prijs daling) — bereken op basis van server-starttijd + client offset
    const fetchedProductDetailsRef = useRef(new Set());

    // Helper: parse ISO-like timestamp from server as UTC even if timezone designator is missing
    const parseStartedAtMs = (s) => {
        if (!s) return null;
        try {
            if (typeof s !== 'string') return new Date(s).getTime();
            // If the string ends with Z or contains an offset like +02:00, let Date parse it.
            if (/[zZ]$|[+\-]\d{2}:?\d{2}$/.test(s)) return new Date(s).getTime();
            // Otherwise assume it's UTC and append 'Z'
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
                // If no server-start time available, fallback to server offset-based "now" and assume it just started
                setPrice(startPrice);
                return;
            }

            // Compute elapsed seconds using server offset
            const nowClient = Date.now();
            const serverNow = nowClient + serverOffsetMs;
            const elapsedSeconds = (serverNow - startedAt) / 1000;

            // If the product has a startedAtUtc but no distinct startPrice (or startPrice equals min), try to refresh product details once
            if ((startPrice <= minPrice) && elapsedSeconds < 3 && !fetchedProductDetailsRef.current.has(currentProduct.id)) {
                fetchedProductDetailsRef.current.add(currentProduct.id);
                const refreshed = await fetchProductById(currentProduct.id);
                if (refreshed) {
                    setCurrentProduct(prev => (prev && prev.id === refreshed.id) ? { ...refreshed, status: 'RUNNING' } : prev);
                    // update startPrice from refreshed record if available
                    if (refreshed.startprijs && parseFloat(refreshed.startprijs) > minPrice) {
                        startPrice = parseFloat(refreshed.startprijs);
                    }
                }
            }

            // Use payload startPrice if we have it cached and current startPrice appears invalid
            const payload = lastStartedPayloadRef.current[currentProduct.id];
            if ((startPrice <= minPrice) && payload && payload.startPrice && parseFloat(payload.startPrice) > minPrice) {
                startPrice = parseFloat(payload.startPrice);
            }

            let newPrice = startPrice - (elapsedSeconds * increment);

            // If computed price already below minimum, log full debug so we can trace elapsed/serverOffset
            if (newPrice <= minPrice) {
                const info = { time: new Date().toISOString(), productId: currentProduct?.id, startPrice, minPrice, increment, elapsedSeconds, startedAt, serverNow, computedPrice: newPrice, payload };
                /* setDebugInfo(info);
                console.error('Computed price below minimum:', info); */
                newPrice = minPrice;
            } else {
                // clear previous debug info when values look normal
                /* if (debugInfo) setDebugInfo(null); */
            }

            setPrice(newPrice);
        };

        timerRef.current = setInterval(() => { updatePrice().catch(() => {}); }, 200); // update 5x/sec
        // run once immediately to avoid initial blank
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
            // POST naar GekochtProduct API met hoeveelheid en koopprijs
            const payload = {
                ProductId: currentProduct.id,
                Hoeveelheid: parseInt(buyQuantity, 10) || 1,
                KoopPrijs: parseFloat(price?.toFixed(2)) || 0
            };

            const response = await fetch('http://localhost:5102/api/GekochtProduct', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Kopen mislukt. Mogelijk is iemand je voor.');
            }

            // Refresh the product to get updated hoeveelheid/status instead of clearing current product
            const refreshed = await fetchProductById(currentProduct.id);
            if (refreshed) {
                // If product is fully sold or marked GEKOCHT, mark expired and clear current product
                if ((refreshed.hoeveelheid ?? 0) <= 0 || refreshed.status === 'GEKOCHT') {
                    setExpired(prev => {
                        const next = new Set(prev);
                        next.add(refreshed.id);
                        return next;
                    });

                    // Check if there are any products left in this auction
                    const allProducts = await fetchProducts(selectedAuction.id);
                    const remainingProducts = allProducts.filter(p =>
                        p.status !== 'GEKOCHT' && p.status !== 'VERWORPEN' && (p.hoeveelheid ?? 0) > 0
                    );

                    if (remainingProducts.length === 0) {
                        setRedirectTimer(10);
                        const interval = setInterval(() => {
                            setRedirectTimer((prev) => {
                                if (prev <= 1) {
                                    clearInterval(interval);
                                    setSelectedAuction(null);
                                    setRedirectTimer(null);
                                    return 0;
                                }
                                return prev - 1;
                            });
                        }, 1000);
                    }

                    setCurrentProduct(null);
                } else {
                    // Update current product with remaining quantity
                    setCurrentProduct(refreshed);
                }
            }

            // Trigger background refresh of product list
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
                            const soldOut = isAuctionSoldOut(auction.id);
                            const isOngoing = auction.status === 'Ongoing';
                            const canJoin = isOngoing && !soldOut;

                            let buttonText = 'Niet gestart';

                            if (auction.status === 'Done') {
                                buttonText = 'GEEÏNDIGD';
                            }
                            if (soldOut) {
                                buttonText = 'GEEÏNDIGD';
                            } else if (isOngoing) {
                                buttonText = 'Deelnemen';
                            }

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
                                        className={`enter-button ${auction.status === 'Done' ? 'rejected-button' : soldOut ? 'sold-button' : ''}`}
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
                    <h2>
                        {selectedAuction.name}{' '}
                        {isAuctionSoldOut(selectedAuction.id) ? (
                            <span className="sold-badge">VERKOCHT</span>
                        ) : (
                            <span className="live-badge">LIVE</span>
                        )}
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
                                disabled={!currentProduct || buying || currentProduct?.status !== 'RUNNING' || (parseInt(buyQuantity, 10) <= 0)}
                            >
                                {buying ? 'BEZIG...' : 'KOOP NU'}
                            </button>
                            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <label style={{ fontSize: '0.9rem', marginBottom: '4px' }}>Aantal te kopen</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={currentProduct?.hoeveelheid}
                                    value={buyQuantity}
                                    onChange={(e) => {
                                        let value = Number(e.target.value);

                                        if (!currentProduct) return;

                                        if (value < 1) value = 1;
                                        if (value > currentProduct.hoeveelheid) {
                                            value = currentProduct.hoeveelheid;
                                        }

                                        setBuyQuantity(value);
                                    }}
                                    style={{ width: '80px', textAlign: 'center', padding: '4px' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default KoperDashboard;