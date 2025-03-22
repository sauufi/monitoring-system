// services/monitoring-service/tests/monitors.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Monitor = require('../models/Monitor');
const Event = require('../models/Event');
const monitoringController = require('../controllers/monitoringController');

// Mock the authentication middleware
jest.mock('../middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: '507f1f77bcf86cd799439011', role: 'user' };
    next();
  },
  authorize: (roles) => (req, res, next) => next()
}));

// Mock the axios module for external API calls
jest.mock('axios');

// Mock the node-cron module
jest.mock('node-cron', () => ({
  schedule: jest.fn(() => ({
    stop: jest.fn()
  }))
}));

// Mock the performCheck method to avoid actual network calls
jest.spyOn(monitoringController, 'performCheck').mockImplementation(async (monitor, isTest = false) => {
  return {
    status: 'up',
    responseTime: 100,
    message: 'Mock check successful',
    details: { mock: true }
  };
});

describe('Monitor API Endpoints', () => {
  beforeAll(async () => {
    // Connect to a test database
    const url = process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/monitoring-service-test';
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  beforeEach(async () => {
    // Clear collections before each test
    await Monitor.deleteMany({});
    await Event.deleteMany({});
  });

  afterAll(async () => {
    // Close database connection after all tests
    await mongoose.connection.close();
  });

  describe('GET /api/monitors', () => {
    it('should get all monitors for the authenticated user', async () => {
      // Create test monitors
      await Monitor.create([
        {
          name: 'Test Website Monitor',
          type: 'website',
          url: 'https://example.com',
          interval: 5,
          userId: '507f1f77bcf86cd799439011'
        },
        {
          name: 'Test SSL Monitor',
          type: 'ssl',
          domain: 'example.com',
          interval: 60,
          userId: '507f1f77bcf86cd799439011'
        },
        {
          name: 'Another User Monitor',
          type: 'website',
          url: 'https://example.org',
          interval: 5,
          userId: '507f1f77bcf86cd799439022' // Different user
        }
      ]);

      const res = await request(app).get('/api/monitors');

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toEqual(2); // Only monitors for the authenticated user
      expect(res.body[0].name).toEqual('Test Website Monitor');
      expect(res.body[1].name).toEqual('Test SSL Monitor');
    });
  });

  describe('POST /api/monitors', () => {
    it('should create a new monitor', async () => {
      const monitorData = {
        name: 'New Website Monitor',
        type: 'website',
        url: 'https://example.com',
        interval: 5,
        timeout: 30,
        active: true
      };

      const res = await request(app)
        .post('/api/monitors')
        .send(monitorData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.name).toEqual(monitorData.name);
      expect(res.body.data.type).toEqual(monitorData.type);
      expect(res.body.data.url).toEqual(monitorData.url);

      // Verify the monitor was saved to the database
      const savedMonitor = await Monitor.findById(res.body.data._id);
      expect(savedMonitor).toBeDefined();
      expect(savedMonitor.name).toEqual(monitorData.name);
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/monitors')
        .send({
          // Missing required fields
          type: 'website',
          interval: 5
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it('should validate type-specific required fields', async () => {
      const res = await request(app)
        .post('/api/monitors')
        .send({
          name: 'Invalid Monitor',
          type: 'website',
          // Missing url for website monitor
          interval: 5
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('GET /api/monitors/:id', () => {
    it('should get a specific monitor', async () => {
      // Create a test monitor
      const monitor = await Monitor.create({
        name: 'Test Monitor',
        type: 'website',
        url: 'https://example.com',
        interval: 5,
        userId: '507f1f77bcf86cd799439011'
      });

      const res = await request(app).get(`/api/monitors/${monitor._id}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data._id).toEqual(monitor._id.toString());
      expect(res.body.data.name).toEqual(monitor.name);
    });

    it('should return 404 for non-existent monitor', async () => {
      const res = await request(app).get('/api/monitors/507f1f77bcf86cd799439011');

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/monitors/:id', () => {
    it('should update a monitor', async () => {
      // Create a test monitor
      const monitor = await Monitor.create({
        name: 'Test Monitor',
        type: 'website',
        url: 'https://example.com',
        interval: 5,
        userId: '507f1f77bcf86cd799439011'
      });

      const updateData = {
        name: 'Updated Monitor Name',
        interval: 10,
        timeout: 60
      };

      const res = await request(app)
        .put(`/api/monitors/${monitor._id}`)
        .send(updateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.name).toEqual(updateData.name);
      expect(res.body.data.interval).toEqual(updateData.interval);
      expect(res.body.data.timeout).toEqual(updateData.timeout);

      // Verify the monitor was updated in the database
      const updatedMonitor = await Monitor.findById(monitor._id);
      expect(updatedMonitor.name).toEqual(updateData.name);
    });

    it('should return 404 for non-existent monitor', async () => {
      const res = await request(app)
        .put('/api/monitors/507f1f77bcf86cd799439011')
        .send({ name: 'Updated Name' });

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/monitors/:id', () => {
    it('should delete a monitor', async () => {
      // Create a test monitor
      const monitor = await Monitor.create({
        name: 'Test Monitor',
        type: 'website',
        url: 'https://example.com',
        interval: 5,
        userId: '507f1f77bcf86cd799439011'
      });

      const res = await request(app).delete(`/api/monitors/${monitor._id}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('deleted successfully');

      // Verify the monitor was deleted from the database
      const deletedMonitor = await Monitor.findById(monitor._id);
      expect(deletedMonitor).toBeNull();
    });

    it('should return 404 for non-existent monitor', async () => {
      const res = await request(app).delete('/api/monitors/507f1f77bcf86cd799439011');

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/monitors/:id/test', () => {
    it('should run a test check on a monitor', async () => {
      // Create a test monitor
      const monitor = await Monitor.create({
        name: 'Test Monitor',
        type: 'website',
        url: 'https://example.com',
        interval: 5,
        userId: '507f1f77bcf86cd799439011'
      });

      const res = await request(app).post(`/api/monitors/${monitor._id}/test`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.status).toEqual('up');
      expect(res.body.data.message).toEqual('Mock check successful');
    });

    it('should return 404 for non-existent monitor', async () => {
      const res = await request(app).post('/api/monitors/507f1f77bcf86cd799439011/test');

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
    });
  });
});