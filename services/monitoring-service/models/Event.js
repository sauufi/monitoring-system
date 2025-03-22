// services/monitoring-service/models/Event.js
const mongoose = require('mongoose');

/**
 * Event Schema
 * Represents a monitoring check result event
 */
const EventSchema = new mongoose.Schema({
  // Reference to monitor
  monitorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Monitor', 
    required: true,
    index: true
  },
  
  // Event status
  status: { 
    type: String, 
    enum: ['up', 'down'], 
    required: true,
    index: true
  },
  
  // Performance metrics
  responseTime: {
    type: Number,
    min: 0
  },
  
  // HTTP specific data
  statusCode: Number,
  
  // Event details
  message: String,
  
  // Detailed response data
  details: {
    // SSL certificate info
    ssl: {
      issuer: String,
      validFrom: Date,
      validTo: Date,
      daysRemaining: Number
    },
    
    // Domain expiry info
    domain: {
      registrar: String,
      expiryDate: Date,
      daysRemaining: Number
    },
    
    // Response headers
    headers: Object,
    
    // Response body (truncated if needed)
    body: String,
    
    // Error details
    error: {
      name: String,
      message: String,
      stack: String
    }
  },
  
  // Creation timestamp
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true
  }
});

// Create compound indexes for efficient querying
EventSchema.index({ monitorId: 1, createdAt: -1 });
EventSchema.index({ monitorId: 1, status: 1, createdAt: -1 });

// Static method to get events for a monitor
EventSchema.statics.getEventsForMonitor = async function(monitorId, limit = 100) {
  return this.find({ monitorId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get status change events for a monitor
EventSchema.statics.getStatusChanges = async function(monitorId, limit = 100) {
  const events = await this.find({ monitorId })
    .sort({ createdAt: -1 })
    .limit(limit);
  
  const statusChanges = [];
  let previousStatus = null;
  
  for (let i = events.length - 1; i >= 0; i--) {
    if (events[i].status !== previousStatus) {
      statusChanges.push(events[i]);
      previousStatus = events[i].status;
    }
  }
  
  return statusChanges.reverse();
};

// Static method to calculate uptime percentage
EventSchema.statics.calculateUptime = async function(monitorId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const totalEvents = await this.countDocuments({
    monitorId,
    createdAt: { $gte: startDate }
  });
  
  if (totalEvents === 0) {
    return 0;
  }
  
  const upEvents = await this.countDocuments({
    monitorId,
    status: 'up',
    createdAt: { $gte: startDate }
  });
  
  return (upEvents / totalEvents) * 100;
};

const Event = mongoose.model('Event', EventSchema);

module.exports = Event;