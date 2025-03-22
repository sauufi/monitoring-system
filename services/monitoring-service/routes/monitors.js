// services/monitoring-service/routes/monitors.js
const express = require('express');
const router = express.Router();
const Monitor = require('../models/Monitor');
const Event = require('../models/Event');
const { authenticate } = require('../middleware/auth');
const { validateMonitor } = require('../utils/validation');
const monitoringController = require('../controllers/monitoringController');

/**
 * @route   GET /api/monitors
 * @desc    Get all monitors for authenticated user
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const monitors = await Monitor.find({ userId: req.user.id });
    res.json(monitors);
  } catch (error) {
    console.error('Get monitors error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   POST /api/monitors
 * @desc    Create a new monitor
 * @access  Private
 */
router.post('/', authenticate, async (req, res) => {
  try {
    // Validate monitor data
    const { isValid, errors } = validateMonitor(req.body);
    if (!isValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors 
      });
    }
    
    // Create monitor
    const monitor = new Monitor({
      ...req.body,
      userId: req.user.id
    });
    
    await monitor.save();
    
    // Schedule the initial check
    monitoringController.scheduleMonitor(monitor);
    
    res.status(201).json({
      success: true,
      data: monitor
    });
  } catch (error) {
    console.error('Create monitor error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   GET /api/monitors/:id
 * @desc    Get a specific monitor
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const monitor = await Monitor.findOne({ 
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!monitor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Monitor not found' 
      });
    }
    
    res.json({
      success: true,
      data: monitor
    });
  } catch (error) {
    console.error('Get monitor error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   PUT /api/monitors/:id
 * @desc    Update a monitor
 * @access  Private
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    // Validate monitor data
    const { isValid, errors } = validateMonitor(req.body);
    if (!isValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors 
      });
    }
    
    // Find and update monitor
    const monitor = await Monitor.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!monitor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Monitor not found' 
      });
    }
    
    // Re-schedule the monitoring if needed
    if (req.body.interval || req.body.active !== undefined) {
      monitoringController.scheduleMonitor(monitor);
    }
    
    res.json({
      success: true,
      data: monitor
    });
  } catch (error) {
    console.error('Update monitor error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   DELETE /api/monitors/:id
 * @desc    Delete a monitor
 * @access  Private
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const monitor = await Monitor.findOneAndDelete({ 
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!monitor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Monitor not found' 
      });
    }
    
    // Unschedule the monitoring job
    monitoringController.removeMonitorSchedule(monitor._id);
    
    res.json({
      success: true,
      message: 'Monitor deleted successfully'
    });
  } catch (error) {
    console.error('Delete monitor error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   GET /api/monitors/:id/events
 * @desc    Get events for a specific monitor
 * @access  Private
 */
router.get('/:id/events', authenticate, async (req, res) => {
  try {
    // Check if monitor exists and belongs to user
    const monitor = await Monitor.findOne({ 
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!monitor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Monitor not found' 
      });
    }
    
    // Get query parameters
    const limit = parseInt(req.query.limit) || 100;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    const status = req.query.status; // Optional status filter
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
    
    // Build query
    const query = { monitorId: monitor._id };
    if (status && ['up', 'down'].includes(status)) {
      query.status = status;
    }
    if (startDate && endDate) {
      query.createdAt = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.createdAt = { $gte: startDate };
    } else if (endDate) {
      query.createdAt = { $lte: endDate };
    }
    
    // Get events with pagination
    const events = await Event.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Event.countDocuments(query);
    
    res.json({
      success: true,
      data: events,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   GET /api/monitors/:id/uptime
 * @desc    Get uptime statistics for a monitor
 * @access  Private
 */
router.get('/:id/uptime', authenticate, async (req, res) => {
  try {
    // Check if monitor exists and belongs to user
    const monitor = await Monitor.findOne({ 
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!monitor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Monitor not found' 
      });
    }
    
    // Get days parameter (default to 30)
    const days = parseInt(req.query.days) || 30;
    
    // Calculate uptime percentage
    const uptimePercentage = await Event.calculateUptime(monitor._id, days);
    
    // Get uptime history for chart data
    const uptimeHistory = await monitoringController.getUptimeHistory(monitor._id, days);
    
    res.json({
      success: true,
      data: {
        monitor: monitor._id,
        days,
        uptimePercentage,
        uptimeHistory
      }
    });
  } catch (error) {
    console.error('Get uptime error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   POST /api/monitors/:id/test
 * @desc    Run a test check on a monitor
 * @access  Private
 */
router.post('/:id/test', authenticate, async (req, res) => {
  try {
    // Check if monitor exists and belongs to user
    const monitor = await Monitor.findOne({ 
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!monitor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Monitor not found' 
      });
    }
    
    // Run test check
    const result = await monitoringController.performCheck(monitor, true);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Test monitor error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;