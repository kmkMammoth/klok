import { useState, useEffect } from 'react';
import '../styles/VeilingmeesterOverview.css';

function Overview({ auctions, setAuctions }) {
    const [selectedAuction, setSelectedAuction] = useState(null);

    useEffect(() => {
        const interval = setInterval(() => {
            setAuctions(prevAuctions => 
                prevAuctions.map(auction => {
                    const elapsed = Math.floor((Date.now() - auction.startTime) / 1000);
                    const progress = elapsed / auction.maxTime;
                    const priceReduction = auction.startingPrice * progress;
                    const newPrice = Math.max(1, auction.startingPrice - priceReduction);
                    
                    return {
                        ...auction,
                        currentPrice: elapsed >= auction.maxTime ? 1 : newPrice,
                        timeRemaining: Math.max(0, auction.maxTime - elapsed)
                    };
                })
            );
        }, 100);

        return () => clearInterval(interval);
    }, [setAuctions]);

    const formatPrice = (price) => {
        return `€ ${price.toFixed(2)}`;
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="overview-container">
            <div className="auctions-grid">
                <div className="auctions-list">
                    <h1>Huidige Veilingen</h1>
                    {auctions.map(auction => (
                        <div 
                            key={auction.id}
                            tabIndex="0"
                            className={`auction-card ${selectedAuction?.id === auction.id ? 'selected' : ''}`}
                            onClick={() => setSelectedAuction(auction)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    setSelectedAuction(auction);
                                }
                            }}
                            role="button"
                            aria-pressed={selectedAuction?.id === auction.id}
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
                    ))}
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
                                <span className="detail-label">Resterende Tijd:</span>
                                <span className="detail-value time-highlight">
                                    {formatTime(selectedAuction.timeRemaining || 0)}
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Maximale Tijd:</span>
                                <span className="detail-value">{formatTime(selectedAuction.maxTime)}</span>
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