import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css';

const Register = () => {
    //TODO: rotzooi van li opruimen! dit staat nu nog allemaal zo om het effe werkend te krijgen maar dit moet nog goed gemaakt worden!

    const navigate = useNavigate();
    const [selectedType, setSelectedType] = useState(null);

    const accountTypes = [
        { id: 'koper', name: 'Koper', label: 'Koper' },
        { id: 'aanvoerder', name: 'Aanvoerder', label: 'Aanvoerder' },
        { id: 'veilingmeester', name: 'Veilingmeester', label: 'Veilingmeester' }
    ];

    const handleTypeSelect = (type) => {
        setSelectedType(type);
    };

    const handleBack = () => {
        setSelectedType(null);
    };

    return (
        <div className="register-page">
            {/*<HomeNavbar activePage="/register" hideLoginButton={false} hideRegisterButton={true} />*/}
            
            <div className="register-container">
                {!selectedType ? (
                    <div className="register-card">
                        <h1 className="register-title">Aanmelden</h1>
                        <p className="register-subtitle">Kies een accounttype:</p>
                        
                        <div className="account-type-buttons">
                            {accountTypes.map(type => (
                                <button
                                    key={type.id}
                                    className="account-type-btn"
                                    onClick={() => handleTypeSelect(type.id)}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>

                        <div className="register-footer">
                            <span className="required-note">*Verplicht veld</span>
                            <div className="login-prompt">
                                <span>Al een account?</span>
                                <a href="/login" className="login-link">Log hier in</a>
                            </div>
                        </div>
                    </div>
                ) : (
                    <RegisterForm accountType={selectedType} onBack={handleBack} />
                )}
            </div>
        </div>
    );
};

//TODO: rotzooi van li opruimen! dit staat nu nog allemaal zo om het effe werkend te krijgen maar dit moet nog goed gemaakt worden!

const RegisterForm = ({ accountType, onBack }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        bedrijfsnaam: '',
        kvkNummer: '',
        bedrijfsadres: '',
        email: '',
        iban: '',
        wachtwoord: '',
        bevestigWachtwoord: '',
        gebruikersnaam: '' // Only for Veilingmeester
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const accountTypeLabels = {
        koper: 'kopersaccount',
        aanvoerder: 'aanvoerdersaccount',
        veilingmeester: 'veilingmeestersaccount'
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (accountType === 'veilingmeester') {
            if (!formData.gebruikersnaam.trim()) {
                newErrors.gebruikersnaam = 'Gebruikersnaam is verplicht';
            }
        } else {
            if (!formData.bedrijfsnaam.trim()) {
                newErrors.bedrijfsnaam = 'Bedrijfsnaam is verplicht';
            }
            if (!formData.kvkNummer.trim()) {
                newErrors.kvkNummer = 'KvK-nummer is verplicht';
            }
            if (!formData.bedrijfsadres.trim()) {
                newErrors.bedrijfsadres = 'Bedrijfsadres is verplicht';
            }
            if (!formData.email.trim()) {
                newErrors.email = 'E-mail is verplicht';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                newErrors.email = 'Ongeldig e-mailadres';
            }
            if (!formData.iban.trim()) {
                newErrors.iban = 'IBAN bedrijfsrekening is verplicht';
            }
        }

        if (!formData.wachtwoord) {
            newErrors.wachtwoord = 'Wachtwoord is verplicht';
        } else if (formData.wachtwoord.length < 6) {
            newErrors.wachtwoord = 'Wachtwoord moet minimaal 6 tekens lang zijn';
        }

        if (accountType !== 'veilingmeester') {
            if (!formData.bevestigWachtwoord) {
                newErrors.bevestigWachtwoord = 'Bevestig wachtwoord is verplicht';
            } else if (formData.wachtwoord !== formData.bevestigWachtwoord) {
                newErrors.bevestigWachtwoord = 'Wachtwoorden komen niet overeen';
            }
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsLoading(false);
            return;
        }

        try {
            // Prepare request data based on account type
            const requestData = {
                Password: formData.wachtwoord
            };

            if (accountType === 'veilingmeester') {
                requestData.UserName = formData.gebruikersnaam;
            } else {
                requestData.UserName = formData.bedrijfsnaam;
                requestData.KvkNummer = formData.kvkNummer;
                requestData.Adres = formData.bedrijfsadres;
                requestData.Email = formData.email;
                requestData.IbanHash = formData.iban;
            }

            if (accountType === 'veilingmeester') {
                const response = await fetch('http://localhost:5102/api/Veilingmeester/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestData)
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Registratie mislukt');
                }
            }else if (accountType === 'koper') {
                const response = await fetch('http://localhost:5102/api/Koper/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestData)
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Registratie mislukt');
                }
            }else if (accountType === 'aanvoerder') {
                const response = await fetch('http://localhost:5102/api/Aanvoerder/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestData)
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Registratie mislukt');
                }
            }        

            // Redirect to login page after successful registration
            navigate('/login', { state: { message: 'Registratie succesvol! U kunt nu inloggen.' } });
        } catch (error) {
            setErrors({ 
                general: error.message || 'Registratie mislukt. Probeer het opnieuw.' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-card">
            <h1 className="register-title">Aanmelden {accountTypeLabels[accountType]}</h1>
            
            <form className="register-form" onSubmit={handleSubmit}>
                {errors.general && (
                    <div className="message error-message">
                        {errors.general}
                    </div>
                )}

                {accountType === 'veilingmeester' ? (
                    <>
                        <div className="form-group">
                            <label htmlFor="gebruikersnaam">Gebruikersnaam</label>
                            <input
                                type="text"
                                id="gebruikersnaam"
                                name="gebruikersnaam"
                                value={formData.gebruikersnaam}
                                onChange={handleChange}
                                placeholder="Voer uw gebruikersnaam in"
                                className={errors.gebruikersnaam ? 'input-error' : ''}
                            />
                            {errors.gebruikersnaam && (
                                <span className="error-message">{errors.gebruikersnaam}</span>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="form-group">
                            <label htmlFor="bedrijfsnaam">Bedrijfsnaam</label>
                            <input
                                type="text"
                                id="bedrijfsnaam"
                                name="bedrijfsnaam"
                                value={formData.bedrijfsnaam}
                                onChange={handleChange}
                                placeholder="Voer uw bedrijfsnaam in"
                                className={errors.bedrijfsnaam ? 'input-error' : ''}
                            />
                            {errors.bedrijfsnaam && (
                                <span className="error-message">{errors.bedrijfsnaam}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="kvkNummer">KvK-nummer*</label>
                            <input
                                type="text"
                                id="kvkNummer"
                                name="kvkNummer"
                                value={formData.kvkNummer}
                                onChange={handleChange}
                                placeholder="Voer uw KvK-nummer in"
                                className={errors.kvkNummer ? 'input-error' : ''}
                            />
                            {errors.kvkNummer && (
                                <span className="error-message">{errors.kvkNummer}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="bedrijfsadres">Bedrijfsadres*</label>
                            <input
                                type="text"
                                id="bedrijfsadres"
                                name="bedrijfsadres"
                                value={formData.bedrijfsadres}
                                onChange={handleChange}
                                placeholder="Voer uw bedrijfsadres in"
                                className={errors.bedrijfsadres ? 'input-error' : ''}
                            />
                            {errors.bedrijfsadres && (
                                <span className="error-message">{errors.bedrijfsadres}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">E-mail*</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Voer uw e-mailadres in"
                                className={errors.email ? 'input-error' : ''}
                            />
                            {errors.email && (
                                <span className="error-message">{errors.email}</span>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="iban">IBAN bedrijfsrekening*</label>
                            <input
                                type="text"
                                id="iban"
                                name="iban"
                                value={formData.iban}
                                onChange={handleChange}
                                placeholder="Voer uw IBAN in"
                                className={errors.iban ? 'input-error' : ''}
                            />
                            {errors.iban && (
                                <span className="error-message">{errors.iban}</span>
                            )}
                        </div>
                    </>
                )}

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="wachtwoord">Wachtwoord*</label>
                        <input
                            type="password"
                            id="wachtwoord"
                            name="wachtwoord"
                            value={formData.wachtwoord}
                            onChange={handleChange}
                            placeholder="Voer uw wachtwoord in"
                            className={errors.wachtwoord ? 'input-error' : ''}
                        />
                        {errors.wachtwoord && (
                            <span className="error-message">{errors.wachtwoord}</span>
                        )}
                    </div>

                    {accountType !== 'veilingmeester' && (
                        <div className="form-group">
                            <label htmlFor="bevestigWachtwoord">Bevestig wachtwoord</label>
                            <input
                                type="password"
                                id="bevestigWachtwoord"
                                name="bevestigWachtwoord"
                                value={formData.bevestigWachtwoord}
                                onChange={handleChange}
                                placeholder="Bevestig uw wachtwoord"
                                className={errors.bevestigWachtwoord ? 'input-error' : ''}
                            />
                            {errors.bevestigWachtwoord && (
                                <span className="error-message">{errors.bevestigWachtwoord}</span>
                            )}
                        </div>
                    )}
                </div>

                <button 
                    type="submit" 
                    className="btn-register-submit"
                    disabled={isLoading}
                >
                    {isLoading ? 'AANMELDEN...' : 'AANMELDEN'}
                </button>
            </form>

            <div className="register-footer">
                <span className="required-note">*Verplicht veld</span>
                <div className="login-prompt">
                    <span>Al een account?</span>
                    <a href="/login" className="login-link">Log hier in</a>
                </div>
            </div>

            <button className="btn-back" onClick={onBack}>
                ← Terug naar accounttype selectie
            </button>
        </div>
    );
};

export default Register;

