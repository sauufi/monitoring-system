// services/notification-service/models/Notification.js
const mongoose = require('mongoose');

/**
 * Notification Schema
 * Represents a notification to be sent to users
 */
const NotificationSchema = new mongoose.Schema({
  // User who should receive this notification
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    index: true
  },
  
  // Reference to the monitor that triggered this notification
  monitorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    index: true
  },
  
  // Reference to the event that triggered this notification
  eventId: { 
    type: mongoose.Schema.Types.ObjectId
  },
  
  // Notification type
  type: { 
    type: String, 
    required: true,
    enum: ['status_changed', 'ssl_expiry', 'domain_expiry', 'test', 'system'],
    index: true
  },
  
  // Notification title and message
  title: {
    type: String,
    required: true
  },
  message: { 
    type: String, 
    required: true 
  },
  
  // Notification priority
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'critical'],
    default: 'normal'
  },
  
  // Delivery status
  status: { 
    type: String, 
    enum: ['pending', 'sending', 'sent', 'failed', 'partial'],
    default: 'pending',
    index: true
  },
  
  // Delivery details for each channel
  deliveries: [{
    channelId: mongoose.Schema.Types.ObjectId,
    channelType: { 
      type: String, 
      enum: ['email', 'whatsapp', 'telegram', 'slack', 'webhook'] 
    },
    status: { 
      type: String, 
      enum: ['pending', 'sent', 'failed'],
      default: 'pending'
    },
    sentAt: Date,
    error: String,
    retries: {
      type: Number,
      default: 0
    },
    response: mongoose.Schema.Types.Mixed
  }],
  
  // Additional data
  data: mongoose.Schema.Types.Mixed,
  
  // Creation timestamp
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true
  },
  
  // Last update timestamp
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updatedAt timestamp before saving
NotificationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create compound indexes
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ monitorId: 1, createdAt: -1 });
NotificationSchema.index({ status: 1, createdAt: 1 });

// Static method to get user's recent notifications
NotificationSchema.statics.getRecentNotifications = async function(userId, limit = 50) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to mark notification as sent
NotificationSchema.statics.markAsSent = async function(notificationId) {
  return this.findByIdAndUpdate(
    notificationId,
    { 
      status: 'sent',
      updatedAt: new Date()
    },
    { new: true }
  );
};

// Static method to mark notification as partially sent
NotificationSchema.statics.markAsPartial = async function(notificationId) {
  return this.findByIdAndUpdate(
    notificationId,
    { 
      status: 'partial',
      updatedAt: new Date()
    },
    { new: true }
  );
};

// Static method to mark notification as failed
NotificationSchema.statics.markAsFailed = async function(notificationId, error) {
  return this.findByIdAndUpdate(
    notificationId,
    { 
      status: 'failed',
      error,
      updatedAt: new Date()
    },
    { new: true }
  );
};

const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;