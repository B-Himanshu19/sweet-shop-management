import request from 'supertest';
import app from '../../server';
import { database } from '../../database/database';
import { authService } from '../../services/authService';
import { sweetService } from '../../services/sweetService';

describe('Purchases API Integration Tests', () => {
  let userToken: string;
  let adminToken: string;
  let userId: number;
  let adminId: number;
  let sweetId: number;

  beforeAll(async () => {
    await database.run('DELETE FROM purchases');
    await database.run('DELETE FROM sweets');
    await database.run('DELETE FROM users');

    // Create regular user
    const user = await authService.register({
      username: 'purchasetestuser',
      email: 'purchasetest@example.com',
      password: 'password123',
    });
    userId = user.id;
    const loginResult = await authService.login('purchasetestuser', 'password123');
    userToken = loginResult.token;

    // Create admin user
    const admin = await authService.register({
      username: 'purchaseadmin',
      email: 'purchaseadmin@example.com',
      password: 'admin123',
      role: 'admin',
    });
    adminId = admin.id;
    const adminLoginResult = await authService.login('purchaseadmin', 'admin123');
    adminToken = adminLoginResult.token;

    // Create a test sweet
    const sweet = await sweetService.createSweet({
      name: 'Purchase Test Sweet',
      category: 'Test',
      price: 15.75,
      quantity: 50,
    });
    sweetId = sweet.id;
  });

  afterAll(async () => {
    await database.run('DELETE FROM purchases');
    await database.run('DELETE FROM sweets');
    await database.run('DELETE FROM users');
  });

  describe('GET /api/purchases/history', () => {
    beforeEach(async () => {
      await database.run('DELETE FROM purchases');
    }, 10000);

    it('should return user purchase history', async () => {
      // First make a purchase
      await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 2.5 });

      const response = await request(app)
        .get('/api/purchases/history')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0]).toHaveProperty('sweet_name', 'Purchase Test Sweet');
      expect(response.body[0]).toHaveProperty('user_id', userId);
      expect(response.body[0]).toHaveProperty('quantity', 2.5);
      expect(response.body[0]).toHaveProperty('total_amount');
    });

    it('should return empty array when user has no purchases', async () => {
      const response = await request(app)
        .get('/api/purchases/history')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/purchases/history');

      expect(response.status).toBe(401);
    });

    it('should only return purchases for the authenticated user', async () => {
      // Create another user
      const otherUser = await authService.register({
        username: 'otherpurchaseuser',
        email: 'otherpurchase@example.com',
        password: 'password123',
      });
      const otherLogin = await authService.login('otherpurchaseuser', 'password123');

      // Make purchase as other user
      const otherPurchaseResponse = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${otherLogin.token}`)
        .send({ quantity: 1.0 });
      
      expect(otherPurchaseResponse.status).toBe(200);

      // Make purchase as test user
      const userPurchaseResponse = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 1.0 });
      
      expect(userPurchaseResponse.status).toBe(200);

      const response = await request(app)
        .get('/api/purchases/history')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      // All purchases should belong to the authenticated user
      expect(response.body.every((p: any) => p.user_id === userId)).toBe(true);
    }, 15000);
  });

  describe('GET /api/purchases/all', () => {
    beforeEach(async () => {
      await database.run('DELETE FROM purchases');
    });

    it('should return all purchases for admin', async () => {
      // Create purchases from multiple users
      const purchase1Response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 1.0 });
      
      expect(purchase1Response.status).toBe(200);

      // Create another user and make purchase
      const user2 = await authService.register({
        username: 'user2purchase',
        email: 'user2purchase@example.com',
        password: 'password123',
      });
      const user2Login = await authService.login('user2purchase', 'password123');
      
      const purchase2Response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${user2Login.token}`)
        .send({ quantity: 2.0 });
      
      expect(purchase2Response.status).toBe(200);

      const response = await request(app)
        .get('/api/purchases/all')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      // Should include username
      expect(response.body[0]).toHaveProperty('username');
      expect(response.body[1]).toHaveProperty('username');
    }, 15000);

    it('should return 403 for non-admin user', async () => {
      const response = await request(app)
        .get('/api/purchases/all')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Admin access required');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/purchases/all');

      expect(response.status).toBe(401);
    });

    it('should return purchases ordered by purchased_at DESC', async () => {
      // Make first purchase
      const purchase1Response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 1.0 });
      
      expect(purchase1Response.status).toBe(200);

      await new Promise(resolve => setTimeout(resolve, 100));

      // Make second purchase
      const purchase2Response = await request(app)
        .post(`/api/sweets/${sweetId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 2.0 });
      
      expect(purchase2Response.status).toBe(200);

      const response = await request(app)
        .get('/api/purchases/all')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
      // Most recent should be first
      const firstDate = new Date(response.body[0].purchased_at).getTime();
      const secondDate = new Date(response.body[1].purchased_at).getTime();
      expect(firstDate).toBeGreaterThanOrEqual(secondDate);
    }, 15000);
  });
});

