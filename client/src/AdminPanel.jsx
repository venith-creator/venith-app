import React, { useEffect, useState } from 'react';
import './AdminPanel.css';

export default function AdminPanel(/*{ token }*/) {
  const [expenses, setExpenses] = useState([]);
  const [replies, setReplies] = useState({});
  const [reviews, setReviews] = useState([]);
  const [reviewReplies, setReviewReplies] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState({ expenses: true, reviews: true});


  useEffect(() => {
    const fetchConfirmedExpenses = async () => {
      try {
        const token = localStorage.getItem('token'); 
        const res = await fetch('/api/admin/confirmed-expenses',  {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setExpenses(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to load expenses');
        console.error('Fetch expenses error:', err);
      } finally {
        setLoading(prev => ({...prev, expenses: false }));
      }
    };

    fetchConfirmedExpenses();
  }, []);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/admin/reviews', {
          headers: { 
            'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}` },
        });
        if (res.status === 403) {
          setError('Admin privileges required');
          return;
        }
        const data = await res.json();
       setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        setError('Failed to load reviews');
        console.error('Fetch reviews error:', err);
      } finally {
        setLoading(prev => ({ ...prev, reviews: false }));
      }
    };

    fetchReviews();
  }, []);

  const handleReplyChange = (id, text) => {
    setReplies(prev => ({ ...prev, [id]: text }));
  };

  const handleReplySubmit = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/reply-to-expense/${id}', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reply: replies[id] }),
      });
      const data = await res.json();
       if (!res.ok) throw new Error(data.error || 'Failed to save reply');
    
    // Update the local state to show the new reply immediately
    setExpenses(prevExpenses => 
      prevExpenses.map(exp => 
        exp.id === id 
          ? { ...exp, admin_reply: replies[id] } 
          : exp
      )
    );
    
    /*setMessage('Reply saved successfully!');
    setReplies(prev => ({ ...prev, [id]: '' }));*/
    } catch (err) {
      console.error('Reply error:', err);
      setError('Failed to send reply');
    }
  };

  const handleReviewReplyChange = (id, text) => {
    setReviewReplies(prev => ({ ...prev, [id]: text }));
  };

  const handleReviewReplySubmit = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/reply-to-review/${id}', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reply: reviewReplies[id] }),
      });
      const data = await res.json();
      setMessage(data.message || 'Review reply sent');
    } catch (err) {
      console.error('Review reply error:', err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Admin Panel – Confirmed Purchases</h2>

      {error && <p className="text-red-600">{error}</p>}
      {message && <p className="text-green-600">{message}</p>}

      {loading.expenses ? (
        <p>Loading expenses...</p>
      ) : expenses.length === 0 ? (
        <p>No confirmed expenses yet.</p>
      ) : (
        expenses.map(exp => (
          <div key={exp.id} className="admin-box">
            <p><strong>User:</strong> {exp.user_name}</p>
            <p><strong>Item:</strong> {exp.product_name}</p>
            <p><strong>Qty:</strong> {exp.quantity}</p>
            <p><strong>Price at time of purchase:</strong> ${exp.price_at_time}</p>
            <p><strong>Custom Request:</strong> {exp.custom_request || 'None'}</p>
            <p><strong>Admin Reply:</strong> {exp.admin_reply || 'No reply yet'}</p>

            <textarea
              className="w-full border mt-2 p-2"
              placeholder="Type admin reply..."
              value={replies[exp.id] || ''}
              onChange={(e) => handleReplyChange(exp.id, e.target.value)}
            />
            <button
              onClick={() => handleReplySubmit(exp.id)}
            >
              Send Reply
            </button>
          </div>
        ))
      )}

      <h2 className="text-xl font-bold mt-8 mb-4">Product Reviews</h2>

      {loading.reviews ? (
        <p>Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        reviews.map(review => (
          <div key={review.id} className="admin-box">
            <p><strong>User:</strong> {review.user_name}</p>
            <p><strong>Product:</strong> {review.product_name}</p>
            <p><strong>Review:</strong> {review.comment || review.text}</p>
            <p><strong>Rating:</strong> {review.rating}</p>
            <p><strong>Admin Reply:</strong> {review.admin_reply || 'No reply yet'}</p>

            <textarea
              className="w-full border mt-2 p-2"
              placeholder="Type admin reply..."
              value={reviewReplies[review.id] || ''}
              onChange={(e) => handleReviewReplyChange(review.id, e.target.value)}
            />
            <button
              onClick={() => handleReviewReplySubmit(review.id)}
            >
              Send Reply
            </button>
          </div>
        ))
      )}
    </div>
  );
}
