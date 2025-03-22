// services/monitoring-service/app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config/config');
const monitoringController = require('./controllers/monitoringController');
const Monitor = require('./models/Monitor');

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
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later'
});

// Apply rate limiting to all routes
app.use('/api', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'monitoring-service', timestamp: new Date() });
});

// Routes
app.use('/api/monitors', require('./routes/monitors'));

// Internal API for status page service
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

// Initialize: Schedule all active monitors on startup
async function initializeMonitors() {
  try {
    const monitors = await Monitor.find({ active: true });
    monitors.forEach(monitor => {
      monitoringController.scheduleMonitor(monitor);
    });
    console.log(`Scheduled ${monitors.length} active monitors`);
  } catch (error) {
    console.error('Error initializing monitors:', error);
  }
}

// Start server
const PORT = config.servicePort;
const server = app.listen(PORT, () => {
  console.log(`Monitoring service running on port ${PORT}`);
  
  // Initialize monitors after server starts
  initializeMonitors();
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;