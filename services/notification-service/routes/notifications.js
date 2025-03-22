// services/notification-service/routes/notifications.js
const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { authenticate, authenticateInternal } = require('../middleware/auth');
const notificationController = require('../controllers/notificationController');

/**
 * @route   GET /api/notifications
 * @desc    Get recent notifications for the authenticated user
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const notifications = await notificationController.getRecentNotifications(req.user.id, limit);
    
    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   POST /api/notifications
 * @desc    Create and send a notification (internal API for other services)
 * @access  Private (service-to-service)
 */
router.post('/', async (req, res) => {
  try {
    // Validate required fields
    if (!req.body.userId || !req.body.type) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    // Process and send notification
    const result = await notificationController.processNotification(req.body);
    
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
});

/**
 * @route   GET /api/notifications/:id
 * @desc    Get a specific notification
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findOne({ 
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      });
    }
    
    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Get notification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark a notification as read
 * @access  Private
 */
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const result = await notificationController.markAsRead(req.params.id, req.user.id);
    
    res.json({
      success: true,
      data: result,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/read-all', authenticate, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user.id, read: { $ne: true } },
      { read: true }
    );
    
    res.json({
      success: true,
      count: result.nModified,
      message: `${result.nModified} notifications marked as read`
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   POST /api/notifications/bulk-delete
 * @desc    Delete multiple notifications
 * @access  Private
 */
router.post('/bulk-delete', authenticate, async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No notification IDs provided' 
      });
    }
    
    const result = await Notification.deleteMany({
      _id: { $in: ids },
      userId: req.user.id
    });
    
    res.json({
      success: true,
      count: result.deletedCount,
      message: `${result.deletedCount} notifications deleted`
    });
  } catch (error) {
    console.error('Bulk delete notifications error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;