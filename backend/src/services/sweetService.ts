import { database } from '../database/database';
import { Sweet, SweetCreate, SweetUpdate, SweetSearchParams } from '../models/Sweet';
import { purchaseService } from './purchaseService';
import { ISweetService } from '../interfaces/ISweetService';
import { AppError } from '../utils/errorHandler';
import { ERROR_MESSAGES } from '../utils/constants';

/**
 * Sweet Service
 * 
 * Follows Single Responsibility Principle (SRP):
 * - Handles all sweet-related business logic
 * - Manages sweet inventory and operations
 * 
 * Follows Dependency Inversion Principle (DIP):
 * - Implements ISweetService interface
 * - Depends on database and purchaseService abstractions
 */
export class SweetService implements ISweetService {
  /**
   * Creates a new sweet in the inventory
   * 
   * @param sweetData - Sweet creation data
   * @returns Created sweet object
   * @throws AppError if sweet name already exists
   */
  async createSweet(sweetData: SweetCreate): Promise<Sweet> {
    const { name, category, price, quantity = 0, image_url, description } = sweetData;

    // Validate sweet name uniqueness
    await this.validateSweetNameUniqueness(name);

    // Create sweet record
    const sweetId = await this.insertSweetRecord(
      name,
      category,
      price,
      quantity,
      image_url,
      description
    );

    // Return created sweet
    return await this.getSweetById(sweetId) as Sweet;
  }

  /**
   * Retrieves all sweets from inventory
   * 
   * @returns Array of all sweets, ordered by creation date (newest first)
   */
  async getAllSweets(): Promise<Sweet[]> {
    return await database.all('SELECT * FROM sweets ORDER BY created_at DESC');
  }

  /**
   * Retrieves a sweet by its ID
   * 
   * @param id - Sweet ID
   * @returns Sweet object or null if not found
   */
  async getSweetById(id: number): Promise<Sweet | null> {
    const sweet = await database.get('SELECT * FROM sweets WHERE id = ?', [id]);
    return sweet ? (sweet as Sweet) : null;
  }

  /**
   * Updates an existing sweet
   * 
   * @param id - Sweet ID to update
   * @param updates - Partial sweet data to update
   * @returns Updated sweet object
   * @throws AppError if sweet not found or name conflict
   */
  async updateSweet(id: number, updates: SweetUpdate): Promise<Sweet> {
    // Verify sweet exists
    const existingSweet = await this.getSweetById(id);
    if (!existingSweet) {
      throw new AppError(ERROR_MESSAGES.SWEET_NOT_FOUND, 404);
    }

    // Validate name uniqueness if name is being changed
    if (updates.name && updates.name !== existingSweet.name) {
      await this.validateSweetNameUniqueness(updates.name, id);
    }

    // Merge updates with existing data
    const updatedData = this.mergeSweetUpdates(existingSweet, updates);

    // Update sweet record
    await this.updateSweetRecord(id, updatedData);

    // Return updated sweet
    const updatedSweet = await this.getSweetById(id);
    if (!updatedSweet) {
      throw new AppError(ERROR_MESSAGES.SWEET_NOT_FOUND, 404);
    }
    return updatedSweet;
  }

  /**
   * Deletes a sweet from inventory
   * 
   * @param id - Sweet ID to delete
   * @throws AppError if sweet not found
   */
  async deleteSweet(id: number): Promise<void> {
    const sweet = await this.getSweetById(id);
    if (!sweet) {
      throw new AppError(ERROR_MESSAGES.SWEET_NOT_FOUND, 404);
    }

    await database.run('DELETE FROM sweets WHERE id = ?', [id]);
  }

  /**
   * Searches sweets based on provided criteria
   * 
   * @param params - Search parameters (name, category, price range)
   * @returns Array of matching sweets
   */
  async searchSweets(params: SweetSearchParams): Promise<Sweet[]> {
    const { query, queryParams } = this.buildSearchQuery(params);
    return await database.all(query, queryParams);
  }

  /**
   * Processes a sweet purchase
   * 
   * @param id - Sweet ID to purchase
   * @param quantity - Quantity to purchase (default: 1)
   * @param userId - ID of user making the purchase
   * @returns Updated sweet object with new quantity
   * @throws AppError if sweet not found or insufficient stock
   */
  async purchaseSweet(id: number, quantity: number = 1, userId: number): Promise<Sweet> {
    // Verify sweet exists
    const sweet = await this.getSweetById(id);
    if (!sweet) {
      throw new AppError(ERROR_MESSAGES.SWEET_NOT_FOUND, 404);
    }

    // Validate sufficient stock
    if (sweet.quantity < quantity) {
      throw new AppError(ERROR_MESSAGES.INSUFFICIENT_QUANTITY, 400);
    }

    // Calculate new quantity
    const newQuantity = sweet.quantity - quantity;

    // Update inventory
    await this.updateSweetQuantity(id, newQuantity);

    // Record purchase in history
    await this.recordPurchase(sweet, quantity, userId);

    // Return updated sweet
    const updatedSweet = await this.getSweetById(id);
    if (!updatedSweet) {
      throw new AppError(ERROR_MESSAGES.SWEET_NOT_FOUND, 404);
    }
    return updatedSweet;
  }

