import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TokenValidator() {
    const navigate = useNavigate();

    useEffect(() => {
        const validateToken = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/validate-token`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (!response.ok) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                }
            } catch (error) {
                console.error('Token validation failed:', error);
                navigate('/login');
            }
        };

        validateToken();
    }, [navigate]);

    return null; // This component doesn't render anything
}