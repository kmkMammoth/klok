import '../styles/Productenoverzicht.css';

function Productenoverzicht({ auctions }) {
    const formatPrice = (price) => {
        return price != null ? `€ ${price.toFixed(2)}` : '-';
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '-';
        const d = new Date(timestamp);
        return d.toLocaleString('nl-NL', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    };

    const rows = auctions.map(a => {
        const ended = a.timeRemaining === 0 || (a.timeRemaining != null && a.timeRemaining <= 0);
        const veildatum = ended ? (a.startTime + (a.maxTime || 0) * 1000) : null;
        const verkoopbedrag = ended ? a.currentPrice : null;
        return {
            id: a.id,
            product: a.name,
            status: ended ? 'Geveild' : 'Niet geveild',
            veildatum,
            verkoopbedrag,
            koper: ended ? '-' : '-'
        };
    });

    return (
        <div className="producten-container">
            <div className="aanvoerder-greeting">Hallo, aanvoerder.</div>
            <h1 className="producten-title">Productenoverzicht</h1>

            <div className="producten-table">
                <div className="table-header">
                    <div>Product</div>
                    <div>Status</div>
                    <div>Veildatum</div>
                    <div>Verkoopbedrag</div>
                    <div>Koper</div>
                </div>

                {rows.map(r => (
                    <div key={r.id} className="table-row">
                        <div className="cell product-cell">{r.product}</div>
                        <div className={`cell status-cell ${r.status === 'Geveild' ? 'sold' : 'unsold'}`}>{r.status}</div>
                        <div className="cell">{formatDate(r.veildatum)}</div>
                        <div className="cell">{formatPrice(r.verkoopbedrag)}</div>
                        <div className="cell">{r.koper}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Productenoverzicht;
