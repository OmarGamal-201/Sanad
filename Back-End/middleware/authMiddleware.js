const jwt = require('jsonwebtoken');
const User = require('../model/userModel');

// ─── Middleware to verify Token ──────────────────────────────────────────────
exports.protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Fetch user and attach to request
        req.user = await User.findById(decoded.id).select('-password');
        
        if (!req.user) {
            return res.status(401).json({ message: 'User not found, token invalid' });
        }

        next();
    } catch (err) {
        console.error('AUTH MIDDLEWARE ERROR:', err);
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

// ─── Middleware to restrict access based on Role ─────────────────────────────
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `User role '${req.user.role}' is not authorized to access this route` 
            });
        }
        next();
    };
};