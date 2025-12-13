import request from 'supertest';
import app from '../../server';
import { database } from '../../database/database';
import { authService } from '../../services/authService';

describe('Sweets API Integration Tests', () => {
  let userToken: string;
  let adminToken: string;
  let adminUser: any;

  beforeAll(async () => {
    await database.run('DELETE FROM sweets');
    await database.run('DELETE FROM users');

    // Create regular user
    const user = await authService.register({
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'password123',
    });
    const loginResult = await authService.login('testuser', 'password123');
    userToken = loginResult.token;

    // Create admin user
    adminUser = await authService.register({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
    });
    const adminLoginResult = await authService.login('admin', 'admin123');
    adminToken = adminLoginResult.token;
  });

  afterAll(async () => {
    await database.run('DELETE FROM sweets');
    await database.run('DELETE FROM users');
  });

  describe('POST /api/sweets', () => {
    it('should create sweet as admin', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Chocolate',
          category: 'Chocolate',
          price: 5.99,
          quantity: 10,
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Test Chocolate');
    });

    it('should return 403 for non-admin user', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Unauthorized Sweet',
          category: 'Test',
          price: 1.99,
        });

      expect(response.status).toBe(403);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/sweets')
        .send({
          name: 'No Auth Sweet',
          category: 'Test',
          price: 1.99,
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/sweets', () => {
    it('should get all sweets with authentication', async () => {
      const response = await request(app)
        .get('/api/sweets')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /api/sweets/search', () => {
    beforeEach(async () => {
      await database.run('DELETE FROM sweets');
      await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Search Test', category: 'Test', price: 3.99, quantity: 5 });
    });

    it('should search sweets by name', async () => {
      const response = await request(app)
        .get('/api/sweets/search?name=Search')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/sweets/:id/purchase', () => {
    it('should purchase sweet successfully as user', async () => {
      // Create a fresh sweet for this test
      const createResponse = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'User Purchase Test', category: 'Test', price: 2.99, quantity: 10 });
      const sweetId = createResponse.body.id;

      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 2 });

      expect(response.status).toBe(200);
      expect(response.body.sweet.quantity).toBe(8);
      expect(response.body.message).toBe('Purchase successful');
    });

    it('should purchase sweet successfully as admin', async () => {
      // Create a new sweet for admin purchase test
      const createResponse = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Admin Purchase Test', category: 'Test', price: 3.99, quantity: 15 });
      const adminSweetId = createResponse.body.id;

      const response = await request(app)
        .post(`/api/sweets/${adminSweetId}/purchase`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 3 });

      expect(response.status).toBe(200);
      expect(response.body.sweet.quantity).toBe(12);
      expect(response.body.message).toBe('Purchase successful');
    });

    it('should decrease quantity correctly', async () => {
      // Create a fresh sweet for this test
      const createResponse = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Quantity Test', category: 'Test', price: 1.99, quantity: 5 });
      const sweetId = createResponse.body.id;

      // Get initial quantity
      const initialResponse = await request(app)
        .get(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${userToken}`);
      const initialQuantity = initialResponse.body.quantity;

      // Purchase 1 item
      await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 1 });

      // Verify quantity decreased
      const afterResponse = await request(app)
        .get(`/api/sweets/${sweetId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(afterResponse.body.quantity).toBe(initialQuantity - 1);
    });

    it('should return 400 for insufficient quantity', async () => {
      // Create a fresh sweet with limited quantity
      const createResponse = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Insufficient Test', category: 'Test', price: 1.99, quantity: 5 });
      const sweetId = createResponse.body.id;

      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 1000 }); // More than available

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Insufficient quantity in stock');
    });

    it('should return 401 without authentication', async () => {
      // Create a fresh sweet for this test
      const createResponse = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Auth Test', category: 'Test', price: 1.99, quantity: 10 });
      const sweetId = createResponse.body.id;

      const response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .send({ quantity: 1 });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/sweets/:id', () => {
    it('should delete sweet as admin', async () => {
      const createResponse = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Delete Test', category: 'Test', price: 1.99, quantity: 5 });

      const deleteResponse = await request(app)
        .delete(`/api/sweets/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteResponse.status).toBe(200);
    });

    it('should return 403 for non-admin', async () => {
      const createResponse = await request(app)
        .post('/api/sweets')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Delete Test 2', category: 'Test', price: 1.99, quantity: 5 });

      const deleteResponse = await request(app)
        .delete(`/api/sweets/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(deleteResponse.status).toBe(403);
    });
  });
});

