// services/status-page-service/routes/incidents.js
const express = require('express');
const router = express.Router();
const StatusPage = require('../models/StatusPage');
const Incident = require('../models/Incident');
const { authenticate } = require('../middleware/auth');
const { validateIncident, validateIncidentUpdate } = require('../utils/validation');

/**
 * @route   POST /api/incidents
 * @desc    Create a new incident
 * @access  Private
 */
router.post('/', authenticate, async (req, res) => {
  try {
    // Validate incident data
    const { isValid, errors } = validateIncident(req.body);
    if (!isValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors 
      });
    }
    
    // Verify user owns the status page
    const statusPage = await StatusPage.findOne({ 
      _id: req.body.statusPageId,
      userId: req.user.id
    });
    
    if (!statusPage) {
      return res.status(404).json({ 
        success: false, 
        message: 'Status page not found' 
      });
    }
    
    // Create incident
    const incident = new Incident({
      statusPageId: statusPage._id,
      title: req.body.title,
      status: req.body.status || 'investigating',
      impact: req.body.impact || 'minor',
      message: req.body.message,
      components: req.body.components || [],
      scheduled: req.body.scheduled || false,
      scheduledFor: req.body.scheduledFor,
      createdBy: req.user.id,
      updates: [{
        status: req.body.status || 'investigating',
        message: req.body.message || 'We are investigating this issue',
        createdBy: req.user.id
      }]
    });
    
    await incident.save();
    
    res.status(201).json({
      success: true,
      data: incident
    });
  } catch (error) {
    console.error('Create incident error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   GET /api/incidents/:id
 * @desc    Get a specific incident
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    
    if (!incident) {
      return res.status(404).json({ 
        success: false, 
        message: 'Incident not found' 
      });
    }
    
    // Verify user owns the status page
    const statusPage = await StatusPage.findOne({
      _id: incident.statusPageId,
      userId: req.user.id
    });
    
    if (!statusPage) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
    res.json({
      success: true,
      data: incident
    });
  } catch (error) {
    console.error('Get incident error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   PUT /api/incidents/:id
 * @desc    Update an incident
 * @access  Private
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    
    if (!incident) {
      return res.status(404).json({ 
        success: false, 
        message: 'Incident not found' 
      });
    }
    
    // Verify user owns the status page
    const statusPage = await StatusPage.findOne({
      _id: incident.statusPageId,
      userId: req.user.id
    });
    
    if (!statusPage) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
    // Update incident fields
    if (req.body.title) incident.title = req.body.title;
    if (req.body.status) incident.status = req.body.status;
    if (req.body.impact) incident.impact = req.body.impact;
    if (req.body.message) incident.message = req.body.message;
    if (req.body.components) incident.components = req.body.components;
    if (req.body.scheduled !== undefined) incident.scheduled = req.body.scheduled;
    if (req.body.scheduledFor) incident.scheduledFor = req.body.scheduledFor;
    
    // If status is resolved, update resolved flag
    if (req.body.status === 'resolved') {
      incident.resolved = true;
      incident.resolvedAt = new Date();
    }
    
    await incident.save();
    
    res.json({
      success: true,
      data: incident
    });
  } catch (error) {
    console.error('Update incident error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   DELETE /api/incidents/:id
 * @desc    Delete an incident
 * @access  Private
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    
    if (!incident) {
      return res.status(404).json({ 
        success: false, 
        message: 'Incident not found' 
      });
    }
    
    // Verify user owns the status page
    const statusPage = await StatusPage.findOne({
      _id: incident.statusPageId,
      userId: req.user.id
    });
    
    if (!statusPage) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
    await incident.remove();
    
    res.json({
      success: true,
      message: 'Incident deleted successfully'
    });
  } catch (error) {
    console.error('Delete incident error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   POST /api/incidents/:id/updates
 * @desc    Add an update to an incident
 * @access  Private
 */
router.post('/:id/updates', authenticate, async (req, res) => {
  try {
    // Validate update data
    const { isValid, errors } = validateIncidentUpdate(req.body);
    if (!isValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors 
      });
    }
    
    const incident = await Incident.findById(req.params.id);
    
    if (!incident) {
      return res.status(404).json({ 
        success: false, 
        message: 'Incident not found' 
      });
    }
    
    // Verify user owns the status page
    const statusPage = await StatusPage.findOne({
      _id: incident.statusPageId,
      userId: req.user.id
    });
    
    if (!statusPage) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
    // Add update
    incident.updates.push({
      status: req.body.status,
      message: req.body.message,
      createdBy: req.user.id
    });
    
    // Update incident status
    incident.status = req.body.status;
    
    // Check if resolved
    if (req.body.status === 'resolved') {
      incident.resolved = true;
      incident.resolvedAt = new Date();
    }
    
    await incident.save();
    
    res.json({
      success: true,
      data: incident
    });
  } catch (error) {
    console.error('Add incident update error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;