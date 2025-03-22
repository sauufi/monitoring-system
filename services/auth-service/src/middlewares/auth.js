// auth-service/src/middlewares/auth.js
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

/**
 * Middleware to authenticate JWT token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.authenticate = (req, res, next) => {
  // Get token from header
  const token = req.header('Authorization')?.split(' ')[1]; // Bearer TOKEN

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret');

    // Add user to request
    req.user = decoded.user;
    next();
  } catch (err) {
    logger.error('Authentication error:', err);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

/**
 * Middleware to check if user is an admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
exports.isAdmin = (req, res, next) => {
  // Check if user exists and is an admin
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admin role required' });
  }

  next();
};

/**
 * Middleware to check if user is the resource owner or an admin
 * @param {Function} getOwnerId - Function to extract owner ID from request
 * @returns {Function} Express middleware
 */
exports.isOwnerOrAdmin = (getOwnerId) => {
  return async (req, res, next) => {
    try {
      // Get owner ID
      const ownerId = await getOwnerId(req);

      // Check if user exists and is the owner or an admin
      if (!req.user || (req.user.id !== ownerId && req.user.role !== 'admin')) {
        return res.status(403).json({ message: 'Access denied: Not authorized' });
      }

      next();
    } catch (err) {
      logger.error('Owner check error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };
};
