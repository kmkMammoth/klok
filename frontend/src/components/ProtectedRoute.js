import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    // Check if user is logged in
    // For now, we'll check if there's a user in localStorage or sessionStorage
    // In production, you would check for a valid authentication token
    const isAuthenticated = 
        localStorage.getItem('user') || 
        sessionStorage.getItem('user') || 
        localStorage.getItem('rememberMe') === 'true';

    if (!isAuthenticated) {
        // Redirect to login page if not authenticated
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;

