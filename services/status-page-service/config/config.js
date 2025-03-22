// services/status-page-service/config/config.js
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../../.env') });

module.exports = {
  // Service Configuration
  servicePort: process.env.STATUS_PAGE_SERVICE_PORT || 3004,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // MongoDB Configuration
  mongodb: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/status-page-service',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  
  // Auth Service Configuration
  authService: {
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001'
  },
  
  // Monitoring Service Configuration
  monitoringService: {
    url: process.env.MONITORING_SERVICE_URL || 'http://localhost:3002',
    internalUrl: process.env.MONITORING_SERVICE_INTERNAL_URL || 'http://monitoring-service:3002'
  },
  
  // Status Page Configuration
  statusPage: {
    defaultTheme: {
      primaryColor: '#4CAF50',
      backgroundColor: '#ffffff',
      logoUrl: ''
    },
    customDomainEnabled: process.env.CUSTOM_DOMAIN_ENABLED === 'true',
    maxIncidents: 100 // Maximum number of incidents to return in public API
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