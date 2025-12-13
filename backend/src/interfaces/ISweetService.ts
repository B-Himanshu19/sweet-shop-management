import { Sweet, SweetCreate, SweetUpdate, SweetSearchParams } from '../models/Sweet';

/**
 * Interface for Sweet Service operations
 * Follows Interface Segregation Principle (ISP) - clients only depend on methods they use
 */
export interface ISweetService {
  createSweet(sweetData: SweetCreate): Promise<Sweet>;
  getAllSweets(): Promise<Sweet[]>;
  getSweetById(id: number): Promise<Sweet | null>;
  updateSweet(id: number, updates: SweetUpdate): Promise<Sweet>;
  deleteSweet(id: number): Promise<void>;
  searchSweets(params: SweetSearchParams): Promise<Sweet[]>;
  purchaseSweet(id: number, quantity: number, userId: number): Promise<Sweet>;
  restockSweet(id: number, quantity: number): Promise<Sweet>;
}

