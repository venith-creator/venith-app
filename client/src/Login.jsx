import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './gateway.css';


function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch('http://localhost:4000/api/login',{
                method: 'POST',
                headers: { 'Content-Type': 'application/json', },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            console.log("Login response:", data);

            if (!res.ok) {
                console.error('Login failed:', data);
                setError(data.message || 'Login failed');
                return;
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('user_id', data.user.id);
             onLogin({
                ...data.user,
                token: data.token // Include token in user object
            });
            alert(`Welcome back, ${data.user.name}!`)
            navigate(data.user.role === 'admin' ? '/admin' : '/projects');
        } catch (err) {
            setError('Server error');
            localStorage.removeItem('token');
            localStorage.removeItem('user')
        }
    };

    return (
        <div className="gateway-container" style={{ padding: '2rem' }}>
            <h2>Login</h2>
            {error && <p className="gateway-error" style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder="Email" value={email} onChange={(e) => 
                setEmail(e.target.value)} required /><br /><br />
                <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required /><br /><br />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default Login;