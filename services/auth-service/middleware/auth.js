// services/auth-service/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware for internal service use
 * Verifies the JWT token and attaches the user to the request
 */
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized to access this route' 
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Attach user to request
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ 
          success: false, 
          message: 'User not found with this id' 
        });
      }
      
      next();
    } catch (error) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token is not valid' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server Error' 
    });
  }
};

/**
 * Role-based authorization middleware
 * Restricts access to routes based on user roles
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized to access this route' 
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `User role ${req.user.role} is not authorized to access this route` 
      });
    }
    
    next();
  };
};

/**
 * External token verification endpoint
 * Used by other services to verify tokens
 */
exports.verifyToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ 
        valid: false, 
        message: 'No token provided' 
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        valid: false, 
        message: 'User not found' 
      });
    }
    
    // Token is valid
    return res.status(200).json({ 
      valid: true, 
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name,
        role: user.role 
      } 
    });
  } catch (error) {
    return res.status(401).json({ 
      valid: false, 
      message: 'Invalid token' 
    });
  }
};