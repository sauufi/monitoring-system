// services/status-page-service/routes/statusPages.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const StatusPage = require('../models/StatusPage');
const StatusPageMonitor = require('../models/StatusPageMonitor');
const Incident = require('../models/Incident');
const { authenticate } = require('../middleware/auth');
const { validateStatusPage } = require('../utils/validation');
const config = require('../config/config');

/**
 * @route   POST /api/status-pages
 * @desc    Create a new status page
 * @access  Private
 */
router.post('/', authenticate, async (req, res) => {
  try {
    // Validate status page data
    const { isValid, errors } = validateStatusPage(req.body);
    if (!isValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors 
      });
    }
    
    // Create a URL-friendly slug if not provided
    if (!req.body.slug) {
      const slugify = require('../utils/validation').slugify;
      req.body.slug = slugify(req.body.name);
    }
    
    // Check if slug is already in use
    const existingPage = await StatusPage.findOne({ slug: req.body.slug });
    if (existingPage) {
      return res.status(400).json({ 
        success: false,
        message: 'This slug is already in use' 
      });
    }
    
    // Create status page
    const statusPage = new StatusPage({
      ...req.body,
      userId: req.user.id
    });
    
    await statusPage.save();
    
    res.status(201).json({
      success: true,
      data: statusPage
    });
  } catch (error) {
    console.error('Create status page error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   GET /api/status-pages
 * @desc    Get all status pages for the authenticated user
 * @access  Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const statusPages = await StatusPage.find({ userId: req.user.id });
    
    res.json({
      success: true,
      data: statusPages
    });
  } catch (error) {
    console.error('Get status pages error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   GET /api/status-pages/:id
 * @desc    Get a specific status page
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const statusPage = await StatusPage.findOne({ 
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!statusPage) {
      return res.status(404).json({ 
        success: false, 
        message: 'Status page not found' 
      });
    }
    
    res.json({
      success: true,
      data: statusPage
    });
  } catch (error) {
    console.error('Get status page error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   PUT /api/status-pages/:id
 * @desc    Update a status page
 * @access  Private
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    // Don't allow changing the slug if it's already set
    if (req.body.slug) {
      delete req.body.slug;
    }
    
    // Validate status page data
    const { isValid, errors } = validateStatusPage(req.body);
    if (!isValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors 
      });
    }
    
    // Update status page
    const statusPage = await StatusPage.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    
    if (!statusPage) {
      return res.status(404).json({ 
        success: false, 
        message: 'Status page not found' 
      });
    }
    
    res.json({
      success: true,
      data: statusPage
    });
  } catch (error) {
    console.error('Update status page error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   DELETE /api/status-pages/:id
 * @desc    Delete a status page
 * @access  Private
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const statusPage = await StatusPage.findOneAndDelete({ 
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!statusPage) {
      return res.status(404).json({ 
        success: false, 
        message: 'Status page not found' 
      });
    }
    
    // Also delete related monitors and incidents
    await StatusPageMonitor.deleteMany({ statusPageId: statusPage._id });
    await Incident.deleteMany({ statusPageId: statusPage._id });
    
    res.json({
      success: true,
      message: 'Status page deleted successfully'
    });
  } catch (error) {
    console.error('Delete status page error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   POST /api/status-pages/:id/monitors
 * @desc    Add a monitor to a status page
 * @access  Private
 */
router.post('/:id/monitors', authenticate, async (req, res) => {
  try {
    const statusPage = await StatusPage.findOne({ 
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!statusPage) {
      return res.status(404).json({ 
        success: false, 
        message: 'Status page not found' 
      });
    }
    
    // Verify that user owns the monitor through the monitoring service
    try {
      await axios.get(
        `${config.monitoringService.url}/api/monitors/${req.body.monitorId}`,
        {
          headers: {
            Authorization: req.headers.authorization
          }
        }
      );
    } catch (error) {
      return res.status(404).json({ 
        success: false, 
        message: 'Monitor not found or unauthorized' 
      });
    }
    
    // Check if monitor is already on this status page
    const existingMonitor = await StatusPageMonitor.findOne({
      statusPageId: statusPage._id,
      monitorId: req.body.monitorId
    });
    
    if (existingMonitor) {
      return res.status(400).json({ 
        success: false, 
        message: 'Monitor is already on this status page' 
      });
    }
    
    // Create status page monitor
    const monitor = new StatusPageMonitor({
      statusPageId: statusPage._id,
      monitorId: req.body.monitorId,
      displayName: req.body.displayName,
      description: req.body.description,
      order: req.body.order || 0,
      visible: req.body.visible !== undefined ? req.body.visible : true,
      group: req.body.group
    });
    
    await monitor.save();
    
    // Add to status page monitors array
    statusPage.monitors.push(monitor._id);
    await statusPage.save();
    
    res.status(201).json({
      success: true,
      data: monitor
    });
  } catch (error) {
    console.error('Add status page monitor error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   GET /api/status-pages/:id/monitors
 * @desc    Get monitors for a status page
 * @access  Private
 */
router.get('/:id/monitors', authenticate, async (req, res) => {
  try {
    const statusPage = await StatusPage.findOne({ 
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!statusPage) {
      return res.status(404).json({ 
        success: false, 
        message: 'Status page not found' 
      });
    }
    
    const monitors = await StatusPageMonitor.find({ statusPageId: statusPage._id });
    
    // Get actual monitor details from monitoring service
    const monitorDetails = await Promise.all(
      monitors.map(async monitor => {
        try {
          const response = await axios.get(
            `${config.monitoringService.url}/api/monitors/${monitor.monitorId}`,
            {
              headers: {
                Authorization: req.headers.authorization
              }
            }
          );
          
          return {
            ...monitor.toObject(),
            details: response.data.data
          };
        } catch (error) {
          return {
            ...monitor.toObject(),
            details: { error: 'Monitor not found' }
          };
        }
      })
    );
    
    res.json({
      success: true,
      data: monitorDetails
    });
  } catch (error) {
    console.error('Get status page monitors error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   PUT /api/status-pages/:pageId/monitors/:monitorId
 * @desc    Update a monitor on a status page
 * @access  Private
 */
router.put('/:pageId/monitors/:monitorId', authenticate, async (req, res) => {
  try {
    const statusPage = await StatusPage.findOne({ 
      _id: req.params.pageId,
      userId: req.user.id
    });
    
    if (!statusPage) {
      return res.status(404).json({ 
        success: false, 
        message: 'Status page not found' 
      });
    }
    
    // Update monitor
    const monitor = await StatusPageMonitor.findOneAndUpdate(
      { _id: req.params.monitorId, statusPageId: statusPage._id },
      req.body,
      { new: true }
    );
    
    if (!monitor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Monitor not found on this status page' 
      });
    }
    
    res.json({
      success: true,
      data: monitor
    });
  } catch (error) {
    console.error('Update status page monitor error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   DELETE /api/status-pages/:pageId/monitors/:monitorId
 * @desc    Remove a monitor from a status page
 * @access  Private
 */
router.delete('/:pageId/monitors/:monitorId', authenticate, async (req, res) => {
  try {
    const statusPage = await StatusPage.findOne({ 
      _id: req.params.pageId,
      userId: req.user.id
    });
    
    if (!statusPage) {
      return res.status(404).json({ 
        success: false, 
        message: 'Status page not found' 
      });
    }
    
    const monitor = await StatusPageMonitor.findOneAndDelete({ 
      _id: req.params.monitorId,
      statusPageId: statusPage._id
    });
    
    if (!monitor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Monitor not found on this status page' 
      });
    }
    
    // Remove from status page monitors array
    statusPage.monitors = statusPage.monitors.filter(
      m => m.toString() !== monitor._id.toString()
    );
    await statusPage.save();
    
    res.json({
      success: true,
      message: 'Monitor removed from status page'
    });
  } catch (error) {
    console.error('Remove status page monitor error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   GET /api/status-pages/:id/incidents
 * @desc    Get incidents for a status page
 * @access  Private
 */
router.get('/:id/incidents', authenticate, async (req, res) => {
  try {
    const statusPage = await StatusPage.findOne({ 
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!statusPage) {
      return res.status(404).json({ 
        success: false, 
        message: 'Status page not found' 
      });
    }
    
    const incidents = await Incident.find({ statusPageId: statusPage._id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: incidents
    });
  } catch (error) {
    console.error('Get incidents error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;