// services/status-page-service/middleware/auth.js
const axios = require('axios');
const config = require('../config/config');

/**
 * Authentication middleware
 * Verifies JWT token with auth service and attaches user to request
 */
exports.authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    // Verify with auth service
    const response = await axios.post(
      `${config.authService.url}/api/verify`,
      { token }
    );

    if (response.data.valid) {
      req.user = response.data.user;
      next();
    } else {
      res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ 
      success: false, 
      message: 'Authentication failed' 
    });
  }
};

/**
 * Admin authorization middleware
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