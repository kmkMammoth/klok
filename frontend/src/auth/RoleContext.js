import { createContext, useContext, useEffect, useMemo, useState } from 'react';

/**
 * RoleContext - Context voor globale rolgegevens van de ingelogde gebruiker
 * 
 * Biedt toegang tot:
 * - role: huidige rol van de gebruiker (string of null)
 * - roles: array van alle rollen (meestal bevat slechts één rol)
 * - loading: boolean of rollen nog worden opgehaald
 * - error: foutbericht indien iets is misgegaan
 * - refresh: functie om rollen opnieuw op te halen van de server
 */
const RoleContext = createContext({
    role: null,
    roles: [],
    loading: true,
    error: '',
    refresh: async () => {}
});

/**
 * RoleProvider - Context provider voor rolgegevens
 * 
 * Haalt de rol van de ingelogde gebruiker op van de /api/UserManagement/role endpoint
 * en stelt deze beschikbaar voor alle onderliggende componenten via RoleContext.
 */
export function RoleProvider({ children }) {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    /**
     * load - Haalt de rollen van de huidige gebruiker op van de server
     * 
     * Stappen:
     * 1. Controleer of er een geldige access token aanwezig is
     * 2. Maak API-call naar /api/UserManagement/role met Bearer token
     * 3. Verwerk het antwoord (array van rollennamen)
     * 4. Bij 401 (niet geauthenticeerd): wis de rollen
     * 5. Bij andere fouten: sla het foutbericht op
     */
    const load = async () => {
        try {
            setLoading(true);
            setError('');

            // Haal het access token uit localStorage (ingesteld bij login)
            const token = localStorage.getItem('accessToken');
            if (!token) {
                // Geen token = niet ingelogd, wis rollen
                setRoles([]);
                return;
            }

            // Maak API-call om de rollen op te halen
            const res = await fetch('http://localhost:5102/api/UserManagement/role', {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`  // Stuur token mee in Authorization header
                }
            });

            // Bij 401 (niet geauthenticeerd): token is verlopen of ongeldig
            if (res.status === 401) {
                setRoles([]);
                return;
            }

            // Controleer of de response succesvol is
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`Rol ophalen faalde (status ${res.status}): ${text}`);
            }

            // Parse het antwoord als JSON (verwacht: array van rollennamen, bijv. ["Koper"])
            const data = await res.json();
            setRoles(Array.isArray(data) ? data : []);
        } catch (e) {
            // Bij fout: wis rollen en sla foutbericht op
            setRoles([]);
            setError(e?.message ?? 'Onbekende fout');
        } finally {
            // Zet loading op false, ongeacht succes of fout
            setLoading(false);
        }
    };

    // Laad de rollen zodra de component wordt gemount
    // Lege dependency array = eenmalig bij mount, niet opnieuw bij updates
    useEffect(() => {
        load();
    }, []);

    // Creëer context value object met rollen en refresh functie
    // Memoized om onnodig re-renders van consumers te voorkomen
    const value = useMemo(() => {
        // Neem de eerste rol (meestal is er slechts één), of null als leeg
        const role = roles[0] ?? null;
        // Retourneer object met huidige rol, alle rollen, loading status, error, en refresh functie
        return { role, roles, loading, error, refresh: load };
    }, [roles, loading, error]);

    // Bied de context value aan alle onderliggende componenten
    return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

/**
 * useRole - Hook voor toegang tot globale rolgegevens
 * 
 * Kan alleen gebruikt worden in componenten die onderliggen aan RoleProvider.
 * Retourneert het context object met role, roles, loading, error, en refresh functie.
 */
export function useRole() {
    return useContext(RoleContext);
}