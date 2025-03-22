// services/notification-service/models/Channel.js
const mongoose = require('mongoose');

/**
 * Notification Channel Schema
 * Represents a notification delivery method configured by a user
 */
const ChannelSchema = new mongoose.Schema({
  // User who owns this channel
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    index: true 
  },
  
  // Channel type
  type: { 
    type: String, 
    required: true,
    enum: ['email', 'whatsapp', 'telegram', 'slack', 'webhook'],
    index: true
  },
  
  // Channel name for user identification
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  // Channel configuration
  config: { 
    // Email config
    email: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return this.type !== 'email' || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: props => `${props.value} is not a valid email address!`
      }
    },
    
    // WhatsApp config
    phoneNumber: {
      type: String,
      trim: true
    },
    
    // Telegram config
    chatId: {
      type: String,
      trim: true
    },
    botToken: {
      type: String,
      trim: true
    },
    
    // Slack config
    webhookUrl: {
      type: String,
      trim: true
    },
    channel: {
      type: String,
      trim: true
    },
    
    // Webhook config
    url: {
      type: String,
      trim: true
    },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT'],
      default: 'POST'
    },
    headers: {
      type: Map,
      of: String
    },
    bodyTemplate: {
      type: String
    }
  },
  
  // Channel status
  active: { 
    type: Boolean, 
    default: true 
  },
  
  // Notification filters
  filters: {
    monitorTypes: [String],
    monitorIds: [mongoose.Schema.Types.ObjectId],
    statusChanges: {
      up: { type: Boolean, default: true },
      down: { type: Boolean, default: true }
    },
    sslExpiry: { type: Boolean, default: true },
    domainExpiry: { type: Boolean, default: true }
  },
  
  // Verification status
  verified: {
    type: Boolean,
    default: false
  },
  verificationCode: String,
  verificationExpires: Date,
  
  // Creation and update timestamps
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update updatedAt timestamp before saving
ChannelSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create validator for type-specific config
ChannelSchema.path('config').validate(function(config) {
  switch (this.type) {
    case 'email':
      return config.email;
    case 'whatsapp':
      return config.phoneNumber;
    case 'telegram':
      return config.chatId && config.botToken;
    case 'slack':
      return config.webhookUrl;
    case 'webhook':
      return config.url;
    default:
      return false;
  }
}, 'Missing required configuration for this channel type');

// Create compound indexes
ChannelSchema.index({ userId: 1, type: 1 });
ChannelSchema.index({ userId: 1, name: 1 }, { unique: true });

const Channel = mongoose.model('Channel', ChannelSchema);

module.exports = Channel;