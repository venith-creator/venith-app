
const express = require('express');
const router = express.Router();
const pool = require('./db');
const { authenticateToken, isAdmin } = require('./middleware/auth');

// ✅ Admin-only test route
router.get('/panel', authenticateToken, isAdmin, (req, res) => {
    res.json({ message: 'Welcome Admin!' });
});

// ✅ Get all confirmed expenses
router.get('/confirmed-expenses', authenticateToken, isAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                expenses.id,
                products.name AS product_name,
                expenses.quantity,
                expenses.price_at_time,
                expenses.user_id,
                users.name AS user_name,
                expenses.custom_request,
                expenses.confirmed,
                expenses.created_at
                FROM expenses
                JOIN users ON expenses.user_id = users.id
                JOIN products ON expenses.product_id = products.id
                WHERE expenses.confirmed = true
                ORDER BY expenses.id DESC

        `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching confirmed expenses:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/reviews', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT reviews.*, products.name AS product_name
        FROM reviews
        JOIN products ON reviews.product_id = products.id
        ORDER BY reviews.id DESC;

    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});


// ✅ Admin replies to an expense
router.post('/reply-to-expense/:id', authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { reply } = req.body;

    try {
        const result = await pool.query(
            'UPDATE expenses SET admin_reply = $1 WHERE id = $2 RETURNING *',
            [reply, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.json({ message: 'Reply saved for expense', expense: result.rows[0] });
    } catch (err) {
        console.error('Error replying to expense:', err);
        res.status(500).json({ error: 'Failed to save expense reply' });
    }
});


// ✅ Admin replies to a review
router.post('/reply-to-review/:id', authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { reply } = req.body;

    try {
        const result = await pool.query(
            'UPDATE reviews SET admin_reply = $1 WHERE id = $2 RETURNING *',
            [reply, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Review not found' });
        }

        res.json({ message: 'Reply saved for review', review: result.rows[0] });
    } catch (err) {
        console.error('Error replying to review:', err);
        res.status(500).json({ error: 'Failed to save review reply' });
    }
});

module.exports = router;
