// services/notification-service/config/config.js
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../../.env') });

module.exports = {
  // Service Configuration
  servicePort: process.env.NOTIFICATION_SERVICE_PORT || 3003,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // MongoDB Configuration
  mongodb: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/notification-service',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  
  // Auth Service Configuration
  authService: {
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001'
  },
  
  // Email Configuration
  email: {
    from: process.env.EMAIL_FROM || 'monitoring@example.com',
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    }
  },
  
  // WhatsApp Configuration
  whatsapp: {
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID
  },
  
  // Telegram Configuration
  telegram: {
    apiUrl: 'https://api.telegram.org/bot'
  },
  
  // Rate Limiting Configuration
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  
  // CORS Configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204
  }
};