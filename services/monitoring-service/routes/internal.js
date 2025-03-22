// services/monitoring-service/routes/internal.js
const express = require('express');
const router = express.Router();
const Monitor = require('../models/Monitor');
const Event = require('../models/Event');

/**
 * @route   GET /internal/monitors/:id
 * @desc    Get monitor details (internal API for status page service)
 * @access  Private (service-to-service)
 */
router.get('/monitors/:id', async (req, res) => {
  try {
    const monitor = await Monitor.findById(req.params.id);
    
    if (!monitor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Monitor not found' 
      });
    }
    
    res.json({
      id: monitor._id,
      name: monitor.name,
      type: monitor.type,
      status: monitor.status,
      lastChecked: monitor.lastChecked
    });
  } catch (error) {
    console.error('Get internal monitor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /internal/monitors/:id/events
 * @desc    Get monitor events (internal API for status page service)
 * @access  Private (service-to-service)
 */
router.get('/monitors/:id/events', async (req, res) => {
  try {
    const monitor = await Monitor.findById(req.params.id);
    
    if (!monitor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Monitor not found' 
      });
    }
    
    const limit = parseInt(req.query.limit) || 10;
    
    const events = await Event.find({ monitorId: monitor._id })
      .sort({ createdAt: -1 })
      .limit(limit);
    
    res.json(events);
  } catch (error) {
    console.error('Get internal events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /internal/monitors/:id/uptime
 * @desc    Get monitor uptime (internal API for status page service)
 * @access  Private (service-to-service)
 */
router.get('/monitors/:id/uptime', async (req, res) => {
  try {
    const monitor = await Monitor.findById(req.params.id);
    
    if (!monitor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Monitor not found' 
      });
    }
    
    const days = parseInt(req.query.days) || 30;
    const uptimePercentage = await Event.calculateUptime(monitor._id, days);
    
    res.json({
      monitor: monitor._id,
      days,
      uptimePercentage
    });
  } catch (error) {
    console.error('Get internal uptime error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;