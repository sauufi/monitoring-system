// gateway/app.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Service Routes
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';
const MONITORING_SERVICE_URL = process.env.MONITORING_SERVICE_URL || 'http://monitoring-service:3002';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3003';
const STATUS_PAGE_SERVICE_URL = process.env.STATUS_PAGE_SERVICE_URL || 'http://status-page-service:3004';

// Auth Service Proxy
app.use('/api/auth', createProxyMiddleware({
  target: AUTH_SERVICE_URL,
  pathRewrite: {
    '^/api/auth': '/api'
  },
  changeOrigin: true
}));

// Monitoring Service Proxy
app.use('/api/monitoring', createProxyMiddleware({
  target: MONITORING_SERVICE_URL,
  pathRewrite: {
    '^/api/monitoring': '/api'
  },
  changeOrigin: true
}));

// Notification Service Proxy
app.use('/api/notifications', createProxyMiddleware({
  target: NOTIFICATION_SERVICE_URL,
  pathRewrite: {
    '^/api/notifications': '/api'
  },
  changeOrigin: true
}));

// Status Page Service Proxy - private endpoints
app.use('/api/status-pages', createProxyMiddleware({
  target: STATUS_PAGE_SERVICE_URL,
  pathRewrite: {
    '^/api/status-pages': '/api/status-pages'
  },
  changeOrigin: true
}));

// Status Page Service Proxy - public endpoints
app.use('/public/status-pages', createProxyMiddleware({
  target: STATUS_PAGE_SERVICE_URL,
  pathRewrite: {
    '^/public/status-pages': '/public/status-pages'
  },
  changeOrigin: true
}));

// Error handling
app.use((err, req, res, next) => {
  console.error('Gateway error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Serve static files for the frontend
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});

module.exports = app;