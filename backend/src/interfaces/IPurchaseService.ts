import { Purchase, PurchaseCreate } from '../models/Purchase';

/**
 * Interface for Purchase Service operations
 * Follows Interface Segregation Principle (ISP)
 */
export interface IPurchaseService {
  createPurchase(purchaseData: PurchaseCreate): Promise<Purchase>;
  getUserPurchases(userId: number): Promise<Purchase[]>;
  getAllPurchases(): Promise<Purchase[]>;
}

