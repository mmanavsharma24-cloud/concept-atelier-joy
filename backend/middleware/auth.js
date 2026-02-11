const jwt = require('jsonwebtoken');

/**
 * Verify JWT token middleware
 * Checks if user is authenticated
 * Supports token in Authorization header or query parameter
 */
const verifyToken = (req, res, next) => {
  try {
    // Try to get token from Authorization header first
    let token = req.headers.authorization?.split(' ')[1];

    // If not in header, try query parameter (for downloads)
    if (!token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = {
  verifyToken,
};
