import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/RegisterPage.css';

const API_BASE_URL = 'http://localhost:5102/api';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState('select'); // 'select', 'koper', 'aanvoerder', 'veilingmeester'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        bedrijfsnaam: '',
        kvkNummer: '',
        bedrijfsadres: '',
        email: '',
        iban: '',
        gebruikersnaam: '',
        wachtwoord: '',
        bevestigWachtwoord: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // 验证密码匹配
        if (formData.wachtwoord !== formData.bevestigWachtwoord) {
            setError('Wachtwoorden komen niet overeen');
            setLoading(false);
            return;
        }

        try {
            let endpoint = '';
            let body = {};

            switch (step) {
                case 'koper':
                    endpoint = `${API_BASE_URL}/Register/koper`;
                    body = {
                        bedrijfsnaam: formData.bedrijfsnaam,
                        kvkNummer: formData.kvkNummer,
                        bedrijfsadres: formData.bedrijfsadres,
                        email: formData.email,
                        iban: formData.iban,
                        wachtwoord: formData.wachtwoord,
                        bevestigWachtwoord: formData.bevestigWachtwoord
                    };
                    break;
                case 'aanvoerder':
                    endpoint = `${API_BASE_URL}/Register/aanvoerder`;
                    body = {
                        bedrijfsnaam: formData.bedrijfsnaam,
                        kvkNummer: formData.kvkNummer,
                        bedrijfsadres: formData.bedrijfsadres,
                        email: formData.email,
                        iban: formData.iban,
                        wachtwoord: formData.wachtwoord,
                        bevestigWachtwoord: formData.bevestigWachtwoord
                    };
                    break;
                case 'veilingmeester':
                    endpoint = `${API_BASE_URL}/Register/veilingmeester`;
                    body = {
                        gebruikersnaam: formData.gebruikersnaam,
                        wachtwoord: formData.wachtwoord,
                        bevestigWachtwoord: formData.bevestigWachtwoord
                    };
                    break;
                default:
                    return;
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess('Registratie succesvol! U wordt doorgestuurd naar de inlogpagina...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(data.message || 'Er is een fout opgetreden bij de registratie');
            }
        } catch (err) {
            setError('Kan geen verbinding maken met de server. Probeer het later opnieuw.');
            console.error('Registration error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setStep('select');
        setFormData({
            bedrijfsnaam: '',
            kvkNummer: '',
            bedrijfsadres: '',
            email: '',
            iban: '',
            gebruikersnaam: '',
            wachtwoord: '',
            bevestigWachtwoord: ''
        });
    };

  
    const renderAccountTypeSelection = () => (
        <div className="register-card">
            <h1 className="register-title">Aanmelden</h1>
            <p className="register-subtitle">Kies een accounttype:</p>

            <div className="account-type-buttons">
                <button 
                    className="btn-account-type"
                    onClick={() => setStep('koper')}
                >
                    Koper
                </button>
                <button 
                    className="btn-account-type"
                    onClick={() => setStep('aanvoerder')}
                >
                    Aanvoerder
                </button>
                <button 
                    className="btn-account-type"
                    onClick={() => setStep('veilingmeester')}
                >
                    Veilingmeester
                </button>
            </div>

            <div className="register-footer">
                <span className="required-note">*Verplicht veld</span>
                <span className="login-prompt">
                    Al een account? <Link to="/login" className="login-link">Log hier in</Link>
                </span>
            </div>
        </div>
    );


    const renderKoperForm = () => (
        <div className="register-card register-card-large">
            <h1 className="register-title">Aanmelden kopersaccount</h1>

            {error && <div className="message error-message">{error}</div>}
            {success && <div className="message success-message">{success}</div>}

            <form onSubmit={handleSubmit} className="register-form">
                <input
                    type="text"
                    name="bedrijfsnaam"
                    value={formData.bedrijfsnaam}
                    onChange={handleChange}
                    placeholder="Bedrijfsnaam"
                    className="form-input"
                    required
                />
                <input
                    type="text"
                    name="kvkNummer"
                    value={formData.kvkNummer}
                    onChange={handleChange}
                    placeholder="KvK-nummer*"
                    required
                    maxLength="8"
                    className="form-input"
                />
                <input
                    type="text"
                    name="bedrijfsadres"
                    value={formData.bedrijfsadres}
                    onChange={handleChange}
                    placeholder="Bedrijfsadres*"
                    required
                    className="form-input"
                />
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="E-mail*"
                    required
                    className="form-input"
                />
                <input
                    type="text"
                    name="iban"
                    value={formData.iban}
                    onChange={handleChange}
                    placeholder="IBAN bedrijfsrekening*"
                    required
                    className="form-input"
                />
                <div className="password-row">
                    <input
                        type="password"
                        name="wachtwoord"
                        value={formData.wachtwoord}
                        onChange={handleChange}
                        placeholder="Wachtwoord*"
                        required
                        className="form-input"
                    />
                    <input
                        type="password"
                        name="bevestigWachtwoord"
                        value={formData.bevestigWachtwoord}
                        onChange={handleChange}
                        placeholder="Bevestig wachtwoord*"
                        required
                        className="form-input"
                    />
                </div>

                <button type="submit" className="btn-register-submit" disabled={loading}>
                    {loading ? 'BEZIG...' : 'AANMELDEN'}
                </button>
            </form>

            <div className="register-footer">
                <span className="required-note">*Verplicht veld</span>
                <span className="login-prompt">
                    Al een account? <Link to="/login" className="login-link">Log hier in</Link>
                </span>
            </div>

            <button className="btn-back" onClick={handleBack}>
                ← Terug naar accounttype selectie
            </button>
        </div>
    );


    const renderAanvoerderForm = () => (
        <div className="register-card register-card-large">
            <h1 className="register-title">Aanmelden aanvoerdersaccount</h1>

            {error && <div className="message error-message">{error}</div>}
            {success && <div className="message success-message">{success}</div>}

            <form onSubmit={handleSubmit} className="register-form">
                <input
                    type="text"
                    name="bedrijfsnaam"
                    value={formData.bedrijfsnaam}
                    onChange={handleChange}
                    placeholder="Bedrijfsnaam"
                    className="form-input"
                    required
                />
                <input
                    type="text"
                    name="kvkNummer"
                    value={formData.kvkNummer}
                    onChange={handleChange}
                    placeholder="KvK-nummer*"
                    required
                    maxLength="8"
                    className="form-input"
                />
                <input
                    type="text"
                    name="bedrijfsadres"
                    value={formData.bedrijfsadres}
                    onChange={handleChange}
                    placeholder="Bedrijfsadres*"
                    required
                    className="form-input"
                />
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="E-mail*"
                    required
                    className="form-input"
                />
                <input
                    type="text"
                    name="iban"
                    value={formData.iban}
                    onChange={handleChange}
                    placeholder="IBAN bedrijfsrekening*"
                    required
                    className="form-input"
                />
                <div className="password-row">
                    <input
                        type="password"
                        name="wachtwoord"
                        value={formData.wachtwoord}
                        onChange={handleChange}
                        placeholder="Wachtwoord*"
                        required
                        className="form-input"
                    />
                    <input
                        type="password"
                        name="bevestigWachtwoord"
                        value={formData.bevestigWachtwoord}
                        onChange={handleChange}
                        placeholder="Bevestig wachtwoord*"
                        required
                        className="form-input"
                    />
                </div>

                <button type="submit" className="btn-register-submit" disabled={loading}>
                    {loading ? 'BEZIG...' : 'AANMELDEN'}
                </button>
            </form>

            <div className="register-footer">
                <span className="required-note">*Verplicht veld</span>
                <span className="login-prompt">
                    Al een account? <Link to="/login" className="login-link">Log hier in</Link>
                </span>
            </div>

            <button className="btn-back" onClick={handleBack}>
                ← Terug naar accounttype selectie
            </button>
        </div>
    );


    const renderVeilingmeesterForm = () => (
        <div className="register-card">
            <h1 className="register-title">Aanmelden veilingmeestersaccount</h1>

            {error && <div className="message error-message">{error}</div>}
            {success && <div className="message success-message">{success}</div>}

            <form onSubmit={handleSubmit} className="register-form">
                <input
                    type="text"
                    name="gebruikersnaam"
                    value={formData.gebruikersnaam}
                    onChange={handleChange}
                    placeholder="Gebruikersnaam"
                    className="form-input"
                    required
                />
                <div className="password-row">
                    <input
                        type="password"
                        name="wachtwoord"
                        value={formData.wachtwoord}
                        onChange={handleChange}
                        placeholder="Wachtwoord*"
                        required
                        className="form-input"
                    />
                    <input
                        type="password"
                        name="bevestigWachtwoord"
                        value={formData.bevestigWachtwoord}
                        onChange={handleChange}
                        placeholder="Bevestig wachtwoord*"
                        required
                        className="form-input"
                    />
                </div>

                <button type="submit" className="btn-register-submit" disabled={loading}>
                    {loading ? 'BEZIG...' : 'AANMELDEN'}
                </button>
            </form>

            <div className="register-footer">
                <span className="required-note">*Verplicht veld</span>
                <span className="login-prompt">
                    Al een account? <Link to="/login" className="login-link">Log hier in</Link>
                </span>
            </div>

            <button className="btn-back" onClick={handleBack}>
                ← Terug naar accounttype selectie
            </button>
        </div>
    );

    const renderForm = () => {
        switch (step) {
            case 'koper':
                return renderKoperForm();
            case 'aanvoerder':
                return renderAanvoerderForm();
            case 'veilingmeester':
                return renderVeilingmeesterForm();
            default:
                return renderAccountTypeSelection();
        }
    };

    return (
        <div className="register-page">
            {/* Navigation */}
            <nav className="register-nav">
                <div className="register-nav-container">
                    <Link to="/" className="register-logo">
                        <span className="logo-text">Flora Veiling</span>
                    </Link>
                    <Link to="/login" className="btn-nav-login">Login</Link>
                </div>
            </nav>

            {/* Register Container */}
            <div className="register-container">
                {renderForm()}
            </div>
        </div>
    );
};

export default RegisterPage;

