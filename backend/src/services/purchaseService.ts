import { database } from '../database/database';
import { Purchase, PurchaseCreate } from '../models/Purchase';
import { IPurchaseService } from '../interfaces/IPurchaseService';

/**
 * Purchase Service
 * 
 * Follows Single Responsibility Principle (SRP):
 * - Handles all purchase history and recording operations
 * 
 * Follows Dependency Inversion Principle (DIP):
 * - Implements IPurchaseService interface
 * - Depends on database abstraction
 */
export class PurchaseService implements IPurchaseService {
  /**
   * Creates a new purchase record
   * 
   * @param purchaseData - Purchase data to record
   * @returns Created purchase object
   */
  async createPurchase(purchaseData: PurchaseCreate): Promise<Purchase> {
    const { user_id, sweet_id, sweet_name, category, price, quantity, total_amount } = purchaseData;

    // Insert purchase record
    const purchaseId = await this.insertPurchaseRecord(
      user_id,
      sweet_id,
      sweet_name,
      category,
      price,
      quantity,
      total_amount
    );

    // Return created purchase
    return await this.getPurchaseById(purchaseId) as Purchase;
  }

  /**
   * Retrieves all purchases for a specific user
   * 
   * @param userId - User ID to get purchases for
   * @returns Array of user's purchases, ordered by date (newest first)
   */
  async getUserPurchases(userId: number): Promise<Purchase[]> {
    return await database.all(
      'SELECT * FROM purchases WHERE user_id = ? ORDER BY purchased_at DESC',
      [userId]
    );
  }

  /**
   * Retrieves all purchases from all users (admin only)
   * Includes username from user join
   * 
   * @returns Array of all purchases, ordered by date (newest first)
   */
  async getAllPurchases(): Promise<Purchase[]> {
    return await database.all(
      `SELECT p.*, u.username 
       FROM purchases p 
       LEFT JOIN users u ON p.user_id = u.id 
       ORDER BY p.purchased_at DESC`
    );
  }

  // ==================== Private Helper Methods ====================

  /**
   * Inserts a purchase record into the database
   * 
   * @param userId - User ID making the purchase
   * @param sweetId - Sweet ID being purchased
   * @param sweetName - Sweet name (denormalized for history)
   * @param category - Sweet category (denormalized for history)
   * @param price - Price per unit at time of purchase
   * @param quantity - Quantity purchased
   * @param totalAmount - Total purchase amount
   * @returns Created purchase ID
   */
  private async insertPurchaseRecord(
    userId: number,
    sweetId: number,
    sweetName: string,
    category: string,
    price: number,
    quantity: number,
    totalAmount: number
  ): Promise<number> {
    const result = await database.run(
      `INSERT INTO purchases (user_id, sweet_id, sweet_name, category, price, quantity, total_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, sweetId, sweetName, category, price, quantity, totalAmount]
    );
    return (result as any).lastID;
  }

  /**
   * Retrieves a purchase by ID
   * 
   * @param purchaseId - Purchase ID
   * @returns Purchase object or undefined
   */
  private async getPurchaseById(purchaseId: number): Promise<Purchase | undefined> {
    return await database.get('SELECT * FROM purchases WHERE id = ?', [purchaseId]) as Purchase | undefined;
  }
}

export const purchaseService = new PurchaseService();

