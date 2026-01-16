import '../styles/ActorAccount.css';
import { useEffect, useState } from 'react';

/**
 * Account
 * Toont een eenvoudige accountoverzichtspagina:
 * - Leest Bearer-token uit localStorage om ingelogd-status te bepalen
 * - Haalt de gebruikersrol op via de backend (`/api/UserManagement/role`)
 * - Toont rol en eventuele foutmelding op het scherm
 */
const Account = () => {
    // Inlogstatus op basis van aanwezigheid van accessToken.
    const hasToken = !!localStorage.getItem('accessToken');
    // Weergegeven rol; default "-" totdat API-response binnen is.
    const [role, setRole] = useState('-');
    // Eventuele foutmelding uit API-call.
    const [error, setError] = useState('');

    /**
     * Haal de huidige rol van de ingelogde gebruiker op.
     * Vereist geldig Bearer-token (anders 401). Bij succes wordt de eerste rol getoond.
     * Bij fout: toon bericht en reset rol naar '-'.
     */
    const fetchRole = async () => {
        try {
            setError('');

            const res = await fetch(`http://localhost:5102/api/UserManagement/role`, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`}
                
            });

            if (!res.ok) {
                const bodyText = await res.text();
                throw new Error(`Fout bij ophalen rol (status ${res.status}): ${bodyText}`);
            }

            const data = await res.json();
            const list = Array.isArray(data) ? data : [];

            setRole(list[0] ?? '-');
        } catch (e) {
            console.error('fetchRole error:', e);
            setRole('-');
            setError(e?.message ?? 'Onbekende fout');
        }
    };

    // Haal rol op bij initial mount.
    useEffect(() => {
        fetchRole();
    }, []);

    return (
        <div style={{ padding: '1rem' }}>
            {/* Eenvoudige accountheader + statusoverzicht */}
            <h1>Account</h1>
            <h2>Welkom, {role}</h2>
            <p><strong>Ingelogd:</strong> {hasToken ? 'Ja' : 'Nee'}</p>
            <p><strong>Rol:</strong> {role}</p>
            {/* Foutmelding uit API-call naar rol-endpoint */}
            {error ? <p style={{ color: 'crimson' }}><strong>Fout:</strong> {error}</p> : null}
        </div>
    );
};

export default Account;