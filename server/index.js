const express = require('express');
const cors = require('cors');
const app = express();
const pool = require('./db');
const PORT = 4000;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('./config');
const expenseRoutes = require('./expenses');
const reviewsRoute = require('./reviews');
const productsRoute = require('./products');
const adminRoutes = require('./admin');
const { authenticateToken, verifyOwnerOrAdmin } = require('./middleware/auth');
const chatRoutes = require('./chat');
const path = require('path');
const fs = require('fs');

console.log('POOL:', pool);

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use((req, res, next) => {
  console.log('Request reached main middleware');
  next();
});
app.use((req, res, next) => {
    console.log('Incoming headers:', req.headers);
    next();
});
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewsRoute);
app.use('/api/expenses', expenseRoutes);
app.use('/api/products', productsRoute);
app.use('/api/chat', chatRoutes);

const originalGet = app.get;
app.get = function(path, ...handlers) {
  console.log(`Registering GET route: ${path}`); // Log all GET routes
  return originalGet.call(this, path, ...handlers);
};

app.post('/api/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {

        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0){
            return res.status(400).json({ message: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, hashedPassword, 'user']
        );

        const user = result.rows[0];

        const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, SECRET_KEY, { expiresIn: '7d'});
        console.log('Generated token:', token);

        res.json({ user, token });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Signup failed' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (result.rows.length === 0) {
            return res.status(400).json({ message: 'User not found'});

        }
        const user = result.rows[0];

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid password'});

        }
        const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, SECRET_KEY, { expiresIn: '7d'});
        console.log('Generated token:', token);

        res.json({
            user: {
                id: user.id, name: user.name, email: user.email, role: user.role
            },
            token
        });
    }catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed' })
    }
});

app.get('/api/items', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM items ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');

    }
});

pool.query('SELECT * FROM items LIMIT 1')
  .then(res => console.log('✅ Connected to items table:', res.rows))
  .catch(err => console.error('❌ items table error:', err));


app.post('/api/items', async (req, res) => {
    const {name, quantity, price, category } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO items (name, quantity, price, category) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, quantity, price, category]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error')
    }
});

app.delete('/api/items/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM items WHERE id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted', user: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

app.put('/api/items/:id', async (req, res) => {
    const { id } = req.params;
    const { name, quantity, price, category } = req.body;
    try {
        const result = await pool.query(
            'UPDATE items SET name = $1, quantity =$2, price = $3, category = $4 WHERE id = $5 RETURNING *',
            [name, quantity, price, category, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updting item:', err);
        res.status(500).json({ error: 'Failed to update item'});
    }
});

// Confirm an expense
// -------------------- USERS ROUTES --------------------

// GET all users
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// POST new user
app.post('/api/users', async (req, res) => {
    const { name, email } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
            [name, email]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// DELETE user
app.delete('/api/users/:id', authenticateToken, verifyOwnerOrAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        // Prevent deleting yourself
        if (req.user.id === parseInt(id)) {
            return res.status(400).json({ error: 'Cannot delete yourself' });
        }
        const result = await pool.query(
            'DELETE FROM users WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'User deleted', user: result.rows[0] });
    } catch (err) {
        console.error(err);
        if (err.code === '23503') {
            // PostgreSQL foreign key violation
            return res.status(400).json({
                error: 'Cannot delete user because they have linked purchases or reviews. Delete those first.'
            });
        }

        res.status(500).send('Server error');
    }
});

app.put('/api/users/:id', authenticateToken, verifyOwnerOrAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;

    try { 
        if (email) {
            const emailCheck = await pool.query(
                'SELECT id FROM users WHERE email = $1 AND id != $2',
                [email, id]
            );
            if (emailCheck.rows.length > 0) {
                return res.status(400).json({ error: 'Email already in use' });
            }
        }
        const result = await pool.query(
            'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
            [name, email, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

app.get('/api/validate-token', authenticateToken, (req, res) => {
    res.json({
        valid: true,
        user: req.user,
        isAdmin: req.user.role === 'admin'
    });
});

const buildPath = path.join(__dirname, '../client/build/index.html');
if (fs.existsSync(buildPath)) {
    app.use(express.static(path.join(__dirname, '../client/build')));

    app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    });
} else {
  console.warn('⚠️ React build folder not found. Skipping static file serving.');
}

/*const clientBuildPath = path.join(__dirname, '../client/build');
const indexHtmlPath = path.join(clientBuildPath, 'index.html');

// Only serve React static files if the build exists
if (fs.existsSync(indexHtmlPath)) {
  app.use(express.static(clientBuildPath));

  // Catch-all to handle client-side routing in React
  app.get('*', (req, res) => {
    res.sendFile(indexHtmlPath);
  });
} else {
  console.warn('⚠️ React build folder not found. Skipping static file serving.');
}*/


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
});