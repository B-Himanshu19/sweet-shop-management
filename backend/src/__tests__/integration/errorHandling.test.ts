import request from 'supertest';
import app from '../../server';
import { database } from '../../database/database';
import { authService } from '../../services/authService';

/**
 * Integration tests for error handling and edge cases
 * Tests API responses for various error conditions and invalid inputs
 */
describe('Error Handling Integration Tests', () => {
  beforeAll(async () => {
    await database.run('DELETE FROM users');
  });

  afterAll(async () => {
    await database.run('DELETE FROM users');
  });

  describe('POST /api/auth/register - Error Cases', () => {
    beforeEach(async () => {
      await database.run('DELETE FROM users');
    });

    it('should return 400 for missing username', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 for missing email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'not-an-email',
          password: 'password123',
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for short username', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'ab',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for short password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'validuser',
          email: 'test@example.com',
          password: '123',
        });

      expect(response.status).toBe(400);
    });

    it('should return 409 when username already exists', async () => {
      await authService.register({
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123',
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'existinguser',
          email: 'another@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(409);
    });

    it('should return 409 when email already exists', async () => {
      await authService.register({
        username: 'user1',
        email: 'shared@example.com',
        password: 'password123',
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'user2',
          email: 'shared@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(409);
    });
  });

  describe('POST /api/auth/login - Error Cases', () => {
    beforeEach(async () => {
      await database.run('DELETE FROM users');
    });

    it('should return 400 for missing username', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123',
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
        });

      expect(response.status).toBe(400);
    });

    it('should return 401 for invalid username', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistent',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 for wrong password', async () => {
      await authService.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Protected Routes - Authorization Errors', () => {
    let userToken: string;
    let adminToken: string;

    beforeAll(async () => {
      await database.run('DELETE FROM users');
      await database.run('DELETE FROM sweets');

      // Create users
      await authService.register({
        username: 'regularuser',
        email: 'user@example.com',
        password: 'password123',
      });
      const userLogin = await authService.login('regularuser', 'password123');
      userToken = userLogin.token;

      await authService.register({
        username: 'adminuser',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
      });
      const adminLogin = await authService.login('adminuser', 'password123');
      adminToken = adminLogin.token;
    });

    it('should return 401 when accessing protected route without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 401 with invalid token format', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'InvalidToken');

      expect(response.status).toBe(401);
    });

    it('should return 403 with malformed Bearer token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(response.status).toBe(403);
    });

    it('should return 403 when accessing admin-only endpoint as regular user', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Test Sweet',
          category: 'Test',
          price: 5.99,
        });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });

    it('should allow access with valid admin token', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });

    it('should allow access with valid user token', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('POST /api/sweets - Validation Errors', () => {
    let adminToken: string;

    beforeAll(async () => {
      await database.run('DELETE FROM users');
      const admin = await authService.register({
        username: 'admin',
        email: 'admin@example.com',
        password: 'password123',
        role: 'admin',
      });
      const login = await authService.login('admin', 'password123');
      adminToken = login.token;
    });

    it('should return 400 for missing name', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          category: 'Test',
          price: 5.99,
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for missing category', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Sweet',
          price: 5.99,
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for missing price', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Sweet',
          category: 'Test',
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for negative price', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Sweet',
          category: 'Test',
          price: -5.99,
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for non-numeric price', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Sweet',
          category: 'Test',
          price: 'not-a-price',
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for negative quantity', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Sweet',
          category: 'Test',
          price: 5.99,
          quantity: -10,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/sweets/:id - Not Found Errors', () => {
    let token: string;

    beforeAll(async () => {
      await database.run('DELETE FROM users');
      const user = await authService.register({
        username: 'user',
        email: 'user@example.com',
        password: 'password123',
      });
      const login = await authService.login('user', 'password123');
      token = login.token;
    });

    it('should return 404 for non-existent sweet', async () => {
      const response = await request(app)
        .get('/api/sweets/99999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it('should return 400 or 500 for invalid sweet ID format', async () => {
      const response = await request(app)
        .get('/api/sweets/invalid-id')
        .set('Authorization', `Bearer ${token}`);

      // Invalid ID gets caught and returns error status
      expect([400, 500]).toContain(response.status);
    });
  });
});
