// services/status-page-service/models/StatusPageMonitor.js
const mongoose = require('mongoose');

/**
 * Status Page Monitor Schema
 * Represents a monitor displayed on a status page
 */
const StatusPageMonitorSchema = new mongoose.Schema({
  // Reference to the status page
  statusPageId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'StatusPage', 
    required: true,
    index: true
  },
  
  // Reference to the actual monitor in monitoring service
  monitorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },
  
  // Display name on status page (can be different from actual monitor name)
  displayName: { 
    type: String, 
    required: true,
    trim: true
  },
  
  // Description shown on status page
  description: {
    type: String,
    trim: true
  },
  
  // Display order on status page
  order: { 
    type: Number, 
    default: 0 
  },
  
  // Visibility setting
  visible: { 
    type: Boolean, 
    default: true 
  },
  
  // Group name for organizing monitors
  group: {
    type: String,
    trim: true
  },
  
  // Creation timestamp
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  
  // Update timestamp
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update updatedAt timestamp before saving
StatusPageMonitorSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create compound index
StatusPageMonitorSchema.index({ statusPageId: 1, monitorId: 1 }, { unique: true });
StatusPageMonitorSchema.index({ statusPageId: 1, order: 1 });

const StatusPageMonitor = mongoose.model('StatusPageMonitor', StatusPageMonitorSchema);

module.exports = StatusPageMonitor;