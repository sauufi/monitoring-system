// services/notification-service/middleware/auth.js
const axios = require('axios');
const config = require('../config/config');

/**
 * Authentication middleware
 * Verifies JWT token with auth service and attaches user to request
 */
exports.authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    // Verify token with auth service
    const response = await axios.post(
      `${config.authService.url}/api/verify`,
      { token }
    );

    if (response.data.valid) {
      // Attach user to request
      req.user = response.data.user;
      next();
    } else {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Authentication failed' 
    });
  }
};

/**
 * Admin authorization middleware
 * Checks if authenticated user has admin role
 */
exports.authorizeAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin permission required' 
    });
  }
  
  next();
};

/**
 * Internal API authentication middleware
 * Verifies that request is coming from an internal service
 */
exports.authenticateInternal = (req, res, next) => {
  // In production, this should validate a shared secret or service-to-service authentication mechanism
  // For now, we'll use a simple header check
  const internalAuthHeader = req.headers['x-internal-auth'];
  
  if (!internalAuthHeader || internalAuthHeader !== process.env.INTERNAL_AUTH_KEY) {
    return res.status(401).json({ 
      success: false, 
      message: 'Internal authentication failed' 
    });
  }
  
  next();
};