// auth-service/src/app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { errorHandler } = require('./middlewares/errorHandler');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const internalRoutes = require('./routes/internal');
const logger = require('./utils/logger');
require('dotenv').config();

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/auth-service';
mongoose
  .connect(MONGO_URI)
  .then(() => {
    logger.info('MongoDB connected');
  })
  .catch((err) => {
    logger.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/internal', internalRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'auth-service' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.AUTH_SERVICE_PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Auth service running on port ${PORT}`);
});

module.exports = app;
