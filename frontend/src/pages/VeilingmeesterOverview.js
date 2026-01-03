import { useState, useEffect } from 'react';
import '../styles/VeilingmeesterOverview.css';

function Overview({ auctions, setAuctions }) {
    const [selectedAuctionId, setSelectedAuctionId] = useState(null);
    const [localAuctions, setLocalAuctions] = useState([]);

    const selectedAuction = localAuctions.find(a => a.id === selectedAuctionId) ?? null;

    const fetchAuctions = async () => {
        try {
            const res = await fetch('http://localhost:5102/api/auctions',
                {headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }}
            );
            if (!res.ok) throw new Error('Fout bij ophalen veilingen');
            const data = await res.json();
            // map to include computed fields placeholder
            const mapped = (data || []).map(a => ({
                ...a,
                // ensure numeric values
                startingPrice: a.startingPrice ?? 0,
                maxTime: a.maxTime ?? 0,
                startTime: a.startTime ?? Date.now(),
                endTime: a.endTime ?? (a.startTime ?? Date.now()) + ((a.maxTime ?? 0) * 1000),
                currentPrice: a.startingPrice ?? 0,
            }));
            setLocalAuctions(mapped);
            // keep shared state in sync if provided
            if (setAuctions) setAuctions(mapped);
        } catch (err) {
            console.error('fetchAuctions error:', err);
            setLocalAuctions([]);
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
                };
            }));
        }, 200);

        return () => clearInterval(interval);
    }, []);

    // fetch on mount and when returning to the tab
    useEffect(() => {
        fetchAuctions();
        const onFocus = () => fetchAuctions();
        const onVisibility = () => { if (document.visibilityState === 'visible') fetchAuctions(); };
        window.addEventListener('focus', onFocus);
        document.addEventListener('visibilitychange', onVisibility);
        const poll = setInterval(fetchAuctions, 30000);
        return () => {
            window.removeEventListener('focus', onFocus);
            document.removeEventListener('visibilitychange', onVisibility);
            clearInterval(poll);
        };
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Weet je zeker dat je deze veiling wilt verwijderen?')) return;
        try {
            const res = await fetch(`http://localhost:5102/api/auctions/${id}`, {
                method: 'DELETE' ,
                headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
            });
            if (!res.ok) throw new Error('Fout bij verwijderen');
            setLocalAuctions(prev => prev.filter(a => a.id !== id));
            if (selectedAuctionId === id) setSelectedAuctionId(null);
            if (setAuctions) setAuctions(prev => prev.filter(a => a.id !== id));
        } catch (err) {
            alert('Fout bij verwijderen: ' + err.message);
            console.error(err);
        }
    };

    const formatPrice = (price) => {
        if (price == null) return '€ 0.00';
        return `€ ${parseFloat(price).toFixed(2)}`;
    };

    const formatTime = (seconds) => {
        if (!seconds && seconds !== 0) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="overview-container">
            <div className="auctions-grid">
                <div className="auctions-list">
                    <h1>Huidige Veilingen</h1>
                    {localAuctions.length === 0 ? (
                        <div className="no-auctions">Geen veilingen gevonden.</div>
                    ) : (
                        localAuctions.map(auction => (
                            <div
                                key={auction.id}
                                className={`auction-card ${selectedAuctionId === auction.id ? 'selected' : ''}`}
                                onClick={() => setSelectedAuctionId(auction.id)}
                            >
                                <div className="auction-card-header">
                                    <h3>{auction.name}</h3>
                                    <span className="auction-id">#{auction.id}</span>
                                </div>
                                <div className="auction-card-price">
                                    {formatPrice(auction.currentPrice)}
                                </div>
                                <div className="auction-card-time">
                                    <p>
                                        {auction.endTime
                                            ? new Intl.DateTimeFormat('nl-NL', {
                                                dateStyle: 'short',
                                                timeStyle: 'short'
                                            }).format(new Date(auction.endTime))
                                            : '-'}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {selectedAuction && (
                    <div className="auction-details">
                        <h2 id="auction-details-heading">Veilingdetails</h2>
                        <div className="details-content">
                            <div aria-labelledby="auction-details-heading" className="sr-only">
                                Details voor {selectedAuction.name} (Veiling ID: {selectedAuction.id})
                            </div>
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
                                <span className="detail-label">Einddatum:</span>
                                <span className="detail-value">
                                    <p>
                                        {selectedAuction.endTime
                                            ? new Intl.DateTimeFormat('nl-NL', {
                                                dateStyle: 'short',
                                                timeStyle: 'short'
                                            }).format(new Date(selectedAuction.endTime))
                                            : '-'}
                                    </p>
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
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Overview;