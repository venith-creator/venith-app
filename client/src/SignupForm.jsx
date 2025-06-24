import React, { useState } from  'react';
import './gateway.css';

function SignupForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
         [e.target.name]: e.target.value
        });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Signup successful');
                console.log('Token:', data.token);

                localStorage.setItem('token', data.token);
            } else {
                setMessage(data.message || 'Signup failed');
            }
        }catch (err) {
            console.error('Signup error:', err);
            setMessage('Error occured');
        }
    };

    return (
        <div className= "gateway-container">
            <h2>Signup</h2>
            <form onSubmit={handleSubmit}>
                <input name="name" placeholder="Name" onChange={handleChange} required /><br></br>
                <input name="email" placeholder="Email" onChange={handleChange} required /><br></br>
                <input name="password" type="password" placeholder="Password" onChange={handleChange} required /><br></br>
                <button type="submit">Signup</button>
            </form>
            <p className="gateway-message">{message}</p>
        </div>
    );
}

export default SignupForm;