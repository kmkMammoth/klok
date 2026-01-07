import '../styles/ActorAccount.css';
import { useEffect, useState } from 'react';

const Account = () => {
    const hasToken = !!localStorage.getItem('accessToken');
    const [role, setRole] = useState('-');
    const [error, setError] = useState('');

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

    useEffect(() => {
        fetchRole();
    }, []);

    return (
        <div style={{ padding: '1rem' }}>
            <h1>Account</h1>
            <h2>Welkom, {role}</h2>
            <p><strong>Ingelogd:</strong> {hasToken ? 'Ja' : 'Nee'}</p>
            <p><strong>Rol:</strong> {role}</p>
            {error ? <p style={{ color: 'crimson' }}><strong>Fout:</strong> {error}</p> : null}
        </div>
    );
};

export default Account;