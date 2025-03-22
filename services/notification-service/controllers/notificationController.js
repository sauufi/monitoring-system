// services/notification-service/controllers/notificationController.js
const Notification = require('../models/Notification');
const Channel = require('../models/Channel');
const emailService = require('../services/emailService');
// Import other notification service handlers (for WhatsApp, Telegram, etc.)

/**
 * Process a new notification and send it through appropriate channels
 * @param {Object} notificationData - Notification data
 * @returns {Promise<Object>} The created notification with delivery results
 */
exports.processNotification = async (notificationData) => {
  try {
    // Format notification data
    const formattedData = formatNotificationData(notificationData);
    
    // Find user's active channels that match the notification criteria
    const channels = await getMatchingChannels(
      formattedData.userId,
      formattedData.type,
      notificationData.monitor
    );
    
    // If no channels match, return early
    if (channels.length === 0) {
      console.log(`No matching channels for notification to user ${formattedData.userId}`);
      return {
        success: true,
        message: 'No matching channels found',
        notificationSent: false
      };
    }
    
    // Create notification record with delivery channels
    const notification = new Notification({
      ...formattedData,
      deliveries: channels.map(channel => ({
        channelId: channel._id,
        channelType: channel.type,
        status: 'pending'
      }))
    });
    
    await notification.save();
    
    // Process notification through each channel
    const deliveryPromises = channels.map(async (channel, index) => {
      try {
        const result = await sendNotificationToChannel(notification, channel);
        
        // Update delivery status
        notification.deliveries[index].status = 'sent';
        notification.deliveries[index].sentAt = new Date();
        notification.deliveries[index].response = result;
        
        return {
          success: true,
          channelId: channel._id,
          channelType: channel.type
        };
      } catch (error) {
        // Update delivery status on failure
        notification.deliveries[index].status = 'failed';
        notification.deliveries[index].error = error.message;
        
        console.error(`Error sending notification to ${channel.type} channel:`, error);
        
        return {
          success: false,
          channelId: channel._id,
          channelType: channel.type,
          error: error.message
        };
      }
    });
    
    const deliveryResults = await Promise.all(deliveryPromises);
    
    // Update overall notification status
    const allSuccessful = deliveryResults.every(result => result.success);
    const allFailed = deliveryResults.every(result => !result.success);
    
    if (allSuccessful) {
      notification.status = 'sent';
    } else if (allFailed) {
      notification.status = 'failed';
    } else {
      notification.status = 'partial';
    }
    
    await notification.save();
    
    return {
      success: true,
      notification,
      deliveryResults
    };
  } catch (error) {
    console.error('Error processing notification:', error);
    throw error;
  }
};

/**
 * Format raw notification data into a standardized structure
 * @param {Object} data - Raw notification data
 * @returns {Object} Formatted notification data
 */
function formatNotificationData(data) {
  // Common fields
  const formatted = {
    userId: data.userId,
    monitorId: data.monitor?.id,
    eventId: data.event?.id,
    type: data.type,
    data: {}
  };
  
  // Set monitor data
  if (data.monitor) {
    formatted.data.monitor = data.monitor;
  }
  
  // Set title and message based on notification type
  switch (data.type) {
    case 'status_changed':
      formatted.title = `Monitor ${data.monitor.name} is ${data.event.currentStatus.toUpperCase()}`;
      formatted.message = data.event.message || `The monitor has changed from ${data.event.previousStatus} to ${data.event.currentStatus}`;
      formatted.data.previousStatus = data.event.previousStatus;
      formatted.data.currentStatus = data.event.currentStatus;
      formatted.data.time = data.event.time;
      formatted.priority = data.event.currentStatus === 'down' ? 'high' : 'normal';
      break;
      
    case 'ssl_expiry':
      formatted.title = `SSL Certificate for ${data.monitor.domain} is expiring soon`;
      formatted.message = `The SSL certificate will expire in ${data.ssl.daysRemaining} days`;
      formatted.data.ssl = data.ssl;
      formatted.priority = data.ssl.daysRemaining <= 7 ? 'high' : 'normal';
      break;
      
    case 'domain_expiry':
      formatted.title = `Domain ${data.monitor.domain} is expiring soon`;
      formatted.message = `The domain will expire in ${data.domain.daysRemaining} days`;
      formatted.data.domain = data.domain;
      formatted.priority = data.domain.daysRemaining <= 7 ? 'high' : 'normal';
      break;
      
    case 'test':
      formatted.title = `Test notification for ${data.monitor.name}`;
      formatted.message = data.message || 'This is a test notification';
      formatted.priority = 'low';
      break;
      
    case 'system':
      formatted.title = data.title || 'System Notification';
      formatted.message = data.message || 'System notification';
      formatted.priority = data.priority || 'normal';
      break;
      
    default:
      formatted.title = data.title || 'Monitoring Alert';
      formatted.message = data.message || 'Notification from monitoring system';
      formatted.priority = 'normal';
  }
  
  return formatted;
}

/**
 * Get channels that match notification criteria
 * @param {string} userId - User ID
 * @param {string} notificationType - Notification type
 * @param {Object} monitor - Monitor data
 * @returns {Promise<Array>} Matching channels
 */
async function getMatchingChannels(userId, notificationType, monitor) {
  try {
    // Get all active channels for the user
    const channels = await Channel.find({
      userId,
      active: true,
      verified: true
    });
    
    // Filter channels based on notification criteria
    return channels.filter(channel => {
      // Skip if channel has monitor-specific filters and this monitor isn't included
      if (
        channel.filters.monitorIds &&
        channel.filters.monitorIds.length > 0 &&
        !channel.filters.monitorIds.includes(monitor.id)
      ) {
        return false;
      }
      
      // Skip if channel has monitor type filters and this type isn't included
      if (
        channel.filters.monitorTypes &&
        channel.filters.monitorTypes.length > 0 &&
        !channel.filters.monitorTypes.includes(monitor.type)
      ) {
        return false;
      }
      
      // For status changes, check if the channel accepts this status change type
      if (notificationType === 'status_changed') {
        const newStatus = monitor.status || 'down';
        if (
          (newStatus === 'up' && !channel.filters.statusChanges.up) ||
          (newStatus === 'down' && !channel.filters.statusChanges.down)
        ) {
          return false;
        }
      }
      
      // SSL expiry notifications
      if (notificationType === 'ssl_expiry' && !channel.filters.sslExpiry) {
        return false;
      }
      
      // Domain expiry notifications
      if (notificationType === 'domain_expiry' && !channel.filters.domainExpiry) {
        return false;
      }
      
      // Channel passes all filters
      return true;
    });
  } catch (error) {
    console.error('Error getting matching channels:', error);
    return [];
  }
}