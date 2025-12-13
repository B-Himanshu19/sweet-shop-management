import { SweetService } from '../sweetService';
import { database } from '../../database/database';

describe('SweetService', () => {
  let sweetService: SweetService;

  beforeAll(async () => {
    sweetService = new SweetService();
    // Clean up test data
    await database.run('DELETE FROM sweets');
  });

  afterAll(async () => {
    await database.run('DELETE FROM sweets');
  });

  describe('createSweet', () => {
    it('should create a new sweet successfully', async () => {
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 5.99,
        quantity: 10,
      };

      const sweet = await sweetService.createSweet(sweetData);

      expect(sweet).toHaveProperty('id');
      expect(sweet.name).toBe(sweetData.name);
      expect(sweet.category).toBe(sweetData.category);
      expect(sweet.price).toBe(sweetData.price);
      expect(sweet.quantity).toBe(sweetData.quantity);
    });

    it('should throw error if sweet name already exists', async () => {
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 6.99,
      };

      await expect(sweetService.createSweet(sweetData)).rejects.toThrow('Sweet with this name already exists');
    });
  });

  describe('getAllSweets', () => {
    it('should return all sweets', async () => {
      await sweetService.createSweet({
        name: 'Gummy Bears',
        category: 'Gummies',
        price: 3.99,
        quantity: 20,
      });

      const sweets = await sweetService.getAllSweets();
      expect(sweets.length).toBeGreaterThan(0);
    });
  });

  describe('getSweetById', () => {
    it('should return sweet by id', async () => {
      const sweet = await sweetService.createSweet({
        name: 'Lollipop',
        category: 'Hard Candy',
        price: 1.99,
        quantity: 50,
      });

      const found = await sweetService.getSweetById(sweet.id);
      expect(found).not.toBeNull();
      expect(found?.id).toBe(sweet.id);
    });

    it('should return null for non-existent id', async () => {
      const found = await sweetService.getSweetById(99999);
      expect(found).toBeNull();
    });
  });

  describe('updateSweet', () => {
    it('should update sweet successfully', async () => {
      const sweet = await sweetService.createSweet({
        name: 'Candy Cane',
        category: 'Hard Candy',
        price: 2.99,
        quantity: 30,
      });

      const updated = await sweetService.updateSweet(sweet.id, {
        price: 3.49,
        quantity: 25,
      });

      expect(updated.price).toBe(3.49);
      expect(updated.quantity).toBe(25);
    });

    it('should throw error if sweet not found', async () => {
      await expect(sweetService.updateSweet(99999, { price: 5.99 })).rejects.toThrow('Sweet not found');
    });
  });

  describe('deleteSweet', () => {
    it('should delete sweet successfully', async () => {
      const sweet = await sweetService.createSweet({
        name: 'Toffee',
        category: 'Hard Candy',
        price: 4.99,
        quantity: 15,
      });

      await sweetService.deleteSweet(sweet.id);
      const found = await sweetService.getSweetById(sweet.id);
      expect(found).toBeNull();
    });

    it('should throw error if sweet not found', async () => {
      await expect(sweetService.deleteSweet(99999)).rejects.toThrow('Sweet not found');
    });
  });

  describe('searchSweets', () => {
    beforeEach(async () => {
      await database.run('DELETE FROM sweets');
      await sweetService.createSweet({ name: 'Dark Chocolate', category: 'Chocolate', price: 6.99, quantity: 10 });
      await sweetService.createSweet({ name: 'Milk Chocolate', category: 'Chocolate', price: 5.99, quantity: 15 });
      await sweetService.createSweet({ name: 'Strawberry Gummy', category: 'Gummies', price: 3.99, quantity: 20 });
    });

    it('should search by name', async () => {
      const results = await sweetService.searchSweets({ name: 'Dark' });
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('Dark Chocolate');
    });

    it('should search by category', async () => {
      const results = await sweetService.searchSweets({ category: 'Chocolate' });
      expect(results.length).toBeGreaterThanOrEqual(1); // At least 1, might be more from previous tests
      expect(results.every(s => s.category === 'Chocolate')).toBe(true);
    });

    it('should search by price range', async () => {
      const results = await sweetService.searchSweets({ minPrice: 4.0, maxPrice: 6.0 });
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('Milk Chocolate');
    });
  });

  describe('purchaseSweet', () => {
    it('should decrease quantity on purchase', async () => {
      const userId = 1; // Test user ID
      const sweet = await sweetService.createSweet({
        name: 'Purchase Test',
        category: 'Test',
        price: 1.99,
        quantity: 10,
      });

      const updated = await sweetService.purchaseSweet(sweet.id, 3, userId);
      expect(updated.quantity).toBe(7);
    });

    it('should throw error if insufficient quantity', async () => {
      const userId = 1; // Test user ID
      const sweet = await sweetService.createSweet({
        name: 'Low Stock',
        category: 'Test',
        price: 1.99,
        quantity: 2,
      });

      await expect(sweetService.purchaseSweet(sweet.id, 5, userId)).rejects.toThrow('Insufficient quantity in stock');
    });
  });

  describe('restockSweet', () => {
    it('should increase quantity on restock', async () => {
      const sweet = await sweetService.createSweet({
        name: 'Restock Test',
        category: 'Test',
        price: 1.99,
        quantity: 10,
      });

      const updated = await sweetService.restockSweet(sweet.id, 5);
      expect(updated.quantity).toBe(15);
    });
  });
});

