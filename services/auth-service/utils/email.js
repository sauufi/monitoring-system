// services/auth-service/utils/email.js
const nodemailer = require('nodemailer');

/**
 * Create email transporter
 * @returns {object} Nodemailer transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
};

/**
 * Send email verification to user
 * @param {string} email - User's email address
 * @param {string} token - Verification token
 * @returns {Promise} Email sending result
 */
const sendVerificationEmail = async (email, token) => {
  const transporter = createTransporter();
  
  // Create frontend verification URL
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'monitoring@example.com',
    to: email,
    subject: 'Verify Your Email Address',
    text: `
      Hello,
      
      Thank you for registering with the Monitoring System.
      
      Please verify your email address by clicking the following link:
      ${verificationUrl}
      
      This link will expire in 24 hours.
      
      If you did not register for an account, please ignore this email.
      
      Best regards,
      The Monitoring System Team
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verify Your Email Address</h2>
        <p>Hello,</p>
        <p>Thank you for registering with the Monitoring System.</p>
        <p>Please verify your email address by clicking the button below:</p>
        <p>
          <a href="${verificationUrl}" 
             style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Verify Email
          </a>
        </p>
        <p>Or copy and paste this link in your browser:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not register for an account, please ignore this email.</p>
        <p>Best regards,<br>The Monitoring System Team</p>
      </div>
    `
  };
  
  return transporter.sendMail(mailOptions);
};

/**
 * Send password reset email to user
 * @param {string} email - User's email address
 * @param {string} token - Reset token
 * @returns {Promise} Email sending result
 */
const sendPasswordResetEmail = async (email, token) => {
  const transporter = createTransporter();
  
  // Create frontend reset URL
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'monitoring@example.com',
    to: email,
    subject: 'Reset Your Password',
    text: `
      Hello,
      
      You are receiving this email because you (or someone else) has requested to reset the password for your account.
      
      Please reset your password by clicking the following link:
      ${resetUrl}
      
      This link will expire in 10 minutes.
      
      If you did not request this, please ignore this email and your password will remain unchanged.
      
      Best regards,
      The Monitoring System Team
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset Your Password</h2>
        <p>Hello,</p>
        <p>You are receiving this email because you (or someone else) has requested to reset the password for your account.</p>
        <p>Please reset your password by clicking the button below:</p>
        <p>
          <a href="${resetUrl}" 
             style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>Or copy and paste this link in your browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
        <p>Best regards,<br>The Monitoring System Team</p>
      </div>
    `
  };
  
  return transporter.sendMail(mailOptions);
};

/**
 * Send welcome email to user after verification
 * @param {string} email - User's email address
 * @param {string} name - User's name
 * @returns {Promise} Email sending result
 */
const sendWelcomeEmail = async (email, name) => {
  const transporter = createTransporter();
  
  const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'monitoring@example.com',
    to: email,
    subject: 'Welcome to the Monitoring System',
    text: `
      Hello ${name},
      
      Thank you for verifying your email address. Your account is now active and you can log in to the Monitoring System.
      
      Login URL: ${loginUrl}
      
      Best regards,
      The Monitoring System Team
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to the Monitoring System</h2>
        <p>Hello ${name},</p>
        <p>Thank you for verifying your email address. Your account is now active and you can log in to the Monitoring System.</p>
        <p>
          <a href="${loginUrl}" 
             style="background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Log in to your account
          </a>
        </p>
        <p>Best regards,<br>The Monitoring System Team</p>
      </div>
    `
  };
  
  return transporter.sendMail(mailOptions);
};

/**
 * Send alert notification for account security
 * @param {string} email - User's email address
 * @param {string} action - Security action (login, password change, etc.)
 * @param {object} metadata - Additional information
 * @returns {Promise} Email sending result
 */
const sendSecurityAlert = async (email, action, metadata = {}) => {
  const transporter = createTransporter();
  
  const date = new Date().toLocaleString();
  const ip = metadata.ip || 'Unknown';
  const device = metadata.device || 'Unknown';
  const location = metadata.location || 'Unknown';
  
  let subject, content;
  
  switch (action) {
    case 'login':
      subject = 'New Login to Your Account';
      content = {
        title: 'New Login Detected',
        message: 'Your account was recently accessed from a new device or location.'
      };
      break;
    case 'password_change':
      subject = 'Your Password Has Been Changed';
      content = {
        title: 'Password Changed',
        message: 'Your account password was recently changed.'
      };
      break;
    case 'email_change':
      subject = 'Your Email Address Has Been Changed';
      content = {
        title: 'Email Address Changed',
        message: 'Your account email address was recently changed.'
      };
      break;
    default:
      subject = 'Security Alert';
      content = {
        title: 'Security Alert',
        message: 'There was a recent security event on your account.'
      };
  }
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'monitoring@example.com',
    to: email,
    subject,
    text: `
      Hello,
      
      ${content.message}
      
      Details:
      - Date: ${date}
      - IP Address: ${ip}
      - Device: ${device}
      - Location: ${location}
      
      If this was not you, please reset your password immediately and contact support.
      
      Best regards,
      The Monitoring System Team
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${content.title}</h2>
        <p>Hello,</p>
        <p>${content.message}</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Details:</strong></p>
          <ul style="margin: 10px 0;">
            <li>Date: ${date}</li>
            <li>IP Address: ${ip}</li>
            <li>Device: ${device}</li>
            <li>Location: ${location}</li>
          </ul>
        </div>
        <p>If this was not you, please reset your password immediately and contact support.</p>
        <p>Best regards,<br>The Monitoring System Team</p>
      </div>
    `
  };
  
  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendSecurityAlert
};