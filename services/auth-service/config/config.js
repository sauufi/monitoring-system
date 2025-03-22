// services/auth-service/config/config.js
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../../.env') });

module.exports = {
  // Service Configuration
  servicePort: process.env.AUTH_SERVICE_PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'default_jwt_secret_dev_only',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  
  // MongoDB Configuration
  mongodb: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/auth-service',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  
  // Email Configuration (for password reset, etc.)
  email: {
    from: process.env.EMAIL_FROM || 'noreply@monitoring-system.com',
    smtp: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    }
  },
  
  // Frontend URL (for email links)
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204
  }
};