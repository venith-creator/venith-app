import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import './chatStyles.css';

const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})
}

const formatDateDivider = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
};

const groupMessagesByDate = (messages) => {
  const groups = {};
  messages.forEach(msg => {
    const date = new Date(msg.created_at).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
  });
  return groups;
};

export default function ChatWindow() {
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [otherUser, setOtherUser] = useState({ name: 'User' });
    const { otherUserId } = useParams();
    const token = localStorage.getItem('token');
    const messagesEndRef = useRef(null);

    const fetchMessages = useCallback(async () => {
        if (!otherUserId) {
           console.error("No otherUserId parameter in URL");
            return;
        }

        try {
            setLoading(true);
            const userRes = await fetch('/api/chat/user/${otherUserId}', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (userRes.ok) {setOtherUser(await userRes.json());}
            
            const msgRes = await fetch('/api/chat/${otherUserId}', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!msgRes.ok) throw new Error('Failed to load messages');
            const data = await msgRes.json();
            if (data.success) {
                setMessages(data.messages || []);
            }

            await fetch('/api/chat/${otherUserId}/read', {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    }, [otherUserId, token]);
    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [fetchMessages, otherUserId, token]);       


    const handleSend = async (e) => {
        e.preventDefault();

        const trimmedMessage = newMessage.trim();
        if (!trimmedMessage)
        return;
        

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    receiver_id: otherUserId,
                    content: trimmedMessage
                })
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to send message');
            }
            const sentMessage = await res.json();
            setMessages(prev => [...prev, sentMessage]);
            setNewMessage('');
        
        } catch (err) {
            console.error('Error sending message:', err);
            alert('Failed to send message: ' + err.message);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        console.log('Current token:', token);
    }, [token]);

    useEffect(() => {
        console.log('otherUserId:', otherUserId);
    }, [otherUserId]);

    return (
        <div className="chat-container">
            {/* Chat header */}
            <div className="chat-header">
                <h3>{otherUser.name}</h3>
                <span className="status">Online</span>
            </div>
             
            <div className="messages-area">
                {loading ? (
                    <div className="loading">Loading messages...</div>
                ) : (
                    Object.entries(groupMessagesByDate(messages)).map(([date, dateMessages]) => (
            <div key={date}>
              <div className="date-divider">{formatDateDivider(date)}</div>
               {dateMessages.map(msg => {
                const currentUserId = parseInt(localStorage.getItem('user_id'));
                const direction = msg.sender_id === currentUserId ? 'outgoing' : 'incoming';
               
               return (
                    <div key={msg.id} className=
                    {`message-bubble ${msg.direction}`}>
                        <div className="message-meta">
                            {direction === 'incoming' ? otherUser.name : 'You'}
                        </div>
                            
                             <div className="message-content">
                                <p>{msg.content}</p>
                                <span className="timestamp">
                                    {formatMessageTime(msg.created_at)}
                                </span>
                                </div>
                            
                        </div>
                    ); })}
                  </div>  
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>
            
            <form className="message-input" onSubmit={handleSend}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    autoFocus
                />
                <button type="submit" className="send-button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M1.101 21.757L23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"/>
                    </svg>
                </button>
            </form>
            </div>
    );
}