import '../styles/Footer.css';

function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="footer" role="contentinfo">
            <div className="footer-container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <img
                            className="footer-logo"
                            src="/logo-flora-veiling.png"
                            alt="Flora Veiling"
                        />
                        <p className="footer-description">
                            Flora Veiling — aflopende veiling voor de beste bloemen tegen de beste prijzen.
                        </p>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-title">Contact</h4>
                        <ul className="footer-meta">
                            <li>info@floraveiling.nl</li>
                            <li>+31 (0) 67 676 6767</li>
                            <li>Zoetermeer, NL</li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p className="footer-copy">© {year} Flora Veiling. Alle rechten voorbehouden.</p>
                    <ul className="footer-bottom-links">
                        <li><a href="/" className="footer-bottom-link">Privacy</a></li>
                        <li><a href="/" className="footer-bottom-link">Voorwaarden</a></li>
                    </ul>
                </div>
            </div>
        </footer>
    );
}

export default Footer;