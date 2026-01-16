import { Navigate, useLocation } from 'react-router-dom';
import { useRole } from './RoleContext';

/**
 * RequireRole
 *
 * Higher-Order Component (HOC) voor rol-gebaseerde toegangscontrole.
 * Functies en verantwoordelijkheden:
 * - Wacht tot rol-data beschikbaar is (loading status).
 * - Controleert of gebruiker ingelogd is (rol aanwezig).
 * - Controleert of gebruiker de vereiste rol(len) heeft.
 * - Redirect naar login als niet ingelogd.
 * - Redirect naar home als onvoldoende permissies.
 * - Rendert children component bij succes.
 *
 * Gebruik: <RequireRole allow={['Koper', 'Admin']}><Page /></RequireRole>
 */
export default function RequireRole({ allow, children }) {
    const location = useLocation();
    // Haal huidige rol en loading-status op vanuit RoleContext
    const { role, loading } = useRole();

    // Wacht tot rol-data beschikbaar is (void undefined state)
    if (loading) return null;

    // Als geen rol beschikbaar: redirect naar login met locatie (post-login return)
    if (!role) return <Navigate to="/login" replace state={{ from: location }} />;

    // Controleer rol-permissies: als allow-lijst gespecificeerd en rol niet in lijst: redirect naar home
    if (Array.isArray(allow) && allow.length > 0 && !allow.includes(role)) {
        return <Navigate to="/" replace />;
    }

    // Alle checks geslaagd: render beschermde component
    return children;
}