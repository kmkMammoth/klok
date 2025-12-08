import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Login.css';

const Login = () => {
    //TODO: rotzooi van li opruimen! dit staat nu nog allemaal zo om het effe werkend te krijgen maar dit moet nog goed gemaakt worden!
    
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        emailOrUsername: '',
        password: ''
    });
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        // Basic validation
        const newErrors = {};
        if (!formData.emailOrUsername.trim()) {
            newErrors.emailOrUsername = 'E-mailadres of gebruikersnaam is verplicht';
        }
        if (!formData.password) {
            newErrors.password = 'Wachtwoord is verplicht';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsLoading(false);
            return;
        }

        try {
            // TODO: Replace with actual API call
            // const response = await fetch('http://localhost:5102/api/auth/login', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         emailOrUsername: formData.emailOrUsername,
            //         password: formData.password,
            //         rememberMe
            //     })
            // });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // For now, just redirect to home page
            // In production, you would handle the response and store tokens
            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            }
            // Store user info to indicate login
            localStorage.setItem('user', JSON.stringify({ username: formData.emailOrUsername }));

            navigate('/');
        } catch (error) {
            setErrors({ 
                general: 'Inloggen mislukt. Controleer uw gegevens en probeer het opnieuw.' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            {/* Navigation */}
            {/*<HomeNavbar activePage="/login" hideLoginButton={true} hideRegisterButton={false} />*/}

            {/* Login Form */}
            <div className="login-container">
                <div className="login-card">
                    <div className="login-avatar">
                        <svg className="avatar-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>

                    <h1 className="login-title">Welkom terug</h1>
                    <p className="login-subtitle">Log in op uw account om door te gaan</p>

                    <form className="login-form" onSubmit={handleSubmit}>
                        {errors.general && (
                            <div className="message error-message">
                                {errors.general}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="emailOrUsername">E-mailadres of Gebruikersnaam</label>
                            <input
                                type="text"
                                id="emailOrUsername"
                                name="emailOrUsername"
                                value={formData.emailOrUsername}
                                onChange={handleChange}
                                placeholder="Voer uw e-mail of gebruikersnaam in"
                            />
                            {errors.emailOrUsername && (
                                <span className="error-message">{errors.emailOrUsername}</span>
                            )}
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
                            />
                            {errors.password && (
                                <span className="error-message">{errors.password}</span>
                            )}
                        </div>

                        <div className="form-options">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span className="checkbox-custom"></span>
                                <span>Onthoud mij</span>
                            </label>
                            <Link to="/forgot-password" className="forgot-link">
                                Wachtwoord vergeten?
                            </Link>
                        </div>

                        <button 
                            type="submit" 
                            className="btn-login-submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'INLOGGEN...' : 'INLOGGEN'}
                        </button>
                    </form>

                    <div className="register-prompt">
                        <span>Nog geen account?</span>
                        <Link to="/register" className="register-link">
                            Registreer nu
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

