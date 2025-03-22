// services/monitoring-service/controllers/monitoringController.js
const axios = require('axios');
const ping = require('ping');
const { sslChecker } = require('ssl-checker');
const dns = require('dns').promises;
const net = require('net');
const http = require('http');
const https = require('https');
const cheerio = require('cheerio');
const cron = require('node-cron');
const Monitor = require('../models/Monitor');
const Event = require('../models/Event');

// Store scheduled jobs in memory
const scheduledJobs = new Map();

/**
 * Schedule a monitor check based on its interval
 * @param {Object} monitor - Monitor document
 */
exports.scheduleMonitor = (monitor) => {
  // Remove any existing schedule
  this.removeMonitorSchedule(monitor._id);
  
  // Only schedule if monitor is active
  if (!monitor.active) {
    return;
  }
  
  // Create cron expression from interval (minutes)
  // * * * * * = every minute
  // */5 * * * * = every 5 minutes
  const cronExpression = `*/${monitor.interval} * * * *`;
  
  // Schedule new job
  const job = cron.schedule(cronExpression, () => {
    this.performCheck(monitor);
  });
  
  // Store job reference
  scheduledJobs.set(monitor._id.toString(), job);
  
  console.log(`Scheduled monitor ${monitor._id} to run every ${monitor.interval} minutes`);
};

/**
 * Remove a monitor's schedule
 * @param {string} monitorId - Monitor ID
 */
exports.removeMonitorSchedule = (monitorId) => {
  const id = monitorId.toString();
  if (scheduledJobs.has(id)) {
    scheduledJobs.get(id).stop();
    scheduledJobs.delete(id);
    console.log(`Removed schedule for monitor ${id}`);
  }
};

/**
 * Perform a check on a monitor
 * @param {Object} monitor - Monitor document
 * @param {boolean} isTest - Whether this is a test check (not saving to DB)
 * @returns {Object} Check result
 */
exports.performCheck = async (monitor, isTest = false) => {
  try {
    // Get the appropriate checker function
    const checkFunction = this.getCheckerFunction(monitor.type);
    if (!checkFunction) {
      throw new Error(`No checker function for monitor type: ${monitor.type}`);
    }
    
    // Perform the check
    const result = await checkFunction(monitor);
    
    if (!isTest) {
      // Save the event
      const event = new Event({
        monitorId: monitor._id,
        status: result.status,
        responseTime: result.responseTime,
        statusCode: result.statusCode,
        message: result.message,
        details: result.details
      });
      await event.save();
      
      // Update monitor status
      const oldStatus = monitor.status;
      monitor.status = result.status;
      monitor.lastChecked = new Date();
      monitor.nextCheck = new Date(Date.now() + monitor.interval * 60 * 1000);
      await monitor.save();
      
      // If status changed, send notification
      if (oldStatus !== 'pending' && oldStatus !== result.status) {
        await this.sendStatusChangeNotification(monitor, oldStatus, result);
      }
    }
    
    return result;
  } catch (error) {
    console.error(`Error checking monitor ${monitor._id}:`, error);
    
    // For test checks, propagate the error
    if (isTest) {
      throw error;
    }
    
    // For scheduled checks, log the error but don't crash
    return {
      status: 'down',
      responseTime: 0,
      message: `Error during check: ${error.message}`,
      details: {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      }
    };
  }
};

/**
 * Send notification for status change
 * @param {Object} monitor - Monitor document
 * @param {string} previousStatus - Previous status
 * @param {Object} result - Check result
 */
