// services/notification-service/services/emailService.js
const nodemailer = require('nodemailer');
const config = require('../config/config');

// Create transporter
const transporter = nodemailer.createTransport(config.email.smtp);

/**
 * Verify SMTP connection
 * @returns {Promise<boolean>} True if connection successful
 */
const verifyConnection = async () => {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('SMTP connection error:', error);
    return false;
  }
};

/**
 * Send email notification
 * @param {Object} notification - Notification object
 * @param {Object} channel - Email channel configuration
 * @returns {Promise<Object>} Email send result
 */
const sendNotification = async (notification, channel) => {
  // Format email based on notification type
  const emailContent = formatEmailContent(notification);
  
  // Send email
  const mailOptions = {
    from: config.email.from,
    to: channel.config.email,
    subject: emailContent.subject,
    text: emailContent.text,
    html: emailContent.html
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

/**
 * Format email content based on notification type
 * @param {Object} notification - Notification object
 * @returns {Object} Formatted email content
 */
const formatEmailContent = (notification) => {
  // Base subject
  const subject = `[Monitoring] ${notification.title}`;
  
  // Build HTML content
  let html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${getColorForNotification(notification)};">
        ${notification.title}
      </h2>
      <p>${notification.message}</p>
  `;
  
  // Add notification data
  if (notification.data) {
    // Status change notification
    if (notification.type === 'status_changed' && notification.data.monitor) {
      html += `
        <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 4px;">
          <p><strong>Monitor:</strong> ${notification.data.monitor.name}</p>
          <p><strong>Type:</strong> ${notification.data.monitor.type}</p>
          <p><strong>Previous Status:</strong> ${notification.data.previousStatus}</p>
          <p><strong>Current Status:</strong> ${notification.data.currentStatus}</p>
          <p><strong>Time:</strong> ${new Date(notification.data.time).toLocaleString()}</p>
        </div>
      `;
    }
    
    // SSL expiry notification
    if (notification.type === 'ssl_expiry' && notification.data.ssl) {
      html += `
        <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 4px;">
          <p><strong>Domain:</strong> ${notification.data.monitor.domain}</p>
          <p><strong>Expiry Date:</strong> ${new Date(notification.data.ssl.validTo).toLocaleString()}</p>
          <p><strong>Days Remaining:</strong> ${notification.data.ssl.daysRemaining}</p>
          <p><strong>Issuer:</strong> ${notification.data.ssl.issuer}</p>
        </div>
      `;
    }
  }
  
  // Add action button
  html += `
    <div style="margin: 20px 0;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/monitors/${notification.monitorId}" 
         style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
        View Monitor
      </a>
    </div>
  `;
  
  // Close wrapper
  html += `
    </div>
  `;
  
  // Plain text version
  const text = `
    ${notification.title}
    
    ${notification.message}
    
    ${notification.data ? formatTextData(notification) : ''}
    
    View monitor: ${process.env.FRONTEND_URL || 'http://localhost:3000'}/monitors/${notification.monitorId}
  `;
  
  return {
    subject,
    html,
    text
  };
};

/**
 * Format text data for plain text emails
 * @param {Object} notification - Notification object
 * @returns {string} Formatted text
 */
const formatTextData = (notification) => {
  let text = '';
  
  if (notification.type === 'status_changed' && notification.data.monitor) {
    text += `
      Monitor: ${notification.data.monitor.name}
      Type: ${notification.data.monitor.type}
      Previous Status: ${notification.data.previousStatus}
      Current Status: ${notification.data.currentStatus}
      Time: ${new Date(notification.data.time).toLocaleString()}
    `;
  }
  
  if (notification.type === 'ssl_expiry' && notification.data.ssl) {
    text += `
      Domain: ${notification.data.monitor.domain}
      Expiry Date: ${new Date(notification.data.ssl.validTo).toLocaleString()}
      Days Remaining: ${notification.data.ssl.daysRemaining}
      Issuer: ${notification.data.ssl.issuer}
    `;
  }
  
  return text;
};

/**
 * Get appropriate color for notification type
 * @param {Object} notification - Notification object
 * @returns {string} Color hex code
 */
const getColorForNotification = (notification) => {
  if (notification.type === 'status_changed') {
    return notification.data?.currentStatus === 'up' ? '#4CAF50' : '#F44336';
  }
  
  if (notification.type === 'ssl_expiry' || notification.type === 'domain_expiry') {
    return '#FF9800';
  }
  
  return '#2196F3';
};

/**
 * Verify email channel by sending a test email
 * @param {Object} channel - Channel to verify
 * @returns {Promise<Object>} Verification result
 */
const verifyChannel = async (channel) => {
  const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  const mailOptions = {
    from: config.email.from,
    to: channel.config.email,
    subject: '[Monitoring] Verify your email notification channel',
    text: `Your verification code is: ${verificationCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2196F3;">Verify Your Email Channel</h2>
        <p>Thank you for setting up email notifications for the Monitoring System.</p>
        <p>Your verification code is:</p>
        <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 4px; text-align: center; font-size: 24px; font-weight: bold;">
          ${verificationCode}
        </div>
        <p>Please enter this code in the application to complete the verification process.</p>
      </div>
    `
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    return {
      success: true,
      verificationCode,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Email verification error:', error);
    throw error;
  }
};

module.exports = {
  sendNotification,
  verifyConnection,
  verifyChannel
};