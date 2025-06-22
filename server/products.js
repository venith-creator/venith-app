const express = require('express');
const router = express.Router();
const pool = require('./db');

// GET /api/products - Fetch all products
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, price FROM products ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

module.exports = router;
