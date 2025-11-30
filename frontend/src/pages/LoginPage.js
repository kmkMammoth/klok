import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';

const API_BASE_URL = 'http://localhost:5102/api';

const LoginPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/Auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    gebruikersnaam: formData.email,
                    wachtwoord: formData.password
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Sla gebruikersgegevens op in localStorage
                localStorage.setItem('user', JSON.stringify({
                    gebruikerId: data.gebruikerId,
                    gebruikersnaam: data.gebruikersnaam,
                    accountType: data.accountType,
                    roleId: data.roleId
                }));

                // Navigeer naar de juiste pagina op basis van accounttype
                switch (data.accountType) {
                    case 'veilingmeester':
                        navigate('/dashboard');
                        break;
                    case 'koper':
                        navigate('/veilingzaal');
                        break;
                    case 'aanvoerder':
                        navigate('/producten');
                        break;
                    default:
                        navigate('/veilingzaal');
                }
            } else {
                setError(data.message || 'Inloggen mislukt');
            }
        } catch (err) {
            setError('Kan geen verbinding maken met de server. Probeer het later opnieuw.');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Navigation */}
            <nav className="login-nav">
                <div className="login-nav-container">
                    <Link to="/" className="login-logo">
                        <span className="logo-text">Flora Veiling</span>
                    </Link>
                    <Link to="/register" className="btn-nav-register">Registreren</Link>
                </div>
            </nav>

            {/* Login Card */}
            <div className="login-container">
                <div className="login-card">
                    <div className="login-avatar">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="avatar-icon">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                    </div>
                    
                    <h1 className="login-title">Welkom terug</h1>
                    <p className="login-subtitle">Log in op uw account om door te gaan</p>

                    {error && <div className="message error-message">{error}</div>}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="email">E-mailadres of Gebruikersnaam</label>
                            <input
                                type="text"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Voer uw e-mail of gebruikersnaam in"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Wachtwoord</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Voer uw wachtwoord in"
                                required
                            />
                        </div>

                        <div className="form-options">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleChange}
                                />
                                <span className="checkbox-custom"></span>
                                Onthoud mij
                            </label>
                            <Link to="/forgot-password" className="forgot-link">
                                Wachtwoord vergeten?
                            </Link>
                        </div>

                        <button type="submit" className="btn-login-submit" disabled={loading}>
                            {loading ? 'BEZIG...' : 'INLOGGEN'}
                        </button>
                    </form>

                    <p className="register-prompt">
                        Nog geen account? <Link to="/register" className="register-link">Registreer nu</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
