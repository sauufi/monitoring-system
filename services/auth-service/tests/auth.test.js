// services/auth-service/tests/auth.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');

describe('Auth API Endpoints', () => {
  beforeAll(async () => {
    // Connect to a test database
    const url = process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/auth-service-test';
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  beforeEach(async () => {
    // Clear users collection before each test
    await User.deleteMany({});
  });

  afterAll(async () => {
    // Close database connection after all tests
    await mongoose.connection.close();
  });

  describe('POST /api/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123!'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('User registered successfully');
    });

    it('should return 400 if user already exists', async () => {
      // Create a user first
      await User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'Password123!'
      });

      // Try to register the same email
      const res = await request(app)
        .post('/api/register')
        .send({
          name: 'Existing User',
          email: 'existing@example.com',
          password: 'Password123!'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('User already exists');
    });

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({
          name: '',
          email: 'invalid-email',
          password: 'weak'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/login', () => {
    beforeEach(async () => {
      // Create a test user before each login test
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        verified: true
      });
      await user.save();
    });

    it('should login user and return token', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('test@example.com');
    });

    it('should return 400 for invalid credentials', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123!'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid credentials');
    });
  });

  describe('GET /api/profile', () => {
    let token;

    beforeEach(async () => {
      // Create a test user and get token
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123!',
        verified: true
      });
      await user.save();

      // Login to get token
      const loginRes = await request(app)
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!'
        });

      token = loginRes.body.token;
    });

    it('should get user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.email).toBe('test@example.com');
      expect(res.body.data.password).toBeUndefined(); // Password should not be returned
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 with no token', async () => {
      const res = await request(app)
        .get('/api/profile');

      expect(res.statusCode).toEqual(401);
      expect(res.body.success).toBe(false);
    });
  });
});