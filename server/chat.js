const express = require('express');
const router = express.Router();
const pool = require('./db');
const { authenticateToken } = require('./middleware/auth');

router.use((req, res, next) => {
  console.log('Chat routes - initial user:', req.user); // Should exist
  next();
});

router.get('/debug-auth', authenticateToken, (req, res) => {
    console.log('Debug auth user:', req.user);
    res.json({
        message: "Auth successful",
        user: req.user,
        authenticated: true
    });
});

router.get('/test-middleware', 
  (req, res, next) => {
    console.log('First middleware - user exists?', !!req.user);
    next();
  },
  authenticateToken,
  (req, res) => {
    res.json({ 
      userInHandler: req.user,
      memoryAddress: `User object ref: ${Object.keys(req).find(k => req[k] === req.user)}`
    });
  }
);

router.get('/debug-user-check', authenticateToken, (req, res) => {
    if (!req.user?.id) {
        console.error('User object malformed:', req.user);
        return res.status(401).json({ error: 'User not properly authenticated' });
    }
    res.json({ 
        userExists: true,
        userId: req.user.id,
        routesWorking: {
            conversations: '/conversations',
            messages: '/:otherUserId'
        }
    });
});

router.get('/conversations-working', authenticateToken, (req, res) => {
    console.log('Final user object:', req.user); // Should match middleware
    if (!req.user?.id) {
        return res.status(400).json({ error: 'User not attached' });
    }
    res.json({ 
        success: true,
        user: req.user,
        test: "This route works" 
    });
});

router.post('/', authenticateToken, async (req, res) => {
    try {
        const { receiver_id, content } = req.body;
        
        // Basic validation
        if (!receiver_id || !content) {
            return res.status(400).json({ error: 'Missing fields' });
        }

        // Insert message (no separate receiver check - was working before)
        const result = await pool.query(
            'INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *',
            [req.user.id, receiver_id, content]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Message Send Error:', err);
        res.status(500).json({ 
            error: 'Message sending failed',
            details: err.message
        });
    }
});

router.get('/conversations', authenticateToken, async (req, res) => {
    try {
         console.log('User in conversations endpoint:', req.user); // Debug
        
        if (!req.user?.id) {
            return res.status(401).json({ error: 'User not authenticated' });
        }
        /*const userId = req.user.id;*/
        const result = await pool.query(`
            SELECT 
                u.id as user_id,
                u.name as user_name,
                MAX(m.created_at) as last_message_time,
                (SELECT content FROM messages 
                 WHERE (sender_id = u.id OR receiver_id = u.id)
                 AND (sender_id = $1 OR receiver_id = $1)
                 ORDER BY created_at DESC LIMIT 1) as last_message,
                (SELECT COUNT(*) FROM messages 
                 WHERE sender_id = u.id 
                 AND receiver_id = $1 
                 AND is_read = false) as unread_count
            FROM users u
            JOIN messages m ON (u.id = m.sender_id OR u.id = m.receiver_id)
            WHERE (m.sender_id = $1 OR m.receiver_id = $1)
            AND u.id != $1
            GROUP BY u.id
            ORDER BY last_message_time DESC`,
            [req.user.id]
        );
        const cleanedResults = result.rows.map(conv => ({
            ...conv,
            last_message: conv.last_message 
                ? conv.last_message.replace(/[\n\r]+/g, ' ').substring(0, 50)
                : 'No messages yet'
        }));

        res.json(cleanedResults);
        console.log(`Returning ${cleanedResults.length} conversations`);

    } catch (err) {
        console.error('Conversations Error:', err);
        res.status(500).json({ 
            error: 'Failed to get conversations',
            details: err.message  // Include actual error message
        });
    }
});

// Get all other users (excluding the current logged-in user)
router.get('/all-users', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name FROM users WHERE id != $1',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching all users:', err);
        res.status(500).json({ error: 'Failed to get users' });
    }
});


