import React, { useEffect, useState } from 'react';
import './front.css';
import { toast } from 'react-toastify';


export default function Front() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetch('/api/users')
        .then((response) => response.json())
        .then((data) => {
            setUsers(data);
            setLoading(false);
        })
        .catch((error) => {
            console.error('Error fetching users', error);
            setLoading(false);
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('You need to be logged in to perform this action');
            return;
        }

        const userData = { name, email };

        console.log('Submitting with:', {
            editingId,
            currentUser: JSON.parse(localStorage.getItem('user')),
            tokenExists: !!token
        });

        try {

        if (editingId) {
            /*try {*/
                const res = await fetch(`/api/users/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                     },
                    body: JSON.stringify(userData)
            });

            const data = await res.json();
            
            if (!res.ok) {
                throw new Error(data.error || 'Failed to update user');
            }

            setUsers(users.map(u => u.id === editingId ? data : u));
            resetForm();
            toast.success('User updated successfully!');
            
        } else {
                const res = await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type' : 'application/json',
                        'Authorization': `Bearer ${token}`
                     },
                    body: JSON.stringify(userData),
                });

                const data = await res.json();

                 if (!res.ok) {
                        throw new Error(data.error || 'Failed to add user');
                    }

                    // Update UI state
                    setUsers([...users, data]);
                    resetForm();
                    toast.success('User added successfully!');
                }
                
            } catch (err) {
                // 4. Handle any errors
                console.error('Operation failed:', err);
                toast.error(err.message || 'An error occurred');
            }
        };
        const resetForm = () => {
            setName('');
            setEmail('');
            setEditingId(null);
        };

    const handleEdit = (user) => {
        console.log('Editing user:', {
        currentUser: JSON.parse(localStorage.getItem('user')),
        targetUser: user,
        comparison: JSON.parse(localStorage.getItem('user'))?.id === user.id
    });
     const currentUser = JSON.parse(localStorage.getItem('user'));
    if (currentUser?.id !== user.id && currentUser?.role !== 'admin') {
        toast.error('You can only edit your own profile');
        return;
    }
        setName(user.name);
        setEmail(user.email);
        setEditingId(user.id);
    }    
    const handleDelete = async (id) => {
        const token = localStorage.getItem('token')
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            const res = await fetch(`/api/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization' : `Bearer ${token}`}
            });
            if (res.status === 403) {
                toast.error('Only admins can delete users');
                return;
            }
            if (res.ok) {
                setUsers(users.filter(user => user.id !== id));
            } else {
                const error = await res.json();
                toast.error(error.error || 'Failed to delete user');
            } 
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Error deleting user');
        }
    };
    return (
        <div className="front-page">
            <h1 className="title"> 👋 Welcome to Venith User Hub</h1>
            <p className="intro">This is the homepage where users can register and manage their profiles.</p>
            
            <div className="form-section">
                <h2>{editingId ? 'Update User' : 'Add New User'}</h2>
                <form onSubmit={handleSubmit} className="user-form">
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Name" required />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
                    <div className="form-buttons">
                    <button type="submit">{editingId ? 'Update User' : 'Add User'}</button>
                    {editingId && <button type="button" onClick={() => {
                        setName('');
                        setEmail('');
                        setEditingId(null);
                    }}>Cancel</button>}
                    </div>
                </form>
            </div>

            <div className="user-list-section">
                 <h2>Registered Users</h2>
                {loading ? (
                    <p>Loading users...</p>
                ) : (
                <ul className="user-list">
                    {users.map(user => (
                        <li key={user.id} className="user-card">
                            <span>{user.name} - {user.email}</span>
                            <div className="user-actions">
                                {(JSON.parse(localStorage.getItem('user'))?.id === user.id || 
                                JSON.parse(localStorage.getItem('user'))?.role === 'admin') && (
                                    <button onClick={() => handleEdit(user)}>Edit</button>
                                )}
                                
                                {JSON.parse(localStorage.getItem('user'))?.role === 'admin' && (
                                    <button onClick={() => handleDelete(user.id)}>Delete</button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
                )}
            </div>
        </div>
    );
}
        