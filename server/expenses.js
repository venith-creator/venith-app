const express = require('express');
const router = express.Router();
const pool = require('./db'); // your pool connection
const { authenticateToken } = require('./middleware/auth'); 
//const jwt = require('jsonwebtoken');
//const { SECRET_KEY } = require('./config');

// POST /api/expenses (protected route)


router.get('/user', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            'SELECT * FROM expenses WHERE user_id = $1',
            [userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching user expenses:', err);
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
});

router.post('/', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { product_id,  quantity, custom_request } = req.body;

    try {
        const existing = await pool.query( `SELECT * FROM expenses WHERE user_id = $1 AND product_id = $2`,
             [userId, product_id]
         );
        if (existing.rows.length > 0){
            return res.status(409).json({ message: 'You already bought this product' });   
        }
        const productResult = await pool.query(
            'SELECT price FROM products WHERE id = $1',
            [product_id]
        );
        if (productResult.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' })
        }
        const price = productResult.rows[0].price;

        const result = await pool.query(
            `INSERT INTO expenses (user_id, product_id, price_at_time, quantity, custom_request) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [userId, product_id, price, quantity || 1, custom_request || null]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error inserting expense:', err);
        res.status(500).json({ error: 'Server error while adding expense' });
    }
});

router.put('/:id', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const expenseId = req.params.id;
    const { quantity } = req.body

    try {
        const result = await pool.query(
            `UPDATE expenses SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
            [quantity, expenseId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Expense not found'});
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating quantity:', err);
        res.status(500).json({ error: 'Failed to update quantity'});
    }
});
// PATCH /api/expenses/:id/confirm
router.patch('/:id/confirm', authenticateToken, async (req, res) => {
  const expenseId = req.params.id;
  const userId = req.user.id;
  console.log("Expense ID:", expenseId);
  console.log("User ID:", userId);


  try {
    const result = await pool.query(
      'UPDATE expenses SET confirmed = TRUE WHERE id = $1 AND user_id = $2 RETURNING *',
      [expenseId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Expense not found or not yours' });
    }

    res.json({ message: 'Expense confirmed', expense: result.rows[0] });
  } catch (err) {
    console.error('Error confirming expense:', err);
    res.status(500).json({ error: 'Something went wrong' });
  } console.log("Received confirm request for ID:", expenseId);
});


router.delete('/:id', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const expenseId = req.params.id;

    try {
        const result = await pool.query(
            `DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING *`,
            [expenseId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.json({ message: 'Expense deleted', expense: result.rows[0] });
    } catch (err) {
        console.error('Error deleting expense:', err);
        res.status(500).json({ error: 'Failed to delete expense' });
    }
});


module.exports = router;
