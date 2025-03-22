// services/status-page-service/routes/internal.js
const express = require('express');
const router = express.Router();
const StatusPage = require('../models/StatusPage');
const StatusPageMonitor = require('../models/StatusPageMonitor');
const Incident = require('../models/Incident');

/**
 * @route   POST /internal/incidents/auto
 * @desc    Create or update an incident automatically (from monitoring service)
 * @access  Internal
 */
router.post('/incidents/auto', async (req, res) => {
  try {
    const { monitorId, status, message } = req.body;
    
    if (!monitorId || !status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }
    
    // Find status pages that include this monitor
    const statusPageMonitors = await StatusPageMonitor.find({ monitorId });
    
    // Process for each status page
    const results = await Promise.all(statusPageMonitors.map(async (spMonitor) => {
      try {
        // Find the status page
        const statusPage = await StatusPage.findById(spMonitor.statusPageId);
        if (!statusPage) {
          return {
            success: false,
            message: 'Status page not found',
            monitorId,
            statusPageId: spMonitor.statusPageId
          };
        }
        
        // Check if there's already an active incident for this monitor
        const existingIncident = await Incident.findOne({
          statusPageId: spMonitor.statusPageId,
          resolved: false,
          'components.monitorId': monitorId
        });
        
        if (status === 'down' && !existingIncident) {
          // Create new incident
          const incident = new Incident({
            statusPageId: spMonitor.statusPageId,
            title: `${spMonitor.displayName} is down`,
            status: 'investigating',
            impact: 'minor', // Default, could be based on monitor importance
            message: message || 'Automatically detected downtime',
            components: [{
              monitorId: monitorId,
              name: spMonitor.displayName,
              status: 'major_outage'
            }],
            updates: [{
              status: 'investigating',
              message: message || 'Automatically detected downtime'
            }],
            createdBy: null // System-generated
          });
          
          await incident.save();
          
          return {
            success: true,
            action: 'created',
            incidentId: incident._id,
            statusPageId: spMonitor.statusPageId
          };
        } else if (status === 'up' && existingIncident) {
          // Resolve incident
          existingIncident.updates.push({
            status: 'resolved',
            message: 'Service has recovered'
          });
          
          existingIncident.status = 'resolved';
          existingIncident.resolved = true;
          existingIncident.resolvedAt = new Date();
          
          // Update component status
          const componentIndex = existingIncident.components.findIndex(
            c => c.monitorId.toString() === monitorId
          );
          
          if (componentIndex !== -1) {
            existingIncident.components[componentIndex].status = 'operational';
          }
          
          await existingIncident.save();
          
          return {
            success: true,
            action: 'resolved',
            incidentId: existingIncident._id,
            statusPageId: spMonitor.statusPageId
          };
        } else {
          return {
            success: true,
            action: 'no_action',
            statusPageId: spMonitor.statusPageId
          };
        }
      } catch (error) {
        console.error(`Error processing status page ${spMonitor.statusPageId}:`, error);
        return {
          success: false,
          message: error.message,
          monitorId,
          statusPageId: spMonitor.statusPageId
        };
      }
    }));
    
    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Auto incident error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   GET /internal/status-pages/:domain
 * @desc    Get status page by custom domain
 * @access  Internal
 */
router.get('/status-pages/domain/:domain', async (req, res) => {
  try {
    const statusPage = await StatusPage.findOne({ 
      customDomain: req.params.domain,
      isPublic: true
    });
    
    if (!statusPage) {
      return res.status(404).json({ 
        success: false, 
        message: 'Status page not found' 
      });
    }
    
    res.json({
      success: true,
      slug: statusPage.slug
    });
  } catch (error) {
    console.error('Get status page by domain error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

/**
 * @route   GET /internal/status-pages
 * @desc    Get basic info about all public status pages
 * @access  Internal
 */
router.get('/status-pages', async (req, res) => {
  try {
    const statusPages = await StatusPage.find({ 
      isPublic: true 
    }, 'name slug customDomain');
    
    res.json({
      success: true,
      data: statusPages
    });
  } catch (error) {
    console.error('Get all status pages error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;