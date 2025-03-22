// services/status-page-service/app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config/config');

// Initialize express app
const app = express();

// Connect to MongoDB
mongoose.connect(config.mongodb.uri, config.mongodb.options)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(helmet()); // Security headers
app.use(cors(config.cors)); // CORS configuration
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: config.rateLimiting.windowMs,
  max: config.rateLimiting.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later'
});

// Apply rate limiting to private API
app.use('/api', apiLimiter);

// Public API rate limiting (less restrictive)
const publicLimiter = rateLimit({
  windowMs: config.rateLimiting.windowMs,
  max: config.rateLimiting.max * 5, // More generous limit for public endpoints
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting to public API
app.use('/public', publicLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'status-page-service', timestamp: new Date() });
});

// Routes
app.use('/api/status-pages', require('./routes/statusPages'));
app.use('/api/incidents', require('./routes/incidents'));
app.use('/public/status-pages', require('./routes/public'));

// Internal API for monitoring service
app.use('/internal', require('./routes/internal'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  res.status(500).json({
    success: false,
    message: 'Server Error',
    error: config.nodeEnv === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = config.servicePort;
app.listen(PORT, () => {
  console.log(`Status page service running on port ${PORT}`);
});

module.exports = app;