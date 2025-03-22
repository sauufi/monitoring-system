// services/notification-service/routes/channels.js
const express = require('express');
const router = express.Router();
const Channel = require('../models/Channel');
const { authenticate } = require('../middleware/auth');
const emailService = require('../services/emailService');
// Import other channel services as needed

/**
 * @route   GET /api/channels
 * @desc    Get all notification channels for the authenticated user
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const channels = await Channel.find({ userId: req.user.id });
    res.json({
      success: true,
      data: channels
    });
  } catch (error) {
    console.error('Get channels error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   POST /api/channels
 * @desc    Create a new notification channel
 * @access  Private
 */
router.post('/', authenticate, async (req, res) => {
  try {
    // Check if user already has a channel with the same name
    const existingChannel = await Channel.findOne({ 
      userId: req.user.id,
      name: req.body.name
    });
    
    if (existingChannel) {
      return res.status(400).json({ 
        success: false, 
        message: 'Channel with this name already exists' 
      });
    }
    
    // Create new channel
    const channel = new Channel({
      ...req.body,
      userId: req.user.id,
      verified: false
    });
    
    // Validate channel config based on type
    try {
      await channel.validate();
    } catch (validationError) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: validationError.errors 
      });
    }
    
    // For email channels, send verification email
    if (channel.type === 'email') {
      try {
        const verification = await emailService.verifyChannel(channel);
        
        // Save verification code to channel
        channel.verificationCode = verification.verificationCode;
        channel.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      } catch (error) {
        return res.status(400).json({ 
          success: false, 
          message: 'Failed to send verification email', 
          error: error.message 
        });
      }
    }
    
    await channel.save();
    
    res.status(201).json({
      success: true,
      data: channel,
      message: channel.type === 'email' ? 
        'Channel created. Please verify with the code sent to your email.' :
        'Channel created successfully'
    });
  } catch (error) {
    console.error('Create channel error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   GET /api/channels/:id
 * @desc    Get a specific notification channel
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const channel = await Channel.findOne({ 
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!channel) {
      return res.status(404).json({ 
        success: false, 
        message: 'Channel not found' 
      });
    }
    
    res.json({
      success: true,
      data: channel
    });
  } catch (error) {
    console.error('Get channel error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   PUT /api/channels/:id
 * @desc    Update a notification channel
 * @access  Private
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    // Find channel
    const channel = await Channel.findOne({ 
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!channel) {
      return res.status(404).json({ 
        success: false, 
        message: 'Channel not found' 
      });
    }
    
    // Check if updating critical fields that require re-verification
    const needsVerification = (
      channel.type === 'email' &&
      req.body.config?.email &&
      channel.config.email !== req.body.config.email
    );
    
    // Update fields
    Object.keys(req.body).forEach(key => {
      channel[key] = req.body[key];
    });
    
    // If critical fields changed, reset verification
    if (needsVerification) {
      channel.verified = false;
      
      // Send new verification email
      try {
        const verification = await emailService.verifyChannel(channel);
        
        // Save verification code to channel
        channel.verificationCode = verification.verificationCode;
        channel.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      } catch (error) {
        return res.status(400).json({ 
          success: false, 
          message: 'Failed to send verification email', 
          error: error.message 
        });
      }
    }
    
    await channel.save();
    
    res.json({
      success: true,
      data: channel,
      message: needsVerification ? 
        'Channel updated. Please verify with the code sent to your email.' :
        'Channel updated successfully'
    });
  } catch (error) {
    console.error('Update channel error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   DELETE /api/channels/:id
 * @desc    Delete a notification channel
 * @access  Private
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const channel = await Channel.findOneAndDelete({ 
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!channel) {
      return res.status(404).json({ 
        success: false, 
        message: 'Channel not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'Channel deleted successfully'
    });
  } catch (error) {
    console.error('Delete channel error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   POST /api/channels/:id/verify
 * @desc    Verify a notification channel with verification code
 * @access  Private
 */
router.post('/:id/verify', authenticate, async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ 
        success: false, 
        message: 'Verification code is required' 
      });
    }
    
    const channel = await Channel.findOne({ 
      _id: req.params.id,
      userId: req.user.id,
      verified: false
    });
    
    if (!channel) {
      return res.status(404).json({ 
        success: false, 
        message: 'Channel not found or already verified' 
      });
    }
    
    // Check verification code
    if (
      !channel.verificationCode || 
      channel.verificationCode !== code || 
      !channel.verificationExpires ||
      channel.verificationExpires < new Date()
    ) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired verification code' 
      });
    }
    
    // Mark as verified
    channel.verified = true;
    channel.verificationCode = undefined;
    channel.verificationExpires = undefined;
    
    await channel.save();
    
    res.json({
      success: true,
      data: channel,
      message: 'Channel verified successfully'
    });
  } catch (error) {
    console.error('Verify channel error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   POST /api/channels/:id/test
 * @desc    Test a notification channel
 * @access  Private
 */
router.post('/:id/test', authenticate, async (req, res) => {
  try {
    const channel = await Channel.findOne({ 
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!channel) {
      return res.status(404).json({ 
        success: false, 
        message: 'Channel not found' 
      });
    }
    
    if (!channel.verified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Channel not verified' 
      });
    }
    
    // Test based on channel type
    let testResult;
    
    if (channel.type === 'email') {
      const testNotification = {
        title: 'Test Notification',
        message: 'This is a test notification to verify your email channel is working correctly.',
        data: {}
      };
      
      testResult = await emailService.sendNotification(testNotification, channel);
    } else {
      return res.status(400).json({ 
        success: false, 
        message: `Testing ${channel.type} channels is not implemented yet` 
      });
    }
    
    res.json({
      success: true,
      message: 'Test notification sent successfully',
      result: testResult
    });
  } catch (error) {
    console.error('Test channel error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send test notification', 
      error: error.message 
    });
  }
});

module.exports = router;