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
        <main className="producten-container" aria-labelledby="producten-heading">
            <h1 id="producten-heading" className="producten-title">Productenoverzicht</h1>

            <table className="producten-table" aria-describedby="producten-desc">
                <caption id="producten-desc" className="sr-only">Overzicht van producten en veilingstatussen</caption>
                <thead>
                    <tr>
                        <th scope="col">Product</th>
                        <th scope="col">Status</th>
                        <th scope="col">Veildatum</th>
                        <th scope="col">Verkoopbedrag</th>
                        <th scope="col">Koper</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map(r => (
                        // tabIndex voor toetsenbordnavigatie
                        <tr key={r.id} tabIndex="0"> 
                            <td className="product-cell">{r.product}</td>
                            <td className={`status-cell ${r.status === 'Geveild' ? 'sold' : 'unsold'}`} aria-label={`Status: ${r.status}`}>{r.status}</td>
                            <td>{formatDate(r.veildatum)}</td>
                            <td>{formatPrice(r.verkoopbedrag)}</td>
                            <td>{r.koper}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </main>
    );
}

export default Productenoverzicht;
