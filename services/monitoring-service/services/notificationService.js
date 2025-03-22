// services/monitoring-service/services/notificationService.js
const axios = require('axios');
const Monitor = require('../models/Monitor');
const NotificationQueue = require('../models/NotificationQueue');

/**
 * Send a notification via the notification service
 * @param {object} notification - Notification data
 * @returns {Promise<object>} Notification result
 */
const sendNotification = async (notification) => {
  try {
    // First, store notification in queue (in case notification service is down)
    const queuedNotification = new NotificationQueue({
      type: notification.type,
      monitor: notification.monitor,
      event: notification.event,
      userId: notification.userId,
      status: 'pending'
    });
    
    await queuedNotification.save();
    
    // Get monitor to check notification settings
    const monitor = await Monitor.findById(notification.monitor.id);
    
    // Check if notifications are enabled for this monitor
    if (monitor && monitor.notificationsEnabled === false) {
      console.log(`Notifications disabled for monitor: ${monitor.name}`);
      
      // Update queue entry
      await NotificationQueue.findByIdAndUpdate(
        queuedNotification._id,
        {
          status: 'cancelled',
          processed: true,
          processedAt: new Date(),
          message: 'Notifications disabled for this monitor'
        }
      );
      
      return {
        success: false,
        message: 'Notifications disabled for this monitor'
      };
    }
    
    // Try to send notification via the notification service
    const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3003';
    
    const response = await axios.post(
      `${notificationServiceUrl}/api/notifications`,
      notification,
      {
        timeout: 5000 // 5 seconds timeout
      }
    );
    
    // Update queue entry
    await NotificationQueue.findByIdAndUpdate(
      queuedNotification._id,
      {
        status: 'sent',
        processed: true,
        processedAt: new Date(),
        response: response.data
      }
    );
    
    return {
      success: true,
      message: 'Notification sent successfully',
      data: response.data
    };
  } catch (error) {
    console.error(`Error sending notification: ${error.message}`);
    
    // If notification was queued, update its status
    if (queuedNotification) {
      await NotificationQueue.findByIdAndUpdate(
        queuedNotification._id,
        {
          status: 'failed',
          processed: false,
          error: error.message
        }
      );
    }
    
    return {
      success: false,
      message: `Failed to send notification: ${error.message}`
    };
  }
};

/**
 * Process notification queue - retry failed notifications
 * @param {number} limit - Maximum number of notifications to process
 * @returns {Promise<object>} Processing result
 */
const processNotificationQueue = async (limit = 50) => {
  try {
    // Find unprocessed or failed notifications
    const pendingNotifications = await NotificationQueue.find({
      $or: [
        { processed: false, retries: { $lt: 5 } },
        { status: 'failed', retries: { $lt: 5 } }
      ]
    })
    .sort({ createdAt: 1 })
    .limit(limit);
    
    if (pendingNotifications.length === 0) {
      return {
        success: true,
        message: 'No pending notifications to process',
        processed: 0
      };
    }
    
    console.log(`Processing ${pendingNotifications.length} pending notifications`);
    
    const results = {
      success: true,
      total: pendingNotifications.length,
      sent: 0,
      failed: 0,
      cancelled: 0
    };
    
    // Process each notification
    for (const notification of pendingNotifications) {
      try {
        // Get monitor to check notification settings
        const monitor = await Monitor.findById(notification.monitor.id);
        
        // Check if notifications are still enabled for this monitor
        if (monitor && monitor.notificationsEnabled === false) {
          console.log(`Notifications disabled for monitor: ${monitor.name}`);
          
          // Update notification
          await NotificationQueue.findByIdAndUpdate(
            notification._id,
            {
              status: 'cancelled',
              processed: true,
              processedAt: new Date(),
              message: 'Notifications disabled for this monitor',
              $inc: { retries: 1 }
            }
          );
          
          results.cancelled++;
          continue;
        }
        
        // Try to send notification via the notification service
        const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3003';
        
        const response = await axios.post(
          `${notificationServiceUrl}/api/notifications`,
          {
            type: notification.type,
            monitor: notification.monitor,
            event: notification.event,
            userId: notification.userId
          },
          {
            timeout: 5000 // 5 seconds timeout
          }
        );
        
        // Update notification
        await NotificationQueue.findByIdAndUpdate(
          notification._id,
          {
            status: 'sent',
            processed: true,
            processedAt: new Date(),
            response: response.data,
            $inc: { retries: 1 }
          }
        );
        
        results.sent++;
      } catch (error) {
        console.error(`Error processing notification ${notification._id}: ${error.message}`);
        
        // Update notification
        await NotificationQueue.findByIdAndUpdate(
          notification._id,
          {
            status: 'failed',
            error: error.message,
            $inc: { retries: 1 }
          }
        );
        
        results.failed++;
      }
    }
    
    console.log(`Processed ${results.total} notifications: ${results.sent} sent, ${results.failed} failed, ${results.cancelled} cancelled`);
    
    return results;
  } catch (error) {
    console.error(`Error processing notification queue: ${error.message}`);
    return {
      success: false,
      message: `Failed to process queue: ${error.message}`
    };
  }
};

/**
 * Clean up old notifications from the queue
 * @param {number} days - Remove notifications older than X days
 * @returns {Promise<object>} Cleanup result
 */
const cleanupNotificationQueue = async (days = 7) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    // Delete old processed notifications
    const result = await NotificationQueue.deleteMany({
      processed: true,
      processedAt: { $lt: cutoffDate }
    });
    
    console.log(`Removed ${result.deletedCount} old notifications from queue`);
    
    return {
      success: true,
      message: `Removed ${result.deletedCount} old notifications from queue`
    };
  } catch (error) {
    console.error(`Error cleaning up notification queue: ${error.message}`);
    return {
      success: false,
      message: `Failed to clean up queue: ${error.message}`
    };
  }
};

module.exports = {
  sendNotification,
  processNotificationQueue,
  cleanupNotificationQueue
};