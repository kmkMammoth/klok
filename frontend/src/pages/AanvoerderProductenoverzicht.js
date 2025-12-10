
import '../styles/Productenoverzicht.css';
import { useState, useEffect } from 'react';

function Productenoverzicht() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch('http://localhost:5102/api/products');
                if (!response.ok) throw new Error('Fout bij het ophalen van producten');
                const data = await response.json();
                setProducts(data);
            } catch (err) {
                setError('Kon producten niet ophalen');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const formatPrice = (price) => {
        return price != null ? `€ ${price.toFixed(2)}` : '-';
    };

    return (
        <main className="producten-container" aria-labelledby="producten-heading">
            <h1 id="producten-heading" className="producten-title">Productenoverzicht</h1>
            {loading ? (
                <p>Producten worden geladen...</p>
            ) : error ? (
                <p style={{ color: 'red' }}>{error}</p>
            ) : (
                <table className="producten-table" aria-describedby="producten-desc">
                    <caption id="producten-desc" className="sr-only">Overzicht van producten</caption>
                    <thead>
                        <tr>
                            <th scope="col">Soort</th>
                            <th scope="col">Potmaat</th>
                            <th scope="col">Steellengte</th>
                            <th scope="col">Hoeveelheid</th>
                            <th scope="col">Minimumprijs</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id} tabIndex="0">
                                <td>{product.soort}</td>
                                <td>{product.potmaat}</td>
                                <td>{product.steellengte}</td>
                                <td>{product.hoeveelheid}</td>
                                <td>{formatPrice(product.minimumprijs)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </main>
    );
}

export default Productenoverzicht;
