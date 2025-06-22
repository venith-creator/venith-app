const jwt = require('jsonwebtoken');
const { SECRET_KEY } = require('../config');


function authenticateToken(req, res, next) {
    // Get token from multiple possible locations
    const token = req.headers['authorization']?.split(' ')[1] || 
                 req.query.token || 
                 req.cookies.token;

    if (!token) {
        console.log('❌ No token found in headers:', req.headers);
        return res.status(401).json({ error: 'Missing token' });
    }

    try {
        const decoded = jwt.verify(token.trim(), SECRET_KEY); // Note .trim()
        req.user = {
            id: decoded.id,
            name: decoded.name,
            role: decoded.role
        };
        console.log('✅ Verified User:', req.user);
        return next();
    } catch (err) {
        console.error('JWT Error:', err.message);
        console.error('Token that failed:', token);
        return res.status(403).json({ error: 'Invalid token' });
    }
}
function isAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access only' });
    } 
    next();
}

function verifyOwnerOrAdmin(req, res, next) {
    console.log('=== PERMISSION CHECK ===');
    console.log('Request User:', req.user);
    console.log('Target User ID:', req.params.id);
    console.log('Type Comparison:', {
        reqUserId_type: typeof req.user.id,
        paramId_type: typeof req.params.id,
        equality: req.user.id == req.params.id
    });
    const targetUserId = parseInt(req.params.id);
    const currentUserId = parseInt(req.user.id);
    if (req.user.role === 'admin' || currentUserId === targetUserId) {
        console.log('✅ Access granted')
        return next();
    }
    console.log('❌ Access denied');
    return res.status(403).json({ error: 'Unauthorized action' });
}

module.exports = {
    authenticateToken,
    isAdmin,
    verifyOwnerOrAdmin
};