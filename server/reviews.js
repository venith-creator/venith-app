const express = require('express');
const router = express.Router();
const pool = require('./db');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('./config');


router.get('/:productId', async (req, res) => {
    const productId  = req.params.productId;
    try {
        const result = await pool.query(
            'SELECT user_name, comment, rating, created_at, admin_reply FROM reviews WHERE product_id = $1 ORDER BY created_at DESC',
            [productId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching reviews:', err);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

router.post('/', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if(!token){
        console.log('Missing fields');
        return res.status(401).json({ error: 'Missing fields' });
    }
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const user_name = decoded.name;

        const { product_id, comment, rating } = req.body;
        console.log('Review Payload:', { product_id, comment, rating, user_name});
        if (!product_id || !comment || !rating ) {
            console.log('Missing fields:', { product_id, comment, rating });
            return res.status(400).json({ error: 'Missing fields'});
        }

        await pool.query(
            'INSERT INTO reviews(product_id, user_name, comment, rating) VALUES ($1, $2, $3, $4)',
            [product_id, user_name, comment, rating]
        );
        res.status(201).json({ message: 'Review added' });
    } catch (err) {
        console.error('Error adding review:', err);
        res.status(401).json({ error: 'Invalid  token or server error'});
    } 
});

module.exports = router;