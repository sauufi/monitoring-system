// auth-service/src/routes/internal.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @route POST /internal/verify
 * @desc Verify JWT token (internal route for other services)
 * @access Internal
 */
router.post('/verify', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ valid: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret');

    // Check if user still exists
    const user = await User.findById(decoded.user.id).select('-password');
    if (!user) {
      return res.status(401).json({ valid: false, message: 'User not found' });
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    logger.error('Error verifying token (internal):', err);
    res.status(401).json({ valid: false, message: 'Invalid token' });
  }
});

/**
 * @route GET /internal/users/:id
 * @desc Get a user by ID (internal route for other services)
 * @access Internal
 */
router.get('/users/:id', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    logger.error('Error fetching user (internal):', err);
    next(err);
  }
});

/**
 * @route GET /internal/users/email/:email
 * @desc Get a user by email (internal route for other services)
 * @access Internal
 */
router.get('/users/email/:email', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.params.email }).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    logger.error('Error fetching user by email (internal):', err);
    next(err);
  }
});

module.exports = router;
