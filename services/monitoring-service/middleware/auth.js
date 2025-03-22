// services/monitoring-service/middleware/auth.js
const axios = require('axios');

/**
 * Authentication middleware
 * Verifies the JWT token with the auth service
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
      `${process.env.AUTH_SERVICE_URL || 'http://localhost:3001'}/api/verify`,
      { token }
    );

    if (response.data.valid) {
      // Attach user data to request
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
 * Role-based authorization middleware
 */
exports.authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }
    
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden: insufficient permissions' 
      });
    }
    
    next();
  };
};