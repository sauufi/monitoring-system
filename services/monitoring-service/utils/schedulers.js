// services/monitoring-service/utils/schedulers.js
const cron = require('node-cron');
const Redis = require('ioredis');
const Monitor = require('../models/Monitor');
const checkers = require('./checkers');
const { createEvent } = require('../controllers/eventController');
const { sendNotification } = require('../services/notificationService');

// Initialize Redis client
const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || '',
  keyPrefix: 'monitor:scheduler:'
});

// Scheduler registry - keeps track of all active scheduler tasks
const schedulers = new Map();

/**
 * Convert monitor interval to cron expression
 * @param {number} minutes - Interval in minutes
 * @returns {string} Cron expression
 */
const intervalToCron = (minutes) => {
  if (minutes < 1) minutes = 1;
  if (minutes < 60) {
    return `*/${minutes} * * * *`; // every X minutes
  } else {
    const hours = Math.floor(minutes / 60);
    return hours < 24 ? 
      `0 */${hours} * * *` : // every X hours
      `0 0 */${Math.floor(hours / 24)} * *`; // every X days
  }
};

/**
 * Create a unique scheduler ID for a monitor
 * @param {string} monitorId - Monitor ID
 * @returns {string} Scheduler ID
 */
const getSchedulerId = (monitorId) => `monitor:${monitorId}`;

/**
 * Check if a monitor is due for checking based on its interval
 * This prevents duplicate checks if multiple instances are running
 * @param {string} monitorId - Monitor ID
 * @param {number} interval - Interval in minutes
 * @returns {Promise<boolean>} True if monitor should be checked
 */
const shouldCheckMonitor = async (monitorId, interval) => {
  const lockKey = `lock:${monitorId}`;
  const lastRunKey = `lastRun:${monitorId}`;
  
  // Try to acquire a lock with 10 second expiry
  const acquired = await redisClient.set(lockKey, '1', 'EX', 10, 'NX');
  
  if (!acquired) {
    // Another instance is already processing this monitor
    return false;
  }
  
  try {
    // Get last run time
    const lastRun = await redisClient.get(lastRunKey);
    
    if (!lastRun) {
      // No last run time, should check
      await redisClient.set(lastRunKey, Date.now().toString());
      return true;
    }
    
    const lastRunTime = parseInt(lastRun);
    const now = Date.now();
    const intervalMs = interval * 60 * 1000;
    
    if (now - lastRunTime >= intervalMs) {
      // Time to check again
      await redisClient.set(lastRunKey, now.toString());
      return true;
    }
    
    // Not time to check yet
    return false;
  } finally {
    // Release the lock
    await redisClient.del(lockKey);
  }
};

/**
 * Schedule a monitor check
 * @param {object} monitor - Monitor object
 * @returns {void}
 */
const scheduleMonitor = (monitor) => {
  if (!monitor || !monitor._id) {
    console.error('Invalid monitor object');
    return;
  }
  
  // Unschedule if already scheduled
  unscheduleMonitor(monitor._id);
  
  // Only schedule active monitors
  if (!monitor.active) {
    return;
  }
  
  // Get cron expression from interval
  const cronExpression = intervalToCron(monitor.interval);
  
  // Schedule the job
  const job = cron.schedule(cronExpression, async () => {
    try {
      // Check if it's time to run this check
      const shouldRun = await shouldCheckMonitor(monitor._id.toString(), monitor.interval);
      
      if (!shouldRun) {
        return;
      }
      
      // Get the appropriate checker for this monitor type
      const checkerFunction = checkers[monitor.type];
      if (!checkerFunction) {
        console.error(`No checker found for monitor type: ${monitor.type}`);
        return;
      }
      
      console.log(`Running check for monitor: ${monitor.name} (${monitor._id})`);
      
      // Perform the check
      const startTime = Date.now();
      const result = await checkerFunction(monitor);
      const duration = Date.now() - startTime;
      
      console.log(`Check result for ${monitor.name}: ${result.status} (${duration}ms)`);
      
      // Save the event
      const event = await createEvent({
        monitorId: monitor._id,
        status: result.status,
        responseTime: result.responseTime || duration,
        statusCode: result.statusCode,
        message: result.message,
        details: result.details || {}
      });
      
      // Update monitor status in database
      const previousStatus = monitor.status;
      const updatedMonitor = await Monitor.findByIdAndUpdate(
        monitor._id,
        { 
          status: result.status,
          lastChecked: new Date(),
          lastResponseTime: result.responseTime || duration
        },
        { new: true }
      );
      
      // Send notification if status changed (except from pending to anything)
      if (previousStatus !== 'pending' && previousStatus !== result.status) {
        await sendNotification({
          type: 'status_change',
          monitor: {
            id: monitor._id,
            name: monitor.name,
            type: monitor.type,
            url: monitor.url || monitor.domain || monitor.ip
          },
          event: {
            id: event._id,
            previousStatus,
            currentStatus: result.status,
            message: result.message,
            responseTime: result.responseTime || duration,
            time: new Date()
          },
          userId: monitor.userId
        });
      }
      
    } catch (error) {
      console.error(`Error checking monitor ${monitor._id}:`, error);
    }
  });
  
  // Store the job in the registry
  schedulers.set(getSchedulerId(monitor._id), job);
  
  console.log(`Scheduled monitor: ${monitor.name} (${monitor._id}) with interval: ${monitor.interval} minutes`);
};

/**
 * Stop and remove a scheduled monitor
 * @param {string} monitorId - Monitor ID
 * @returns {boolean} True if scheduler was found and removed
 */
const unscheduleMonitor = (monitorId) => {
  const schedulerId = getSchedulerId(monitorId);
  const job = schedulers.get(schedulerId);
  
  if (job) {
    job.stop();
    schedulers.delete(schedulerId);
    console.log(`Unscheduled monitor: ${monitorId}`);
    return true;
  }
  
  return false;
};

/**
 * Initialize all active monitors from database
 * @returns {Promise<number>} Number of scheduled monitors
 */
const initializeSchedulers = async () => {
  try {
    const monitors = await Monitor.find({ active: true });
    
    console.log(`Found ${monitors.length} active monitors to schedule`);
    
    monitors.forEach(monitor => {
      scheduleMonitor(monitor);
    });
    
    return monitors.length;
  } catch (error) {
    console.error('Error initializing schedulers:', error);
    throw error;
  }
};

/**
 * Stop all schedulers
 * @returns {number} Number of stopped schedulers
 */
const stopAllSchedulers = () => {
  let count = 0;
  
  schedulers.forEach((job, id) => {
    job.stop();
    count++;
  });
  
  schedulers.clear();
  console.log(`Stopped ${count} schedulers`);
  
  return count;
};

/**
 * Get status of all scheduled monitors
 * @returns {object} Scheduler status information
 */
const getSchedulerStatus = () => {
  return {
    activeSchedulers: schedulers.size,
    schedulerIds: Array.from(schedulers.keys())
  };
};

module.exports = {
  scheduleMonitor,
  unscheduleMonitor,
  initializeSchedulers,
  stopAllSchedulers,
  getSchedulerStatus
};