// Get conversation between two users 
router.get('/:otherUserId', 
  authenticateToken,
  (req, res, next) => {
    console.log('Starting message fetch for user:', req.user.id);
    next();
  },
  async (req, res) => {
    try {
      // Input validation 
      const otherUserId = parseInt(req.params.otherUserId);
      if (isNaN(otherUserId)) {
        console.warn('Invalid user ID received:', req.params.otherUserId);
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      // Database query - maintains your style but improves message retrieval
      const result = await pool.query(
        `SELECT 
          m.*, 
          u.name as sender_name,
          CASE WHEN m.sender_id = $1 THEN 'outgoing' ELSE 'incoming' END as direction
         FROM messages m
         JOIN users u ON m.sender_id = u.id
         WHERE (m.sender_id = $1 AND m.receiver_id = $2)
         OR (m.sender_id = $2 AND m.receiver_id = $1)
         ORDER BY m.created_at ASC`, 
        [req.user.id, otherUserId]
      );

      // Response formatting 
      console.log(`Fetched ${result.rows.length} messages between ${req.user.id} and ${otherUserId}`);
      res.json({
        success: true,
        messages: result.rows,
        meta: {
          current_user_id: req.user.id,
          other_user_id: otherUserId
        }
      });
    } catch (err) {
      // Error handling - matches your existing pattern
      console.error('Message fetch error:', err);
      res.status(500).json({ 
        error: 'Failed to get messages',
        details: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      });
    }
  }
);

router.get('/user/:userId', authenticateToken, async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const result = await pool.query(
            'SELECT id, name, email FROM users WHERE id = $1',
            [userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching user:', err);
        res.status(500).json({ error: 'Failed to get user details' });
    }
});

// Mark messages as read
router.patch('/:senderId/read', authenticateToken, async (req, res) => {
    try {
        const senderId = parseInt(req.params.senderId);
        if (isNaN(senderId)) return res.status(400).json({ error: 'Invalid sender ID' });
        await pool.query(
            'UPDATE messages SET is_read = TRUE WHERE sender_id = $1 AND receiver_id = $2 AND is_read = FALSE',
            [req.params.senderId, req.user.id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Error marking messages as read:', err);
        res.status(500).json({ error: 'Failed to update messages' });
    }
});

router.get('/messages/:userId', authenticateToken, async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const result = await pool.query(
            `SELECT m.*, u.name as sender_name 
             FROM messages m
             JOIN users u ON m.sender_id = u.id
             WHERE (m.sender_id = $1 AND m.receiver_id = $2)
             OR (m.sender_id = $2 AND m.receiver_id = $1)
             ORDER BY m.created_at ASC`,
            [req.user.id, userId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});
router.get('/start/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) return res.status(400).json({ error: 'Invalid user ID' });
    
    const exists = await pool.query('SELECT 1 FROM users WHERE id = $1', [userId]);
    if (exists.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    res.json({ ready: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check user' });
  }
});


router.get('/test-db', async (req, res) => {
    try {
        const test = await pool.query('SELECT 1+1 AS result');
        res.json({ dbWorking: true, result: test.rows[0].result });
    } catch (err) {
        res.status(500).json({ dbWorking: false, error: err.message });
    }
});
router.get('/validate-token', authenticateToken, (req, res) => {
    console.log('Validating token for:', req.user);
    res.json({ valid: true, user: req.user });
});

router.get('/test-connection', async (req, res) => {
  try {
    const test = await pool.query('SELECT $1::text as message', ['Database connected']);
    res.json(test.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/debug-user', authenticateToken, (req, res) => {
  console.log('Middleware user:', req.user);
  console.log('Validating token for:', req.user);
  res.json({ 
    user: req.user,
    dbCheck: `SELECT * FROM users WHERE id = ${req.user.id}`
  });
});
router.get('/super-simple', (req, res) => {
    res.json({ message: "Bypassing auth" });
});

router.get('/super-simple-authed', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});
module.exports = router;