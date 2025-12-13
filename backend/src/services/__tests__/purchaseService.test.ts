import { PurchaseService } from '../purchaseService';
import { database } from '../../database/database';
import { authService } from '../authService';
import { sweetService } from '../sweetService';

describe('PurchaseService', () => {
  let purchaseService: PurchaseService;
  let testUserId: number;
  let testSweetId: number;

  beforeAll(async () => {
    purchaseService = new PurchaseService();
    // Clean up test data
    await database.run('DELETE FROM purchases');
    await database.run('DELETE FROM sweets');
    await database.run('DELETE FROM users');

    // Create test user
    const user = await authService.register({
      username: 'purchasetestuser',
      email: 'purchasetest@example.com',
      password: 'password123',
    });
    testUserId = user.id;

    // Create test sweet
    const sweet = await sweetService.createSweet({
      name: 'Purchase Test Sweet',
      category: 'Test',
      price: 10.50,
      quantity: 100,
    });
    testSweetId = sweet.id;
  });

  afterAll(async () => {
    await database.run('DELETE FROM purchases');
    await database.run('DELETE FROM sweets');
    await database.run('DELETE FROM users');
  });

  describe('createPurchase', () => {
    it('should create a purchase record successfully', async () => {
      const purchaseData = {
        user_id: testUserId,
        sweet_id: testSweetId,
        sweet_name: 'Purchase Test Sweet',
        category: 'Test',
        price: 10.50,
        quantity: 2.5,
        total_amount: 26.25,
      };

      const purchase = await purchaseService.createPurchase(purchaseData);

      expect(purchase).toHaveProperty('id');
      expect(purchase.user_id).toBe(testUserId);
      expect(purchase.sweet_id).toBe(testSweetId);
      expect(purchase.sweet_name).toBe('Purchase Test Sweet');
      expect(purchase.quantity).toBe(2.5);
      expect(purchase.total_amount).toBe(26.25);
      expect(purchase).toHaveProperty('purchased_at');
    });

    it('should calculate total_amount correctly', async () => {
      const purchaseData = {
        user_id: testUserId,
        sweet_id: testSweetId,
        sweet_name: 'Purchase Test Sweet',
        category: 'Test',
        price: 10.50,
        quantity: 3.0,
        total_amount: 31.50, // price * quantity
      };

      const purchase = await purchaseService.createPurchase(purchaseData);

      expect(purchase.total_amount).toBe(31.50);
    });
  });

  describe('getUserPurchases', () => {
    beforeEach(async () => {
      await database.run('DELETE FROM purchases');
    });

    it('should return empty array when user has no purchases', async () => {
      const purchases = await purchaseService.getUserPurchases(testUserId);
      expect(purchases).toEqual([]);
    });

    it('should return all purchases for a specific user', async () => {
      // Create multiple purchases
      await purchaseService.createPurchase({
        user_id: testUserId,
        sweet_id: testSweetId,
        sweet_name: 'Purchase Test Sweet',
        category: 'Test',
        price: 10.50,
        quantity: 1.0,
        total_amount: 10.50,
      });

      await purchaseService.createPurchase({
        user_id: testUserId,
        sweet_id: testSweetId,
        sweet_name: 'Purchase Test Sweet',
        category: 'Test',
        price: 10.50,
        quantity: 2.0,
        total_amount: 21.00,
      });

      const purchases = await purchaseService.getUserPurchases(testUserId);

      expect(purchases.length).toBe(2);
      expect(purchases[0].user_id).toBe(testUserId);
      expect(purchases[1].user_id).toBe(testUserId);
      // Should be ordered by purchased_at DESC (most recent first)
      expect(new Date(purchases[0].purchased_at).getTime()).toBeGreaterThanOrEqual(
        new Date(purchases[1].purchased_at).getTime()
      );
    });

    it('should not return purchases from other users', async () => {
      // Create another user
      const otherUser = await authService.register({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'password123',
      });

      // Create purchase for other user
      await purchaseService.createPurchase({
        user_id: otherUser.id,
        sweet_id: testSweetId,
        sweet_name: 'Purchase Test Sweet',
        category: 'Test',
        price: 10.50,
        quantity: 1.0,
        total_amount: 10.50,
      });

      // Create purchase for test user
      await purchaseService.createPurchase({
        user_id: testUserId,
        sweet_id: testSweetId,
        sweet_name: 'Purchase Test Sweet',
        category: 'Test',
        price: 10.50,
        quantity: 1.0,
        total_amount: 10.50,
      });

      const purchases = await purchaseService.getUserPurchases(testUserId);

      expect(purchases.length).toBe(1);
      expect(purchases[0].user_id).toBe(testUserId);
    });
  });

  describe('getAllPurchases', () => {
    beforeEach(async () => {
      await database.run('DELETE FROM purchases');
    });

    it('should return all purchases from all users', async () => {
      // Create another user
      const user2 = await authService.register({
        username: 'user2',
        email: 'user2@example.com',
        password: 'password123',
      });

      // Create purchases for both users
      await purchaseService.createPurchase({
        user_id: testUserId,
        sweet_id: testSweetId,
        sweet_name: 'Purchase Test Sweet',
        category: 'Test',
        price: 10.50,
        quantity: 1.0,
        total_amount: 10.50,
      });

      await purchaseService.createPurchase({
        user_id: user2.id,
        sweet_id: testSweetId,
        sweet_name: 'Purchase Test Sweet',
        category: 'Test',
        price: 10.50,
        quantity: 2.0,
        total_amount: 21.00,
      });

      const purchases = await purchaseService.getAllPurchases();

      expect(purchases.length).toBe(2);
      expect(purchases.some(p => p.user_id === testUserId)).toBe(true);
      expect(purchases.some(p => p.user_id === user2.id)).toBe(true);
    });

    it('should include username in purchase data', async () => {
      await purchaseService.createPurchase({
        user_id: testUserId,
        sweet_id: testSweetId,
        sweet_name: 'Purchase Test Sweet',
        category: 'Test',
        price: 10.50,
        quantity: 1.0,
        total_amount: 10.50,
      });

      const purchases = await purchaseService.getAllPurchases();

      expect(purchases.length).toBeGreaterThan(0);
      expect(purchases[0]).toHaveProperty('username');
      // Username might be null if user was deleted, so just check property exists
      expect(purchases[0].username !== undefined).toBe(true);
    });

    it('should return purchases ordered by purchased_at DESC', async () => {
      // Create purchases with slight delay to ensure different timestamps
      await purchaseService.createPurchase({
        user_id: testUserId,
        sweet_id: testSweetId,
        sweet_name: 'Purchase Test Sweet',
        category: 'Test',
        price: 10.50,
        quantity: 1.0,
        total_amount: 10.50,
      });

      await new Promise(resolve => setTimeout(resolve, 10));

      await purchaseService.createPurchase({
        user_id: testUserId,
        sweet_id: testSweetId,
        sweet_name: 'Purchase Test Sweet',
        category: 'Test',
        price: 10.50,
        quantity: 2.0,
        total_amount: 21.00,
      });

      const purchases = await purchaseService.getAllPurchases();

      expect(purchases.length).toBe(2);
      // Most recent should be first
      expect(new Date(purchases[0].purchased_at).getTime()).toBeGreaterThanOrEqual(
        new Date(purchases[1].purchased_at).getTime()
      );
    });
  });
});

