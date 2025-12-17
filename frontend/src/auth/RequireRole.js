import { Navigate, useLocation } from 'react-router-dom';
import { useRole } from './RoleContext';

export default function RequireRole({ allow, children }) {
    const location = useLocation();
    const { role, loading } = useRole();

    if (loading) return null;

    if (!role) return <Navigate to="/login" replace state={{ from: location }} />;

    if (Array.isArray(allow) && allow.length > 0 && !allow.includes(role)) {
        return <Navigate to="/" replace />;
    }

    return children;
}