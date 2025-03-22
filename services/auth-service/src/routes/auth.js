// auth-service/src/routes/auth.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticate } = require('../middlewares/auth');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @route POST /api/register
 * @desc Register a new user
 * @access Public
 */
router.post(
  '/register',
  [
    // Validation
    body('name', 'Name is required').notEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password must be at least 8 characters long').isLength({ min: 8 }),
  ],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password } = req.body;

      // Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create user
      user = new User({
        name,
        email,
        password,
      });

      // Hash password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      // Save user to database
      await user.save();

      // Create JWT payload
      const payload = {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      };

      // Sign token
      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'default_jwt_secret',
        { expiresIn: '24h' },
        (err, token) => {
          if (err) {
            logger.error('Error signing JWT:', err);
            return res.status(500).json({ message: 'Server error' });
          }

          res.json({
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            },
          });
        }
      );
    } catch (err) {
      logger.error('Error in user registration:', err);
      next(err);
    }
  }
);

/**
 * @route POST /api/login
 * @desc Authenticate user & get token
 * @access Public
 */
router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists(),
  ],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Create JWT payload
      const payload = {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      };

      // Sign token
      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'default_jwt_secret',
        { expiresIn: '24h' },
        (err, token) => {
          if (err) {
            logger.error('Error signing JWT:', err);
            return res.status(500).json({ message: 'Server error' });
          }

          // Update last login
          user.lastLogin = Date.now();
          user.save();

          res.json({
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            },
          });
        }
      );
    } catch (err) {
      logger.error('Error in user login:', err);
      next(err);
    }
  }
);

/**
 * @route POST /api/verify
 * @desc Verify JWT token
 * @access Public
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
    logger.error('Error verifying token:', err);
    res.status(401).json({ valid: false, message: 'Invalid token' });
  }
});

/**
 * @route POST /api/forgot-password
 * @desc Request password reset
 * @access Public
 */
router.post(
  '/forgot-password',
  [body('email', 'Please include a valid email').isEmail()],
  async (req, res, next) => {
    try {
      const { email } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        // Don't reveal that the user doesn't exist
        return res
          .status(200)
          .json({ message: 'If your email is registered, you will receive reset instructions' });
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'default_jwt_secret',
        { expiresIn: '1h' }
      );

      // Store reset token and expiry
      user.resetToken = resetToken;
      user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
      await user.save();

      // TODO: Send email with reset link

      res
        .status(200)
        .json({ message: 'If your email is registered, you will receive reset instructions' });
    } catch (err) {
      logger.error('Error in forgot password:', err);
      next(err);
    }
  }
);

/**
 * @route POST /api/reset-password
 * @desc Reset password using token
 * @access Public
 */
router.post(
  '/reset-password',
  [
    body('token', 'Token is required').notEmpty(),
    body('password', 'Password must be at least 8 characters long').isLength({ min: 8 }),
  ],
  async (req, res, next) => {
    try {
      const { token, password } = req.body;

      // Verify token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_jwt_secret');
      } catch (err) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }

      // Find user
      const user = await User.findOne({
        _id: decoded.userId,
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }

      // Update password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();

      res.json({ message: 'Password reset successful' });
    } catch (err) {
      logger.error('Error in reset password:', err);
      next(err);
    }
  }
);

module.exports = router;
