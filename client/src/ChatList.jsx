import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './chatStyles.css';

const formatLastMessageTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  
  // If same day, show time
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  if (date > oneWeekAgo) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }
  
  // Otherwise show short date
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export default function ChatList() {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const token = localStorage.getItem('token');
    const navigate = useNavigate();
    const [allUsers, setAllUsers] = useState([]);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                console.log('Fetching conversations with token:', token);
                setLoading(true);
                const response = await fetch('/api/chat/conversations', {
                    headers: { Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
                });
                console.log('Raw response:', response.status);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);}
                const data = await response.json();
                console.log('Conversations data:', data);
                setConversations(data);

            } catch (err) {
                console.error('Error fetching conversations:', err);
                setError(err.message);
                setConversations([]);
            } finally {
                setLoading(false);
            }
        };
        fetchConversations();
    }, [token, navigate]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('/api/chat/all-users', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) throw new Error('Could not fetch Users');
                const data = await response.json();
                setAllUsers(data);
            } catch (err) {
                console.error('Error fetching users:', err);
            }
        };
        fetchUsers();
    }, [token]);

    if (loading) return <div>Loading conversations...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
    <div className="chat-list-container">
        <h2>Your Conversations</h2>
        {conversations.length === 0 ? (
            <div className="no-chats">
                <img src="/empty-chat.png" alt="No conversations" />
                <p>No conversations yet. Start a new one!</p>
                <div className="all-users-section">
                    <h3>Start a chat with:</h3>
                    <ul>
                        {allUsers.map(user => (
                            <li key={user.id}>
                                <button
                                 className="user-start-chat"
                                onClick={() => navigate(`/chat/${user.id}`)}
                                >
                                    {user.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        ) : (
            <div>
            <div className="conversation-list">
                {conversations.map(conv => (
                    <Link 
                        to={`/chat/${conv.user_id}`} 
                        key={conv.user_id}
                        className="conversation-card"
                    ><div className="avatar">
                            {conv.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="content">
                            <div className="header">
                                <h3>{conv.user_name}</h3>
                                <span className="time">
                                    {formatLastMessageTime(conv.last_message_time)}
                                </span>
                            </div>
                            <p className="message-preview">
                                {conv.last_message || 'No messages yet'}
                                {conv.unread_count > 0 && (
                                    <span className="unread-count">
                                        {conv.unread_count}
                                    </span>)}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
            <div className="all-users-section">
                <h3>start a chat</h3>
                {allUsers
                .filter(user => !conversations.some(conv => conv.user_id === user.id))
                .map(user => (
                    <Link to={`/chat/${user.id}`} key={user.id} className="user-start-chat">
                     Start chat with {user.name}<br></br>  
                    </Link>
                ))}
            </div>
           </div>
        )}
    </div>
);}