// services/monitoring-service/config/config.js
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../../.env') });

module.exports = {
  // Service Configuration
  servicePort: process.env.MONITORING_SERVICE_PORT || 3002,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // MongoDB Configuration
  mongodb: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/monitoring-service',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  
  // Auth Service Configuration
  authService: {
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001'
  },
  
  // Notification Service Configuration
  notificationService: {
    url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3003'
  },
  
  // Monitoring Configuration
  monitoring: {
    minInterval: 1, // Minimum interval in minutes
    maxInterval: 1440, // Maximum interval in minutes (24 hours)
    defaultInterval: 5, // Default interval in minutes
    minTimeout: 1, // Minimum timeout in seconds
    maxTimeout: 120, // Maximum timeout in seconds
    defaultTimeout: 30, // Default timeout in seconds
    maxRetries: 3, // Maximum number of retries
    userMonitorLimit: process.env.USER_MONITOR_LIMIT || 50 // Maximum monitors per user
  },
  
  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204
  }
};