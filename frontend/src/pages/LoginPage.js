import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/LoginPage.css';

function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5102/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Login successful
                const userData = {
                    username: data.userDetails.naam,
                    name: data.name,
                    role: data.role,
                    userId: data.userId,
                    ...data.userDetails
                };
                
                login(userData);
                
                // Redirect based on role
                if (data.role === 'veilingmeester') {
                    navigate('/veilingzaal');
                } else if (data.role === 'koper') {
                    navigate('/kOverview');
                } else if (data.role === 'aanvoerder') {
                    navigate('/producten');
                } else {
                    navigate('/');
                }
            } else {
                setError(data.message || 'Ongeldige gebruikersnaam of wachtwoord');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Er is een fout opgetreden. Controleer of de server actief is.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Simple Navigation */}
            <nav className="login-navbar">
                <div className="login-nav-container">
                    <h2 className="login-logo" onClick={() => navigate('/')}>Flora Veiling</h2>
                    <div className="login-nav-buttons">
                        <button className="login-nav-btn-login active">Inloggen</button>
                        <button className="login-nav-btn-register" onClick={() => navigate('/register')}>Registreren</button>
                    </div>
                </div>
            </nav>

            <div className="login-container">
                <div className="login-card">
                    <h1>Inloggen</h1>
                    <p className="subtitle">Log in op uw account</p>
                    
                    <form onSubmit={handleSubmit}>
                        {error && <div className="error-message">{error}</div>}
                        
                        <input
                            type="text"
                            name="username"
                            placeholder="Gebruikersnaam"
                            value={formData.username}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                        />
                        
                        <input
                            type="password"
                            name="password"
                            placeholder="Wachtwoord"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                        />

                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'BEZIG MET INLOGGEN...' : 'INLOGGEN'}
                        </button>
                    </form>

                    <div className="footer-links">
                        <p className="register-link">
                            Nog geen account? <a href="/register">Registreer hier</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;

