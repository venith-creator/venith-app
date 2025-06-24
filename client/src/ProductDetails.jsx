import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import products from './ProductListData';
import { useEffect, useState }  from 'react';
import { toast } from 'react-toastify';
import './productStyle.css';

export default function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const product = products.find(p => p.id === parseInt(id));
    const [reviews, setReviews] = useState([]);
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(5);
    const [hasPurchased, setHasPurchased] = useState(false);
    const [, setIsSubmitting] = useState(false);
    const token = localStorage.getItem('token');


    useEffect(() => {
        const checkPurchase = async () => {
        if (!token || !product) return false;

        try {
            const res = await fetch('/api/expenses/user', {
                headers: { 'Authorization': `Bearer ${token}`}
            });

            const data = await res.json();
            setHasPurchased(data.some(e => e.product_id === product.id));
        } catch (err) {
            console.error('Error checking purchase:', err);
            return false;
        }

    };
        checkPurchase();
    }, [product, token]);

    useEffect(() => {
    const fetchReviews = async () => {
        try {
            const res = await fetch(`/api/reviews/${product.id}`);
            const data = await res.json();
            setReviews(data);
        } catch (err) {
            console.error('Error fetching reviews:', err);
        }
    };

    if (product) {
        fetchReviews();
    }
}, [product]);


    const handleBuy = async () => {
        if (!window.confirm("Are you sure you want to buy this product?")) return;

        setIsSubmitting(true);
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Please log in to add to your expense tracker.')
            navigate('/login');
            return;
        } try {
            const res = await fetch('/api/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    product_id: product.id,
                    name: product.name,
                    category: product.category,
                    price: product.price
                })
            });

            const data = await res.json();

            if (res.ok) {
                toast.error('Product added to your expense tracker!');
            } else {
                toast.error(`Error: ${data.error || data.message}`);
            }
        } catch (err) {
            console.error('Buy failed:', err);
            toast.error('Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    if(!product) {
        return <div className="product-container">Product not found</div>;
    }

    return(
        <div className="product-container" >
             <div className="product-detail">
                <div>
                    <img src={product.image} alt={product.name} className="detail-image" />
                </div>
                <div className="detail-info">
                    <h2>{product.name}</h2>
                    <p className="detail-meta"><strong>Category:</strong> {product.category}</p>
                    <p className="detail-meta"><strong>Type:</strong> {product.type}</p>
                    <p className="detail-meta"><strong>Price: </strong> ${product.price}</p>
                    <div className="detail-rating"><strong>Rating:</strong> {'⭐'.repeat(Math.floor(product.rating))}{product.rating % 1 ? '½' : ''} ({product.rating})</div>
                    <p className="detail-description">{product.description}</p>

                <div className="product-actions">
                    <button onClick={handleBuy}>Buy Now</button>
                    <button onClick={() => navigate(-1)} style={{ marginLeft: '1rem' }}>Back</button>
                </div>
                {token && !hasPurchased && (
                    <p className="text-muted mt-2" >Buy this product to leave a review.</p>
                )}
               </div> 
            </div> 


            {/* Reviews Placeholder */}
            <div className="review-section">
                <h3>Customer Reviews</h3>

            {token && hasPurchased &&(
                <div className="review-form"> 
                    <h4>Leave a review</h4>
                    <textarea placeholder="Your review..." value={comment} onChange={(e) => setComment(e.target.value)}
                    className="review-textarea"
                    />
                    <label>
                        Rating:
                        <select value={rating} onChange={(e) => setRating(parseInt(e.target.value))}>{
                            [1, 2, 3, 4, 5].map(n => (
                                <option key={n} value={n}>{n}</option>
                            ))
                            }</select>
                    </label><br /><br />
                    <button className="btn btn-primary mt-2" onClick={async () => {
                        if(!comment.trim()){
                            alert('please write a comment before submitting.');
                            return;
                        }
                        try {
                            const res = await fetch('/api/reviews', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({
                                    product_id: product.id,
                                    comment,
                                    rating
                                })
                            });
                            const data = await res.json();

                            if (res.ok) {
                                alert('Review added!');
                                setComment('');
                                setRating(5);
                                //refresh reviews
                                const refreshed = await fetch(`/api/reviews/${product.id}`);
                                const newReviews = await refreshed.json();
                                setReviews(newReviews);
                            } else {
                                alert(data.error || 'Error adding review');
                            }
                        } catch (err) {
                            console.error('Review error:', err);
                            alert('Something went wrong');
                        }
                    }}>
                        Submit Review
                    </button>
                </div>

            )}
            
                {reviews.length === 0 ? (
                    <p className="text-muted">No reviews yet.</p>
                ) : (
                    <div className="review-list">
                        {reviews.map((review, idx) => (
                            <div key={idx} className="review-item">
                                <div className="review-header">
                                    <span className="review-user">{review.user_name}</span>
                                    <span className="review-date">
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </span>
                                </div> 
                                <div className="review-rating">{'⭐'.repeat(review.rating)} ({review.rating})</div>
                                <p className="review-text">{review.comment || review.text}</p>
                                {(review.admin_reply || review.reply) && (
                                    <div className="admin-reply" style={{
                                                background: '#f0f4f8',
                                                padding: '12px',
                                                marginTop: '10px',
                                                borderLeft: '4px solid #4a6baf',
                                                borderRadius: '0 4px 4px 0'
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    marginBottom: '6px'
                                                }}>
                                                    <span style={{
                                                        fontWeight: 'bold',
                                                        color: '#4a6baf',
                                                        marginRight: '8px'
                                                    }}>
                                                        ADMIN REPLY
                                                    </span>
                                                    {review.updated_at && (
                                                        <span style={{
                                                            fontSize: '0.8rem',
                                                            color: '#666'
                                                            }}>
                                                                {new Date(review.updated_at).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                        
                                        <p style={{ margin: 0 }}>{review.admin_reply || review.reply}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    )}
            </div>
        </div>
    );
}