  /**
   * Restocks a sweet with additional quantity
   * 
   * @param id - Sweet ID to restock
   * @param quantity - Quantity to add to stock
   * @returns Updated sweet object
   * @throws AppError if sweet not found
   */
  async restockSweet(id: number, quantity: number): Promise<Sweet> {
    // Verify sweet exists
    const sweet = await this.getSweetById(id);
    if (!sweet) {
      throw new AppError(ERROR_MESSAGES.SWEET_NOT_FOUND, 404);
    }

    // Calculate new quantity
    const newQuantity = sweet.quantity + quantity;

    // Update inventory
    await this.updateSweetQuantity(id, newQuantity);

    // Return updated sweet
    const updatedSweet = await this.getSweetById(id);
    if (!updatedSweet) {
      throw new AppError(ERROR_MESSAGES.SWEET_NOT_FOUND, 404);
    }
    return updatedSweet;
  }

  // ==================== Private Helper Methods ====================

  /**
   * Validates that a sweet name is unique
   * 
   * @param name - Sweet name to validate
   * @param excludeId - Optional ID to exclude from check (for updates)
   * @throws AppError if name already exists
   */
  private async validateSweetNameUniqueness(name: string, excludeId?: number): Promise<void> {
    const query = excludeId
      ? 'SELECT * FROM sweets WHERE name = ? AND id != ?'
      : 'SELECT * FROM sweets WHERE name = ?';
    const params = excludeId ? [name, excludeId] : [name];

    const existing = await database.get(query, params);
    if (existing) {
      throw new AppError(ERROR_MESSAGES.SWEET_NAME_EXISTS, 409);
    }
  }

  /**
   * Inserts a new sweet record into the database
   * 
   * @param name - Sweet name
   * @param category - Sweet category
   * @param price - Price per unit
   * @param quantity - Initial quantity
   * @param imageUrl - Optional image URL
   * @param description - Optional description
   * @returns Created sweet ID
   */
  private async insertSweetRecord(
    name: string,
    category: string,
    price: number,
    quantity: number,
    imageUrl?: string,
    description?: string
  ): Promise<number> {
    const result = await database.run(
      'INSERT INTO sweets (name, category, price, quantity, image_url, description) VALUES (?, ?, ?, ?, ?, ?)',
      [name, category, price, quantity, imageUrl || null, description || null]
    );
    return (result as any).lastID;
  }

  /**
   * Merges update data with existing sweet data
   * 
   * @param existing - Existing sweet data
   * @param updates - Update data
   * @returns Merged sweet data
   */
  private mergeSweetUpdates(existing: Sweet, updates: SweetUpdate): Partial<Sweet> {
    return {
      name: updates.name ?? existing.name,
      category: updates.category ?? existing.category,
      price: updates.price ?? existing.price,
      quantity: updates.quantity ?? existing.quantity,
      image_url: updates.image_url !== undefined
        ? (updates.image_url || undefined)
        : existing.image_url,
      description: updates.description !== undefined
        ? (updates.description || undefined)
        : existing.description,
    };
  }

  /**
   * Updates sweet record in database
   * 
   * @param id - Sweet ID
   * @param data - Updated sweet data
   */
  private async updateSweetRecord(id: number, data: Partial<Sweet>): Promise<void> {
    await database.run(
      `UPDATE sweets 
       SET name = ?, category = ?, price = ?, quantity = ?, 
           image_url = ?, description = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [
        data.name,
        data.category,
        data.price,
        data.quantity,
        data.image_url || null,
        data.description || null,
        id,
      ]
    );
  }

  /**
   * Updates sweet quantity in database
   * 
   * @param id - Sweet ID
   * @param quantity - New quantity value
   */
  private async updateSweetQuantity(id: number, quantity: number): Promise<void> {
    await database.run(
      'UPDATE sweets SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [quantity, id]
    );
  }

  /**
   * Records a purchase in the purchase history
   * 
   * @param sweet - Sweet being purchased
   * @param quantity - Purchase quantity
   * @param userId - User making the purchase
   */
  private async recordPurchase(sweet: Sweet, quantity: number, userId: number): Promise<void> {
    const totalAmount = sweet.price * quantity;
    await purchaseService.createPurchase({
      user_id: userId,
      sweet_id: sweet.id,
      sweet_name: sweet.name,
      category: sweet.category,
      price: sweet.price,
      quantity: quantity,
      total_amount: totalAmount,
    });
  }

  /**
   * Builds SQL query for sweet search
   * 
   * @param params - Search parameters
   * @returns Query string and parameters array
   */
  private buildSearchQuery(params: SweetSearchParams): { query: string; queryParams: any[] } {
    let query = 'SELECT * FROM sweets WHERE 1=1';
    const queryParams: any[] = [];

    if (params.name) {
      query += ' AND name LIKE ?';
      queryParams.push(`%${params.name}%`);
    }

    if (params.category) {
      query += ' AND category = ?';
      queryParams.push(params.category);
    }

    if (params.minPrice !== undefined) {
      query += ' AND price >= ?';
      queryParams.push(params.minPrice);
    }

    if (params.maxPrice !== undefined) {
      query += ' AND price <= ?';
      queryParams.push(params.maxPrice);
    }

    query += ' ORDER BY created_at DESC';

    return { query, queryParams };
  }
}

export const sweetService = new SweetService();

