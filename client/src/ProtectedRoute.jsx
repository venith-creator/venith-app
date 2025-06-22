import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children , requireAdmin = false}) {
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        console.log('[ProtectedRoute] Auth check:', { token, user });
        
        setIsAuthenticated(!!token && !!user);
        setIsAdmin(user?.role === 'admin');
        setIsChecking(false);
    }, []);

    if (isChecking) {
        return <div>Loading...</div>; // Or your custom loader
    }

    if (!isAuthenticated) {
        console.warn('Redirecting to login - missing auth data');
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && !isAdmin) {
        console.warn('Admin access denied');
        return <Navigate to="/" replace />;
    }

    return children;
}
        