exports.sendStatusChangeNotification = async (monitor, previousStatus, result) => {
  try {
    // Skip notification if monitor doesn't want notifications for this event type
    if (
      (result.status === 'down' && !monitor.notifications.downtime) ||
      (result.status === 'up' && !monitor.notifications.uptime)
    ) {
      return;
    }
    
    // Send notification via the notification service
    await axios.post(
      `${process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3003'}/api/notifications`,
      {
        type: 'status_changed',
        monitor: {
          id: monitor._id,
          name: monitor.name,
          type: monitor.type,
          url: monitor.url || monitor.domain || monitor.ip
        },
        event: {
          previousStatus,
          currentStatus: result.status,
          message: result.message,
          time: new Date()
        },
        userId: monitor.userId
      }
    );
    
    console.log(`Sent status change notification for monitor ${monitor._id}`);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

/**
 * Get uptime history for a monitor
 * @param {string} monitorId - Monitor ID
 * @param {number} days - Number of days to get history for
 * @returns {Array} Array of daily uptime percentages
 */
exports.getUptimeHistory = async (monitorId, days = 30) => {
  const results = [];
  const endDate = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(endDate.getDate() - i);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    
    // Get total events for the day
    const totalEvents = await Event.countDocuments({
      monitorId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    
    // Get up events for the day
    const upEvents = await Event.countDocuments({
      monitorId,
      status: 'up',
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    
    // Calculate percentage
    const percentage = totalEvents === 0 ? 0 : (upEvents / totalEvents) * 100;
    
    // Add to results
    results.unshift({
      date: startOfDay.toISOString().split('T')[0],
      uptime: percentage.toFixed(2),
      totalChecks: totalEvents,
      successfulChecks: upEvents
    });
  }
  
  return results;
};

/**
 * Get checker function for a monitor type
 * @param {string} type - Monitor type
 * @returns {Function} Checker function
 */
exports.getCheckerFunction = (type) => {
  const checkers = {
    website: this.checkWebsite,
    ssl: this.checkSSL,
    domain: this.checkDomain,
    ping: this.checkPing,
    port: this.checkPort,
    tcp: this.checkTCP,
    keyword: this.checkKeyword,
    cron: this.checkCron
  };
  
  return checkers[type];
};

/**
 * Check a website monitor
 * @param {Object} monitor - Monitor document
 * @returns {Object} Check result
 */
exports.checkWebsite = async (monitor) => {
  const startTime = Date.now();
  
  try {
    // Set up request config
    const config = {
      method: monitor.method || 'GET',
      timeout: monitor.timeout * 1000,
      headers: monitor.headers || {}
    };
    
    // Add request body if needed
    if (['POST', 'PUT', 'PATCH'].includes(config.method) && monitor.body) {
      config.data = monitor.body;
    }
    
    // Make request
    const response = await axios(monitor.url, config);
    
    const responseTime = Date.now() - startTime;
    const status = (monitor.expectedStatus ? 
      response.status === monitor.expectedStatus : 
      response.status >= 200 && response.status < 400) ? 'up' : 'down';
    
    return {
      status,
      responseTime,
      statusCode: response.status,
      message: status === 'up' ? 'Website is up' : 'Website returned unexpected status code',
      details: {
        headers: response.headers,
        body: response.data ? String(response.data).substring(0, 500) : null // Truncate response body
      }
    };
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - startTime,
      statusCode: error.response?.status,
      message: error.message,
      details: {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      }
    };
  }
};

/**
 * Check an SSL certificate monitor
 * @param {Object} monitor - Monitor document
 * @returns {Object} Check result
 */
exports.checkSSL = async (monitor) => {
  try {
    const result = await sslChecker(monitor.domain);
    
    // SSL is considered down if it will expire in less than 7 days
    const daysUntilExpiry = result.daysRemaining;
    const sslStatus = result.valid && daysUntilExpiry > 7 ? 'up' : 'down';
    
    let message = result.valid ? 
      `SSL valid until ${result.validTo}` : 
      'SSL certificate invalid';
    
    if (result.valid && daysUntilExpiry <= 7) {
      message = `SSL certificate expires in ${daysUntilExpiry} days`;
    }
    
    return {
      status: sslStatus,
      responseTime: 0,
      message,
      details: {
        ssl: {
          issuer: result.issuer,
          validFrom: result.validFrom,
          validTo: result.validTo,
          daysRemaining: result.daysRemaining
        }
      }
    };
  } catch (error) {
    return {
      status: 'down',
      responseTime: 0,
      message: error.message,
      details: {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      }
    };
  }
};

/**
 * Check a domain monitor
 * @param {Object} monitor - Monitor document
 * @returns {Object} Check result
 */
exports.checkDomain = async (monitor) => {
  try {
    const result = await dns.lookup(monitor.domain);
    
    return {
      status: 'up',
      responseTime: 0,
      message: `Domain resolves to ${result.address}`,
      details: { ip: result.address }
    };
  } catch (error) {
    return {
      status: 'down',
      responseTime: 0,
      message: error.message,
      details: {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      }
    };
  }
};

/**
 * Check a ping monitor
 * @param {Object} monitor - Monitor document
 * @returns {Object} Check result
 */
exports.checkPing = async (monitor) => {
  try {
    const startTime = Date.now();
    const result = await ping.promise.probe(monitor.ip || monitor.domain, {
      timeout: monitor.timeout
    });
    const responseTime = Date.now() - startTime;
    
    return {
      status: result.alive ? 'up' : 'down',
      responseTime,
      message: result.alive ? 
        `Ping successful (${result.time}ms)` : 
        'Ping failed',
      details: {
        output: result.output,
        time: result.time,
        min: result.min,
        max: result.max,
        avg: result.avg
      }
    };
  } catch (error) {
    return {
      status: 'down',
      responseTime: 0,
      message: error.message,
      details: {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      }
    };
  }
};

/**
 * Check a port monitor
 * @param {Object} monitor - Monitor document
 * @returns {Object} Check result
 */
exports.checkPort = async (monitor) => {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const socket = new net.Socket();
    let isResolved = false;
    
    socket.setTimeout(monitor.timeout * 1000);
    
    socket.on('connect', () => {
      if (isResolved) return;
      isResolved = true;
      socket.destroy();
      
      resolve({
        status: 'up',
        responseTime: Date.now() - startTime,
        message: `Port ${monitor.port} is open`,
        details: {
          ip: monitor.ip,
          port: monitor.port
        }
      });
    });
    
    socket.on('timeout', () => {
      if (isResolved) return;
      isResolved = true;
      socket.destroy();
      
      resolve({
        status: 'down',
        responseTime: monitor.timeout * 1000,
        message: `Connection to port ${monitor.port} timed out`,
        details: {
          ip: monitor.ip,
          port: monitor.port
        }
      });
    });
    
    socket.on('error', (error) => {
      if (isResolved) return;
      isResolved = true;
      socket.destroy();
      
      resolve({
        status: 'down',
        responseTime: Date.now() - startTime,
        message: error.message,
        details: {
          ip: monitor.ip,
          port: monitor.port,
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack
          }
        }
      });
    });
    
    socket.connect(monitor.port, monitor.ip || monitor.domain);
  });
};

/**
 * Check a TCP monitor
 * @param {Object} monitor - Monitor document
 * @returns {Object} Check result
 */
exports.checkTCP = async (monitor) => {
  // TCP check is similar to port check but with specific handshake or data
  return this.checkPort(monitor);
};

/**
 * Check a keyword monitor
 * @param {Object} monitor - Monitor document
 * @returns {Object} Check result
 */
exports.checkKeyword = async (monitor) => {
  const startTime = Date.now();
  
  try {
    const response = await axios.get(monitor.url, {
      timeout: monitor.timeout * 1000
    });
    
    const responseTime = Date.now() - startTime;
    const $ = cheerio.load(response.data);
    const pageContent = $('body').text();
    const keywordFound = pageContent.includes(monitor.keyword);
    
    return {
      status: keywordFound ? 'up' : 'down',
      responseTime,
      statusCode: response.status,
      message: keywordFound ? 
        `Keyword "${monitor.keyword}" found` : 
        `Keyword "${monitor.keyword}" not found`,
      details: {
        headers: response.headers,
        body: response.data ? String(response.data).substring(0, 500) : null // Truncate response body
      }
    };
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - startTime,
      statusCode: error.response?.status,
      message: error.message,
      details: {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      }
    };
  }
};

/**
 * Check a cron job monitor
 * @param {Object} monitor - Monitor document
 * @returns {Object} Check result
 */
exports.checkCron = async (monitor) => {
  // For cron jobs, we just check if the endpoint returns success
  return this.checkWebsite(monitor);
};