import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import products from './ProductListData';
import { toast } from 'react-toastify';
import './productStyle.css';

export default function ProductList() {
    const [, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleBuy = async (product) => {
        if (!window.confirm("Are you sure you want to buy this product?")) return;

        setIsSubmitting(true);
        const token = localStorage.getItem('token');

        if (!token) {
            toast.error('Please log in to buy products.');
            setIsSubmitting(false);
            return;
        }

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/expenses`, {
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
                toast.success('Product added to your expense tracker!');
            } else {
                toast.error(`Error: ${data.error || data.message}`);
            }
        } catch (err) {
            console.error('Buy failed:', err);
            toast.error('Something went wrong!');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="product-container">
            <h1>Venith Products</h1>
            <div className="product-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(autofill, minmax(200px, 1fr))', gap: '1rem'}}>
                {products.map(product => (
                    <div key={product.id} style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px'}}>
                        <img
                            src={product.image}
                            alt={product.name}
                            style={{ width: '100%', maxWidth: '150px', borderRadius: '8px', marginBottom: '1rem' }}
                        />
                        <div className="product-info">
                            <h3>{product.name}</h3>
                            <p className="text-muted">Category: {product.category}</p>
                            <p className="text-muted">Type: {product.type}</p>
                            <p className="product-price">Price: ${product.price}</p>
                            <div className="product-actions">
                                <button onClick={() => handleBuy(product)}>Buy Now</button>
                                <button onClick={() => navigate(`/product/${product.id}`)}>View Details</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}