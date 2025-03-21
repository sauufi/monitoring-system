// monitoring-service/app.js
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const ping = require('ping');
const cron = require('node-cron');
const { sslChecker } = require('ssl-checker');
const net = require('net');
const dns = require('dns').promises;
const http = require('http');
const https = require('https');
const cheerio = require('cheerio');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/monitoring-service')
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

// Monitor Schema
const MonitorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    required: true,
    enum: ['website', 'ssl', 'domain', 'ping', 'port', 'tcp', 'cron', 'keyword'] 
  },
  url: String,
  domain: String,
  ip: String,
  port: Number,
  keyword: String,
  expectedStatus: Number,
  interval: { type: Number, default: 5, min: 1 }, // minutes
  timeout: { type: Number, default: 30, min: 1 }, // seconds
  active: { type: Boolean, default: true },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  lastChecked: Date,
  status: { type: String, enum: ['up', 'down', 'pending'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const Monitor = mongoose.model('Monitor', mongoose.Schema);

// Event Schema for storing monitoring results
const EventSchema = new mongoose.Schema({
  monitorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Monitor', required: true },
  status: { type: String, enum: ['up', 'down'], required: true },
  responseTime: Number,
  statusCode: Number,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

const Event = mongoose.model('Event', EventSchema);

// CRUD Operations for monitors
app.post('/api/monitors', authenticate, async (req, res) => {
  try {
    const monitor = new Monitor({
      ...req.body,
      userId: req.user.id
    });
    
    await monitor.save();
    
    // Schedule the monitoring task
    scheduleMonitor(monitor);
    
    res.status(201).json(monitor);
  } catch (error) {
    console.error('Create monitor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/monitors', authenticate, async (req, res) => {
  try {
    const monitors = await Monitor.find({ userId: req.user.id });
    res.json(monitors);
  } catch (error) {
    console.error('Get monitors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/monitors/:id', authenticate, async (req, res) => {
  try {
    const monitor = await Monitor.findOne({ 
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!monitor) {
      return res.status(404).json({ message: 'Monitor not found' });
    }
    
    res.json(monitor);
  } catch (error) {
    console.error('Get monitor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/monitors/:id', authenticate, async (req, res) => {
  try {
    const monitor = await Monitor.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    
    if (!monitor) {
      return res.status(404).json({ message: 'Monitor not found' });
    }
    
    // Reschedule the monitoring task
    scheduleMonitor(monitor);
    
    res.json(monitor);
  } catch (error) {
    console.error('Update monitor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/monitors/:id', authenticate, async (req, res) => {
  try {
    const monitor = await Monitor.findOneAndDelete({ 
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!monitor) {
      return res.status(404).json({ message: 'Monitor not found' });
    }
    
    // Remove scheduled task
    // Implementation depends on how you store scheduled tasks
    
    res.json({ message: 'Monitor deleted successfully' });
  } catch (error) {
    console.error('Delete monitor error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get monitor events
app.get('/api/monitors/:id/events', authenticate, async (req, res) => {
  try {
    const monitor = await Monitor.findOne({ 
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!monitor) {
      return res.status(404).json({ message: 'Monitor not found' });
    }
    
    const events = await Event.find({ monitorId: monitor._id })
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Monitoring functions
async function checkWebsite(monitor) {
  const startTime = Date.now();
  
  try {
    const response = await axios.get(monitor.url, {
      timeout: monitor.timeout * 1000
    });
    
    const responseTime = Date.now() - startTime;
    const status = (monitor.expectedStatus ? 
      response.status === monitor.expectedStatus : 
      response.status >= 200 && response.status < 400) ? 'up' : 'down';
    
    return {
      status,
      responseTime,
      statusCode: response.status,
      message: status === 'up' ? 'Website is up' : 'Website returned unexpected status code'
    };
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - startTime,
      statusCode: error.response?.status,
      message: error.message
    };
  }
}

async function checkSSL(monitor) {
  try {
    const result = await sslChecker(monitor.domain);
    
    return {
      status: result.valid ? 'up' : 'down',
      responseTime: 0,
      message: result.valid ? 
        `SSL valid until ${result.validTo}` : 
        'SSL certificate invalid',
      details: {
        daysRemaining: result.daysRemaining,
        validFrom: result.validFrom,
        validTo: result.validTo,
        issuer: result.issuer
      }
    };
  } catch (error) {
    return {
      status: 'down',
      responseTime: 0,
      message: error.message
    };
  }
}

async function checkDomain(monitor) {
  try {
    const result = await dns.lookup(monitor.domain);
    
    return {
      status: 'up',
      responseTime: 0,
      message: `Domain resolves to ${result.address}`,
      details: { ip: result.address }
    };
  } catch (error) {
    return {
      status: 'down',
      responseTime: 0,
      message: error.message
    };
  }
}

async function checkPing(monitor) {
  try {
    const startTime = Date.now();
    const result = await ping.promise.probe(monitor.ip || monitor.domain, {
      timeout: monitor.timeout
    });
    const responseTime = Date.now() - startTime;
    
    return {
      status: result.alive ? 'up' : 'down',
      responseTime,
      message: result.alive ? 
        `Ping successful (${result.time}ms)` : 
        'Ping failed'
    };
  } catch (error) {
    return {
      status: 'down',
      responseTime: 0,
      message: error.message
    };
  }
}

async function checkPort(monitor) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const socket = new net.Socket();
    let isResolved = false;
    
    socket.setTimeout(monitor.timeout * 1000);
    
    socket.on('connect', () => {
      if (isResolved) return;
      isResolved = true;
      socket.destroy();
      
      resolve({
        status: 'up',
        responseTime: Date.now() - startTime,
        message: `Port ${monitor.port} is open`
      });
    });
    
    socket.on('timeout', () => {
      if (isResolved) return;
      isResolved = true;
      socket.destroy();
      
      resolve({
        status: 'down',
        responseTime: monitor.timeout * 1000,
        message: `Connection to port ${monitor.port} timed out`
      });
    });
    
    socket.on('error', (error) => {
      if (isResolved) return;
      isResolved = true;
      socket.destroy();
      
      resolve({
        status: 'down',
        responseTime: Date.now() - startTime,
        message: error.message
      });
    });
    
    socket.connect(monitor.port, monitor.ip || monitor.domain);
  });
}

async function checkTCP(monitor) {
  // Similar to port check but with specific TCP handshake
  return checkPort(monitor);
}

async function checkKeyword(monitor) {
  const startTime = Date.now();
  
  try {
    const response = await axios.get(monitor.url, {
      timeout: monitor.timeout * 1000
    });
    
    const responseTime = Date.now() - startTime;
    const $ = cheerio.load(response.data);
    const pageContent = $('body').text();
    const keywordFound = pageContent.includes(monitor.keyword);
    
    return {
      status: keywordFound ? 'up' : 'down',
      responseTime,
      statusCode: response.status,
      message: keywordFound ? 
        `Keyword "${monitor.keyword}" found` : 
        `Keyword "${monitor.keyword}" not found`
    };
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - startTime,
      statusCode: error.response?.status,
      message: error.message
    };
  }
}

async function checkCron(monitor) {
  // For cron jobs, we're just checking if the endpoint returns success
  return checkWebsite(monitor);
}

// Map monitor types to their check functions
const monitorCheckers = {
  website: checkWebsite,
  ssl: checkSSL,
  domain: checkDomain,
  ping: checkPing,
  port: checkPort,
  tcp: checkTCP,
  keyword: checkKeyword,
  cron: checkCron
};

// Function to check a monitor and save the result
async function performCheck(monitor) {
  try {
    // Get the appropriate checker function
    const checker = monitorCheckers[monitor.type];
    if (!checker) {
      console.error(`No checker for monitor type: ${monitor.type}`);
      return;
    }
    
    // Perform the check
    const result = await checker(monitor);
    
    // Save the event
    const event = new Event({
      monitorId: monitor._id,
      status: result.status,
      responseTime: result.responseTime,
      statusCode: result.statusCode,
      message: result.message
    });
    await event.save();
    
    // Update monitor status
    const updatedMonitor = await Monitor.findByIdAndUpdate(
      monitor._id,
      { 
        status: result.status,
        lastChecked: new Date()
      },
      { new: true }
    );
    
    // If status changed, send notification
    if (monitor.status !== 'pending' && monitor.status !== result.status) {
      // Send notification via the notification service
      await axios.post(
        `${process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3003'}/api/notifications`,
        {
          type: 'status_changed',
          monitor: {
            id: monitor._id,
            name: monitor.name,
            type: monitor.type,
            url: monitor.url || monitor.domain || monitor.ip
          },
          event: {
            previousStatus: monitor.status,
            currentStatus: result.status,
            message: result.message,
            time: new Date()
          },
          userId: monitor.userId
        }
      );
    }
    
    return updatedMonitor;
  } catch (error) {
    console.error(`Error checking monitor ${monitor._id}:`, error);
  }
}

// Schedule a monitor check based on its interval
function scheduleMonitor(monitor) {
  // Implementation could vary depending on your scheduling system
  // Here's a simple in-memory scheduler using node-cron
  const cronExpression = `*/${monitor.interval} * * * *`; // Run every X minutes
  
  // Store the cron job somewhere to be able to cancel it later if needed
  cron.schedule(cronExpression, () => {
    if (monitor.active) {
      performCheck(monitor);
    }
  });
}

// Initialize: Schedule all active monitors on startup
async function initializeMonitors() {
  try {
    const monitors = await Monitor.find({ active: true });
    monitors.forEach(monitor => {
      scheduleMonitor(monitor);
    });
    console.log(`Scheduled ${monitors.length} monitors`);
  } catch (error) {
    console.error('Error initializing monitors:', error);
  }
}

// Initialize monitors on startup
initializeMonitors();

const PORT = process.env.MONITORING_SERVICE_PORT || 3002;
app.listen(PORT, () => {
  console.log(`Monitoring service running on port ${PORT}`);
});

module.exports = app;