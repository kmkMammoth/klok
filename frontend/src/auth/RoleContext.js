import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const RoleContext = createContext({
    role: null,
    roles: [],
    loading: true,
    error: '',
    refresh: async () => {}
});

export function RoleProvider({ children }) {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = async () => {
        try {
            setLoading(true);
            setError('');

            const token = localStorage.getItem('accessToken');
            if (!token) {
                setRoles([]);
                return;
            }

            const res = await fetch('http://localhost:5102/api/UserManagement/role', {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.status === 401) {
                setRoles([]);
                return;
            }

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Rol ophalen faalde (status ${res.status}): ${text}`);
            }

            const data = await res.json(); // ["Koper"]
            setRoles(Array.isArray(data) ? data : []);
        } catch (e) {
            setRoles([]);
            setError(e?.message ?? 'Onbekende fout');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const value = useMemo(() => {
        const role = roles[0] ?? null;
        return { role, roles, loading, error, refresh: load };
    }, [roles, loading, error]);

    return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
    return useContext(RoleContext);
}