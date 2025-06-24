import React, { useEffect, useState } from 'react';
import './projectStyle.css';

export default function Projects  () {
    const [expenses, setExpenses] = useState([]);
    const [error, setError] = useState('');
    const [productId, setProductId]  = useState('');
    const [quantity, setQuantity] = useState(1);
    const [customRequest, setCustomRequest] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/api/products`);
                const data = await res.json();
                console.log("Product data:", data);
                setProducts(data);
            } catch (err) {
                console.error('Failed to fetch product:', err);
            }
        };
        fetchProducts();
        fetchExpenses();
    }, []);

    const total = expenses.reduce((sum, item) => {
        const price = parseFloat(item.price_at_time || 0);
        return sum + price * (item.quantity || 1);
    }, 0);

        const fetchExpenses = async () => {
            try {
                const token = localStorage.getItem('token');

                if (!token) {
                    setError('User not logged in.');
                    return;
                }

                const res = await fetch(`${process.env.REACT_APP_API_URL}/api/expenses/user`, {
                    headers: { Authorization: `Bearer ${token}`},
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Failed to fetch expenses');
                }

                const data = await res.json();
                setExpenses(data);
            } catch (err) {
                setError(err.message);
            }
        };

    const handleBuyNow = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        const token = localStorage.getItem('token');
        if (!token) {
            setError('User not logged in.');
            return;
        }

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/expenses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    product_id: productId,
                    quantity,
                    custom_request: customRequest,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create expense');
            }

            // Add new expense to list
            setExpenses([...expenses, data]);

            // Show success and reset form
            setSuccessMsg('✅ Expense created successfully!');
            setProductId('');
            setQuantity(1);
            setCustomRequest('');
        } catch (err) {
            setError(err.message);
        }
        await fetchExpenses();
    };

    const handleQuantityChange = async (id, newQty) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/expenses/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ quantity: newQty })
            });

            if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to update quantity');
            }

            // Update local state
            const updated = expenses.map(item =>
            item.id === id ? { ...item, quantity: newQty } : item
            );
            setExpenses(updated);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleConfirm = async (expenseId) => {
        const token = localStorage.getItem('token');
        if(!token) {
            setError("User not logged in");
            return;
        }

        try{
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/expenses/${expenseId}/confirm`,{
                method: 'PATCH',
                headers: {
                    Authorization : `Bearer ${token}`
                }
            });
            console.log("Confirming expense ID:", expenseId);

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to confirm expense');
            }
            await fetchExpenses();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        if (!window.confirm("Are you sure you want to delete this expense?")) return;

        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/expenses/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to delete expense');
            }

            // Update local state
            setExpenses(expenses.filter(item => item.id !== id));
        } catch (err) {
            setError(err.message);
        }
    };
    return (
        <div className="projects-container">
            <h2 className="text-3xl font-bold mb-6">🧾 My Expenses</h2>
            <form onSubmit={handleBuyNow} className="expense-form">
                <h3 className="text-xl font-semibold">🛒 Buy or Request a Product</h3>

                <div>
                    <label className="block mb-2">
                        Product:
                        <select
                            className="w-full border rounded p-2"
                            value={productId}
                            onChange={(e) => setProductId(e.target.value)}
                            required
                        >
                            <option value="">Select a product</option>
                            {products.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.product_name || p.title || p.name}
                            </option>
                            ))}
                        </select>
                    </label>
                </div>

                <div>
                    <label className="block font-medium">Quantity:</label>
                    <input
                        type="number"
                        value={quantity}
                        min="1"
                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                        required
                    />
                </div>

                <div>
                    <label className="block font-medium">Custom Request (optional):</label>
                    <textarea
                        value={customRequest}
                        onChange={(e) => setCustomRequest(e.target.value)}
                        className="border px-3 py-2 w-full"
                        rows="2"
                        placeholder="e.g., Please deliver fast"
                    />
                </div>

                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Buy Now
                </button>

                {/* Show success or error messages below the form */}
                {successMsg && <p className="success-msg">{successMsg}</p>}
                {error && <p className="error-msg">{error}</p>}
            </form>


            {/* Show error if one exists */}
            {error && <p className="error-msg">{error}</p>}

            {/* If no expenses, show message. Otherwise, show the list */}
            {expenses.length === 0 ? (
                <p>No expenses yet.</p>
            ) : (
               <div className="p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-h-screen">
                    <table className="expense-table">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left">Product ID</th>
                                <th className="px-4 py-2 text-left">Qty</th>
                                <th className="px-4 py-2 text-left">Price</th>
                                <th className="px-4 py-2 text-left">Custom Request</th>
                                <th className="px-4 py-2 text-left">Confirmed</th>
                                <th className="px-4 py-2 text-left">Created At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map(exp => (
                                <tr key={exp.id} className="border-t">
                                    <td className="px-4 py-2">{products.find(p => p.id === exp.product_id)?.name || `ID ${exp.product_id}` }</td>
                                    <td className="px-4 py-2"><input type="number" value={exp.quantity} min="1" 
                                    onChange={e => handleQuantityChange(exp.id, parseInt(e.target.value) || 1) } className="w-16 p-1 border rounded"></input></td>
                                    <td className="px-4 py-2">${parseFloat(exp.price_at_time || 0).toFixed(2)}</td>
                                    <td className="px-4 py-2">{exp.custom_request || 'None'}</td>
                                    <td className="px-4 py-2">{exp.confirmed ? '✅ Confirmed' : ( <button onClick={() => handleConfirm(exp.id)}> Confirm </button> )}</td>
                                    <td className="px-4 py-2">
                                        {exp.admin_reply ? (
                                            <div className="admin-response">
                                                <strong>Admin:</strong> {exp.admin_reply}
                                            </div>
                                        ) : 'No response yet'}
                                    </td>
                                    <td className="px-4 py-2">{new Date(exp.created_at).toLocaleString()}</td>
                                    <td className="px-4 py-2"><button onClick={() => handleDelete(exp.id)}>Delete</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div> 
            )}
            <div className="total-display">
                Total Spent: ${total.toFixed(2)}
            </div>
        </div>
    )
}