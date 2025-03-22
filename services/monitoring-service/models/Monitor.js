// services/monitoring-service/models/Monitor.js
const mongoose = require('mongoose');

/**
 * Monitor Schema
 * Represents a monitoring target configuration
 */
const MonitorSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Monitor name is required'],
    trim: true
  },
  type: { 
    type: String, 
    required: [true, 'Monitor type is required'],
    enum: ['website', 'ssl', 'domain', 'ping', 'port', 'tcp', 'cron', 'keyword'],
    index: true
  },
  
  // Website & Keyword monitoring fields
  url: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        // Only validate URL if type is website, keyword or cron
        if (['website', 'keyword', 'cron'].includes(this.type)) {
          return /^https?:\/\/.+/.test(v);
        }
        return true;
      },
      message: 'URL must be a valid HTTP or HTTPS URL'
    }
  },
  
  // SSL & Domain monitoring fields
  domain: {
    type: String,
    trim: true
  },
  
  // Ping, Port & TCP monitoring fields
  ip: {
    type: String,
    trim: true
  },
  port: {
    type: Number,
    min: 1,
    max: 65535
  },
  
  // Keyword monitoring fields
  keyword: {
    type: String,
    trim: true
  },
  
  // HTTP specific fields
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH'],
    default: 'GET'
  },
  headers: {
    type: Map,
    of: String
  },
  body: String,
  expectedStatus: Number,
  
  // General configuration
  interval: { 
    type: Number, 
    default: 5, 
    min: 1, 
    max: 1440,
    description: 'Check interval in minutes'
  },
  timeout: { 
    type: Number, 
    default: 30, 
    min: 1, 
    max: 120,
    description: 'Request timeout in seconds'
  },
  retries: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
    description: 'Number of retries before marking as down'
  },
  active: { 
    type: Boolean, 
    default: true,
    index: true
  },
  
  // Ownership
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    index: true
  },
  
  // Status tracking
  lastChecked: Date,
  nextCheck: Date,
  status: { 
    type: String, 
    enum: ['up', 'down', 'pending'], 
    default: 'pending',
    index: true
  },
  
  // Advanced settings
  notifications: {
    downtime: { type: Boolean, default: true },
    uptime: { type: Boolean, default: true },
    sslExpiry: { type: Boolean, default: true },
    domainExpiry: { type: Boolean, default: true }
  },
  
  // Custom tags for organization
  tags: [String],
  
  // Creation and update timestamps
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt timestamp before saving
MonitorSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Calculate nextCheck time before saving
MonitorSchema.pre('save', function(next) {
  if (this.active && !this.nextCheck) {
    this.nextCheck = new Date(Date.now() + this.interval * 60 * 1000);
  }
  next();
});

// Create indexes
MonitorSchema.index({ userId: 1, type: 1 });
MonitorSchema.index({ status: 1, active: 1 });
MonitorSchema.index({ nextCheck: 1, active: 1 });

// Virtual for uptime percentage
MonitorSchema.virtual('uptimePercentage').get(function() {
  // This would typically be calculated from event history
  // Implementation would depend on how you store events
  return 0;
});

const Monitor = mongoose.model('Monitor', MonitorSchema);

module.exports = Monitor;