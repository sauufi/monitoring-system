// services/status-page-service/models/Incident.js
const mongoose = require('mongoose');

/**
 * Incident Schema
 * Represents a service incident on a status page
 */
const IncidentSchema = new mongoose.Schema({
  // Reference to the status page
  statusPageId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'StatusPage', 
    required: true,
    index: true
  },
  
  // Incident title
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  
  // Current incident status
  status: { 
    type: String, 
    enum: ['investigating', 'identified', 'monitoring', 'resolved'],
    default: 'investigating',
    index: true
  },
  
  // Incident impact level
  impact: { 
    type: String, 
    enum: ['minor', 'major', 'critical'],
    default: 'minor',
    index: true
  },
  
  // Incident message
  message: {
    type: String,
    trim: true
  },
  
  // Incident updates
  updates: [{
    status: { 
      type: String, 
      enum: ['investigating', 'identified', 'monitoring', 'resolved'],
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId
    },
    createdAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  
  // Components affected by this incident
  components: [{
    monitorId: { 
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    name: String,
    status: {
      type: String,
      enum: ['operational', 'degraded', 'partial_outage', 'major_outage'],
      default: 'partial_outage'
    }
  }],
  
  // Scheduled maintenance fields (for planned incidents)
  scheduled: {
    type: Boolean,
    default: false
  },
  scheduledFor: {
    start: Date,
    end: Date
  },
  
  // Resolution status
  resolved: { 
    type: Boolean, 
    default: false,
    index: true
  },
  resolvedAt: Date,
  
  // Created by user (null for system-generated incidents)
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId
  },
  
  // Creation timestamp
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  
  // Update timestamp
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update updatedAt timestamp before saving
IncidentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // If status changed to resolved, update resolvedAt
  if (this.status === 'resolved' && !this.resolved) {
    this.resolved = true;
    this.resolvedAt = new Date();
  }
  
  next();
});

// Create indexes
IncidentSchema.index({ statusPageId: 1, createdAt: -1 });
IncidentSchema.index({ statusPageId: 1, resolved: 1, createdAt: -1 });

// Virtual for duration
IncidentSchema.virtual('duration').get(function() {
  if (!this.resolved || !this.resolvedAt) {
    return null;
  }
  
  return this.resolvedAt - this.createdAt;
});

const Incident = mongoose.model('Incident', IncidentSchema);

module.exports = Incident;