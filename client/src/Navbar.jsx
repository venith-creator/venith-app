import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import logo from './assets/venith-logo.png';

export default function Navbar({ user, onLogout}) {
    const navigate = useNavigate();
    console.log('Navbar user:', user);

    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('theme') === 'dark';
    });

    useEffect(() => {
        const theme = darkMode ? 'dark' : 'light';
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [darkMode]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        onLogout();
        navigate('/login');
    };

    return (
        <nav className="navbar" style={{ padding: '1rem', background: '#f8f9fa', borderBottom: '1px solid #ccc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        }}>
          <div className="nav-links">
            <Link to="/" style={{ marginRight: '1rem' }}>
            <img src={logo} alt="Venith Logo" style={{ height: '70px', width: '80px', borderRadius: '50%' }} />
            </Link>
            <Link to="/" style={{ margin: '0 1rem', color: 'green'}}>Home</Link>
            <Link to="/about" style={{ margin: '0 1rem', color: 'green' }}>About</Link>
            <Link to="/projects" style={{ margin: '0 1rem', color: 'green'}}>My Expense Tracker</Link>
            <Link to="/products" style={{ margin: '0 1rem', color: 'green' }}>Venith Store</Link>
            {!user ? (
                <>
                    <Link to="/login" style={{ margin: '0 1rem', color: 'green'}}>Login</Link>
                    <Link to="/signup" style={{ margin: '0 1rem', color: 'green'}}>SignupForm</Link>
                </>
            ) : (
                <>
                    <Link to="/chat" style={{ margin: '0 1rem', color: 'green' }}>Messages</Link>
                    <button onClick={handleLogout} style={{ marginLeft: '1rem' }}>Logout</button>
                    <span style={{ marginLeft: '1rem', color: 'green'}}>
                        Welcome, {user.name}
                    </span>

                    {user && user.role === 'admin' && (
                        <Link to="/admin" style={{ margin: '0 1rem', color: 'red' }}>Admin Panel</Link>
                    )}

                </>
            
            )}
            </div>
            <button
                onClick={() => setDarkMode(!darkMode)}
                style={{
                    background: darkMode ? '#444' : '#ddd',
                    color: darkMode ? '#eee' : '#000',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer'
                }}
            >
                {darkMode ? '☀ Light' : '🌙 Dark'}
            </button>
        </nav>
    );
}