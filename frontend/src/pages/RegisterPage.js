import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RegisterPage.css';

function RegisterPage() {
    const navigate = useNavigate();
    const [accountType, setAccountType] = useState(null);
    const [formData, setFormData] = useState({
        // Common fields
        bedrijfsnaam: '',
        kvkNummer: '',
        bedrijfsadres: '',
        email: '',
        iban: '',
        wachtwoord: '',
        bevestigWachtwoord: '',
        // Veilingmeester specific
        gebruikersnaam: ''
    });

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Prepare API endpoint based on account type
            const endpoint = `http://localhost:5102/api/register/${accountType}`;
            
            // Prepare request body based on account type
            let requestBody = {};
            
            if (accountType === 'veilingmeester') {
                requestBody = {
                    gebruikersnaam: formData.gebruikersnaam,
                    wachtwoord: formData.wachtwoord,
                    bevestigWachtwoord: formData.bevestigWachtwoord
                };
            } else {
                // For koper and aanvoerder
                requestBody = {
                    bedrijfsnaam: formData.bedrijfsnaam,
                    kvkNummer: formData.kvkNummer,
                    bedrijfsadres: formData.bedrijfsadres,
                    email: formData.email,
                    iban: formData.iban,
                    wachtwoord: formData.wachtwoord,
                    bevestigWachtwoord: formData.bevestigWachtwoord
                };
            }

            // Make API call
            console.log('Registratie endpoint:', endpoint);
            console.log('Request body:', requestBody);

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok && data.success) {
                // Registration successful
                alert(`Registratie succesvol! Welkom ${accountType === 'veilingmeester' ? formData.gebruikersnaam : formData.bedrijfsnaam}!`);
                navigate('/login');
            } else {
                // Registration failed
                console.error('Registration failed:', data);
                setError(data.message || 'Registratie mislukt. Probeer het opnieuw.');
            }
        } catch (err) {
            console.error('Registration error details:', err);
            setError(`Fout: ${err.message || 'Controleer of de server actief is'}`);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setAccountType(null);
        setFormData({
            bedrijfsnaam: '',
            kvkNummer: '',
            bedrijfsadres: '',
            email: '',
            iban: '',
            wachtwoord: '',
            bevestigWachtwoord: '',
            gebruikersnaam: ''
        });
    };

    // Account Type Selection
    if (!accountType) {
        return (
            <div className="register-page">
                {/* Simple Navigation */}
                <nav className="register-navbar">
                    <div className="register-nav-container">
                        <h2 className="register-logo" onClick={() => navigate('/')}>🌸 Flora Veiling</h2>
                        <div className="register-nav-buttons">
                            <button className="register-nav-btn-login" onClick={() => navigate('/login')}>Inloggen</button>
                            <button className="register-nav-btn-register active">Registreren</button>
                        </div>
                    </div>
                </nav>
                <div className="register-container">
                    <div className="register-card">
                        <h1>Aanmelden</h1>
                        <p className="subtitle">Kies een accounttype:</p>
                        
                        <div className="account-type-buttons">
                            <button 
                                className="account-type-btn"
                                onClick={() => setAccountType('koper')}
                            >
                                Koper
                            </button>
                            <button 
                                className="account-type-btn"
                                onClick={() => setAccountType('aanvoerder')}
                            >
                                Aanvoerder
                            </button>
                            <button 
                                className="account-type-btn"
                                onClick={() => setAccountType('veilingmeester')}
                            >
                                Veilingmeester
                            </button>
                        </div>

                        <div className="footer-links">
                            <p className="required-note">*Verplicht veld</p>
                            <p className="login-link">
                                Al een account? <a href="/login">Log hier in</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Registration Forms
    return (
        <div className="register-page">
            {/* Simple Navigation */}
            <nav className="register-navbar">
                <div className="register-nav-container">
                    <h2 className="register-logo" onClick={() => navigate('/')}> Flora Veiling</h2>
                    <div className="register-nav-buttons">
                        <button className="register-nav-btn-login" onClick={() => navigate('/login')}>Inloggen</button>
                        <button className="register-nav-btn-register active">Registreren</button>
                    </div>
                </div>
            </nav>
            <div className="register-container">
                <div className="register-card">
                    <h1>
                        Aanmelden {accountType === 'koper' ? 'kopersaccount' : 
                                  accountType === 'aanvoerder' ? 'aanvoerdersaccount' : 
                                  'veilingmeestersaccount'}
                    </h1>
                    
                    <form onSubmit={handleSubmit}>
                        {error && <div className="error-message">{error}</div>}
                        
                        {accountType === 'veilingmeester' ? (
                            // Veilingmeester Form
                            <>
                                <input
                                    type="text"
                                    name="gebruikersnaam"
                                    placeholder="Gebruikersnaam"
                                    value={formData.gebruikersnaam}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    required
                                />
                                <div className="form-row">
                                    <input
                                        type="password"
                                        name="wachtwoord"
                                        placeholder="Wachtwoord*"
                                        value={formData.wachtwoord}
                                        onChange={handleInputChange}
                                        className="form-input half"
                                        required
                                    />
                                    <input
                                        type="password"
                                        name="bevestigWachtwoord"
                                        placeholder="Bevestig wachtwoord*"
                                        value={formData.bevestigWachtwoord}
                                        onChange={handleInputChange}
                                        className="form-input half"
                                        required
                                    />
                                </div>
                            </>
                        ) : (
                            // Koper & Aanvoerder Form
                            <>
                                <input
                                    type="text"
                                    name="bedrijfsnaam"
                                    placeholder="Bedrijfsnaam"
                                    value={formData.bedrijfsnaam}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    required
                                />
                                <input
                                    type="text"
                                    name="kvkNummer"
                                    placeholder="KvK-nummer*"
                                    value={formData.kvkNummer}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    required
                                />
                                <input
                                    type="text"
                                    name="bedrijfsadres"
                                    placeholder="Bedrijfsadres*"
                                    value={formData.bedrijfsadres}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    required
                                />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="E-mail*"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    required
                                />
                                <input
                                    type="text"
                                    name="iban"
                                    placeholder="IBAN bedrijfsrekening*"
                                    value={formData.iban}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    required
                                />
                                <div className="form-row">
                                    <input
                                        type="password"
                                        name="wachtwoord"
                                        placeholder="Wachtwoord*"
                                        value={formData.wachtwoord}
                                        onChange={handleInputChange}
                                        className="form-input half"
                                        required
                                    />
                                    <input
                                        type="password"
                                        name="bevestigWachtwoord"
                                        placeholder="Bevestig wachtwoord*"
                                        value={formData.bevestigWachtwoord}
                                        onChange={handleInputChange}
                                        className="form-input half"
                                        required
                                    />
                                </div>
                            </>
                        )}

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'BEZIG MET AANMELDEN...' : 'AANMELDEN'}
                        </button>
                    </form>

                    <div className="footer-links">
                        <p className="required-note">*Verplicht veld</p>
                        <p className="login-link">
                            Al een account? <a href="/login">Log hier in</a>
                        </p>
                    </div>

                    <button className="back-btn" onClick={resetForm}>
                        ← Terug naar accounttype selectie
                    </button>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;

