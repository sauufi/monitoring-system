// auth-service/src/routes/profile.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { authenticate } = require('../middlewares/auth');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @route GET /api/profile
 * @desc Get current user profile
 * @access Private
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    logger.error('Error fetching user profile:', err);
    next(err);
  }
});

/**
 * @route PUT /api/profile
 * @desc Update user profile
 * @access Private
 */
router.put(
  '/',
  [
    authenticate,
    body('name', 'Name is required').notEmpty(),
    body('email', 'Please include a valid email').isEmail(),
  ],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email } = req.body;

      // Check if email already exists (if changing email)
      const user = await User.findById(req.user.id);
      if (email !== user.email) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
          return res.status(400).json({ message: 'Email already in use' });
        }
      }

      // Update user
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
          name,
          email,
          updatedAt: Date.now(),
        },
        { new: true }
      ).select('-password');

      res.json(updatedUser);
    } catch (err) {
      logger.error('Error updating user profile:', err);
      next(err);
    }
  }
);

/**
 * @route PUT /api/profile/change-password
 * @desc Change user password
 * @access Private
 */
router.put(
  '/change-password',
  [
    authenticate,
    body('currentPassword', 'Current password is required').notEmpty(),
    body('newPassword', 'New password must be at least 8 characters long').isLength({ min: 8 }),
  ],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { currentPassword, newPassword } = req.body;

      // Get user
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      user.updatedAt = Date.now();
      await user.save();

      res.json({ message: 'Password updated successfully' });
    } catch (err) {
      logger.error('Error changing password:', err);
      next(err);
    }
  }
);

/**
 * @route DELETE /api/profile
 * @desc Delete user account
 * @access Private
 */
router.delete('/', authenticate, async (req, res, next) => {
  try {
    // Delete user
    await User.findByIdAndDelete(req.user.id);

    res.json({ message: 'User account deleted successfully' });
  } catch (err) {
    logger.error('Error deleting user account:', err);
    next(err);
  }
});

module.exports = router;
