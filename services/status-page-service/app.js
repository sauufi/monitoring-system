// status-page-service/app.js
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/status-page-service')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify with auth service
    const response = await axios.post(
      `${process.env.AUTH_SERVICE_URL || 'http://localhost:3001'}/api/verify`,
      { token }
    );

    if (response.data.valid) {
      req.user = response.data.user;
      next();
    } else {
      res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

// Status Page Schema
const StatusPageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  slug: { 
    type: String, 
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  logo: String,
  description: String,
  monitors: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'StatusPageMonitor' 
  }],
  isPublic: { type: Boolean, default: true },
  theme: {
    primaryColor: { type: String, default: '#4CAF50' },
    backgroundColor: { type: String, default: '#ffffff' },
    logoUrl: String
  },
  customDomain: String,
  createdAt: { type: Date, default: Date.now }
});

const StatusPage = mongoose.model('StatusPage', StatusPageSchema);

// Status Page Monitor Schema (reference to monitors shown on status page)
const StatusPageMonitorSchema = new mongoose.Schema({
  statusPageId: { type: mongoose.Schema.Types.ObjectId, ref: 'StatusPage', required: true },
  monitorId: { type: mongoose.Schema.Types.ObjectId, required: true },
  displayName: { type: String, required: true },
  order: { type: Number, default: 0 },
  visible: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const StatusPageMonitor = mongoose.model('StatusPageMonitor', StatusPageMonitorSchema);

// Incident Schema
const IncidentSchema = new mongoose.Schema({
  statusPageId: { type: mongoose.Schema.Types.ObjectId, ref: 'StatusPage', required: true },
  title: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['investigating', 'identified', 'monitoring', 'resolved'],
    default: 'investigating'
  },
  impact: { 
    type: String, 
    enum: ['minor', 'major', 'critical'],
    default: 'minor'
  },
  message: String,
  updates: [{
    status: { 
      type: String, 
      enum: ['investigating', 'identified', 'monitoring', 'resolved']
    },
    message: String,
    createdAt: { type: Date, default: Date.now }
  }],
  resolved: { type: Boolean, default: false },
  resolvedAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Incident = mongoose.model('Incident', IncidentSchema);

// Status Page CRUD endpoints
app.post('/api/status-pages', authenticate, async (req, res) => {
  try {
    // Create a URL-friendly slug if not provided
    if (!req.body.slug) {
      req.body.slug = req.body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    
    // Check if slug is already in use
    const existingPage = await StatusPage.findOne({ slug: req.body.slug });
    if (existingPage) {
      return res.status(400).json({ message: 'This slug is already in use' });
    }
    
    const statusPage = new StatusPage({
      ...req.body,
      userId: req.user.id
    });
    
    await statusPage.save();
    res.status(201).json(statusPage);
  } catch (error) {
    console.error('Create status page error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/status-pages', authenticate, async (req, res) => {
  try {
    const statusPages = await StatusPage.find({ userId: req.user.id });
    res.json(statusPages);
  } catch (error) {
    console.error('Get status pages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/status-pages/:id', authenticate, async (req, res) => {
  try {
    const statusPage = await StatusPage.findOne({ 
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!statusPage) {
      return res.status(404).json({ message: 'Status page not found' });
    }
    
    res.json(statusPage);
  } catch (error) {
    console.error('Get status page error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/status-pages/:id', authenticate, async (req, res) => {
  try {
    // Don't allow changing the slug if it's already set
    if (req.body.slug) {
      delete req.body.slug;
    }
    
    const statusPage = await StatusPage.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    
    if (!statusPage) {
      return res.status(404).json({ message: 'Status page not found' });
    }
    
    res.json(statusPage);
  } catch (error) {
    console.error('Update status page error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/status-pages/:id', authenticate, async (req, res) => {
  try {
    const statusPage = await StatusPage.findOneAndDelete({ 
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!statusPage) {
      return res.status(404).json({ message: 'Status page not found' });
    }
    
    // Also delete related monitors and incidents
    await StatusPageMonitor.deleteMany({ statusPageId: statusPage._id });
    await Incident.deleteMany({ statusPageId: statusPage._id });
    
    res.json({ message: 'Status page deleted successfully' });
  } catch (error) {
    console.error('Delete status page error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Status Page Monitor endpoints
app.post('/api/status-pages/:id/monitors', authenticate, async (req, res) => {
  try {
    const statusPage = await StatusPage.findOne({ 
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!statusPage) {
      return res.status(404).json({ message: 'Status page not found' });
    }
    
    // Verify that user owns the monitor through the monitoring service
    try {
      await axios.get(
        `${process.env.MONITORING_SERVICE_URL || 'http://localhost:3002'}/api/monitors/${req.body.monitorId}`,
        {
          headers: {
            Authorization: `Bearer ${req.headers.authorization?.split(' ')[1]}`
          }
        }
      );
    } catch (error) {
      return res.status(404).json({ message: 'Monitor not found or unauthorized' });
    }
    
    const monitor = new StatusPageMonitor({
      statusPageId: statusPage._id,
      monitorId: req.body.monitorId,
      displayName: req.body.displayName,
      order: req.body.order || 0,
      visible: req.body.visible !== undefined ? req.body.visible : true
    });
    
    await monitor.save();
    
    // Add to status page monitors array
    statusPage.monitors.push(monitor._id);
    await statusPage.save();
    
    res.status(201).json(monitor);
  } catch (error) {
    console.error('Add status page monitor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/status-pages/:id/monitors', authenticate, async (req, res) => {
  try {
    const statusPage = await StatusPage.findOne({ 
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!statusPage) {
      return res.status(404).json({ message: 'Status page not found' });
    }
    
    const monitors = await StatusPageMonitor.find({ statusPageId: statusPage._id });
    
    // Get actual monitor details from monitoring service
    const monitorDetails = await Promise.all(
      monitors.map(async monitor => {
        try {
          const response = await axios.get(
            `${process.env.MONITORING_SERVICE_URL || 'http://localhost:3002'}/api/monitors/${monitor.monitorId}`,
            {
              headers: {
                Authorization: `Bearer ${req.headers.authorization?.split(' ')[1]}`
              }
            }
          );
          
          return {
            ...monitor.toObject(),
            details: response.data
          };
        } catch (error) {
          return {
            ...monitor.toObject(),
            details: { error: 'Monitor not found' }
          };
        }
      })
    );
    
    res.json(monitorDetails);
  } catch (error) {
    console.error('Get status page monitors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/status-pages/:pageId/monitors/:monitorId', authenticate, async (req, res) => {
  try {
    const statusPage = await StatusPage.findOne({ 
      _id: req.params.pageId,
      userId: req.user.id
    });
    
    if (!statusPage) {
      return res.status(404).json({ message: 'Status page not found' });
    }
    
    const monitor = await StatusPageMonitor.findOneAndDelete({ 
      statusPageId: statusPage._id,
      _id: req.params.monitorId
    });
    
    if (!monitor) {
      return res.status(404).json({ message: 'Monitor not found' });
    }
    
    // Remove from status page monitors array
    statusPage.monitors = statusPage.monitors.filter(
      m => m.toString() !== monitor._id.toString()
    );
    await statusPage.save();
    
    res.json({ message: 'Monitor removed from status page' });
  } catch (error) {
    console.error('Remove status page monitor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Incident endpoints
app.post('/api/status-pages/:id/incidents', authenticate, async (req, res) => {
  try {
    const statusPage = await StatusPage.findOne({ 
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!statusPage) {
      return res.status(404).json({ message: 'Status page not found' });
    }
    
    const incident = new Incident({
      statusPageId: statusPage._id,
      title: req.body.title,
      status: req.body.status || 'investigating',
      impact: req.body.impact || 'minor',
      message: req.body.message,
      createdBy: req.user.id,
      updates: [{
        status: req.body.status || 'investigating',
        message: req.body.message
      }]
    });
    
    await incident.save();
    res.status(201).json(incident);
  } catch (error) {
    console.error('Create incident error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/status-pages/:id/incidents', authenticate, async (req, res) => {
  try {
    const statusPage = await StatusPage.findOne({ 
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!statusPage) {
      return res.status(404).json({ message: 'Status page not found' });
    }
    
    const incidents = await Incident.find({ statusPageId: statusPage._id })
      .sort({ createdAt: -1 });
    
    res.json(incidents);
  } catch (error) {
    console.error('Get incidents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/incidents/:id/updates', authenticate, async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    
    // Verify user owns the status page
    const statusPage = await StatusPage.findOne({
      _id: incident.statusPageId,
      userId: req.user.id
    });
    
    if (!statusPage) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    // Add update
    incident.updates.push({
      status: req.body.status,
      message: req.body.message
    });
    
    // Update incident status
    incident.status = req.body.status;
    
    // Check if resolved
    if (req.body.status === 'resolved') {
      incident.resolved = true;
      incident.resolvedAt = new Date();
    }
    
    await incident.save();
    res.json(incident);
  } catch (error) {
    console.error('Add incident update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Public endpoints
app.get('/public/status-pages/:slug', async (req, res) => {
  try {
    const statusPage = await StatusPage.findOne({ 
      slug: req.params.slug,
      isPublic: true
    });
    
    if (!statusPage) {
      return res.status(404).json({ message: 'Status page not found' });
    }
    
    // Get monitors
    const statusPageMonitors = await StatusPageMonitor.find({ 
      statusPageId: statusPage._id,
      visible: true
    }).sort({ order: 1 });
    
    // Get monitor details
    const monitorPromises = statusPageMonitors.map(async spMonitor => {
      try {
        // Get data from monitoring service's internal API
        const monitorResponse = await axios.get(
          `${process.env.MONITORING_SERVICE_INTERNAL_URL || 'http://monitoring-service:3002'}/internal/monitors/${spMonitor.monitorId}`
        );
        
        // Get recent events
        const eventsResponse = await axios.get(
          `${process.env.MONITORING_SERVICE_INTERNAL_URL || 'http://monitoring-service:3002'}/internal/monitors/${spMonitor.monitorId}/events?limit=10`
        );
        
        return {
          id: spMonitor._id,
          displayName: spMonitor.displayName,
          status: monitorResponse.data.status,
          type: monitorResponse.data.type,
          lastChecked: monitorResponse.data.lastChecked,
          events: eventsResponse.data
        };
      } catch (error) {
        console.error(`Error fetching monitor ${spMonitor.monitorId}:`, error);
        return {
          id: spMonitor._id,
          displayName: spMonitor.displayName,
          status: 'unknown',
          lastChecked: null,
          events: []
        };
      }
    });
    
    const monitors = await Promise.all(monitorPromises);
    
    // Get active incidents
    const activeIncidents = await Incident.find({
      statusPageId: statusPage._id,
      resolved: false
    }).sort({ createdAt: -1 });
    
    // Get recent resolved incidents
    const resolvedIncidents = await Incident.find({
      statusPageId: statusPage._id,
      resolved: true
    }).sort({ resolvedAt: -1 }).limit(5);
    
    // Calculate overall status
    const statuses = monitors.map(m => m.status);
    let overallStatus = 'operational';
    
    if (statuses.includes('down')) {
      overallStatus = 'outage';
    } else if (statuses.includes('pending') || activeIncidents.length > 0) {
      overallStatus = 'degraded';
    }
    
    res.json({
      name: statusPage.name,
      description: statusPage.description,
      logo: statusPage.logo,
      theme: statusPage.theme,
      overallStatus,
      monitors,
      activeIncidents,
      resolvedIncidents
    });
  } catch (error) {
    console.error('Get public status page error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/public/status-pages/:slug/incidents', async (req, res) => {
  try {
    const statusPage = await StatusPage.findOne({ 
      slug: req.params.slug,
      isPublic: true
    });
    
    if (!statusPage) {
      return res.status(404).json({ message: 'Status page not found' });
    }
    
    const incidents = await Incident.find({ statusPageId: statusPage._id })
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json(incidents);
  } catch (error) {
    console.error('Get public incidents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Internal API for monitoring service (not exposed to public)
app.post('/internal/incidents/auto', async (req, res) => {
  try {
    const { monitorId, status, message } = req.body;
    
    // Find status pages that include this monitor
    const statusPageMonitors = await StatusPageMonitor.find({ monitorId });
    
    for (const spMonitor of statusPageMonitors) {
      // Check if there's already an active incident for this monitor
      const existingIncident = await Incident.findOne({
        statusPageId: spMonitor.statusPageId,
        resolved: false,
        title: { $regex: spMonitor.displayName }
      });
      
      if (status === 'down' && !existingIncident) {
        // Create new incident
        const incident = new Incident({
          statusPageId: spMonitor.statusPageId,
          title: `${spMonitor.displayName} is down`,
          status: 'investigating',
          impact: 'minor',
          message: message || 'Automatically detected downtime',
          updates: [{
            status: 'investigating',
            message: message || 'Automatically detected downtime'
          }],
          createdBy: null // System-generated
        });
        
        await incident.save();
      } else if (status === 'up' && existingIncident) {
        // Resolve incident
        existingIncident.updates.push({
          status: 'resolved',
          message: 'Service has recovered'
        });
        
        existingIncident.status = 'resolved';
        existingIncident.resolved = true;
        existingIncident.resolvedAt = new Date();
        
        await existingIncident.save();
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Auto incident error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = process.env.STATUS_PAGE_SERVICE_PORT || 3004;
app.listen(PORT, () => {
  console.log(`Status page service running on port ${PORT}`);
});

module.exports = app;