// services/status-page-service/models/StatusPage.js
const mongoose = require('mongoose');
const config = require('../config/config');

/**
 * Status Page Schema
 * Represents a public status page configuration
 */
const StatusPageSchema = new mongoose.Schema({
  // User who owns this status page
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    index: true
  },
  
  // Status page name
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  
  // URL slug for public access
  slug: { 
    type: String, 
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[a-z0-9-]+$/.test(v);
      },
      message: props => `${props.value} is not a valid slug! Use only lowercase letters, numbers, and hyphens.`
    }
  },
  
  // Status page logo
  logo: String,
  
  // Status page description
  description: {
    type: String,
    trim: true
  },
  
  // Monitors displayed on this status page
  monitors: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'StatusPageMonitor' 
  }],
  
  // Visibility settings
  isPublic: { 
    type: Boolean, 
    default: true 
  },
  
  // Theme customization
  theme: {
    primaryColor: { 
      type: String, 
      default: config.statusPage.defaultTheme.primaryColor 
    },
    backgroundColor: { 
      type: String, 
      default: config.statusPage.defaultTheme.backgroundColor 
    },
    logoUrl: String
  },
  
  // Custom domain (if enabled)
  customDomain: String,
  
  // Google Analytics tracking ID
  googleAnalyticsId: String,
  
  // Additional metadata
  metadata: {
    company: String,
    website: String,
    support: {
      email: String,
      phone: String,
      url: String
    }
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
StatusPageSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create indexes
StatusPageSchema.index({ userId: 1 });
StatusPageSchema.index({ slug: 1 }, { unique: true });
StatusPageSchema.index({ customDomain: 1 }, { sparse: true, unique: true });

const StatusPage = mongoose.model('StatusPage', StatusPageSchema);

module.exports = StatusPage;