import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { purchaseService } from '../services/purchaseService';
import { handleError } from '../utils/errorHandler';
import { HTTP_STATUS, ERROR_MESSAGES } from '../utils/constants';

/**
 * Retrieves purchase history for the authenticated user
 * 
 * @param req - Authenticated Express request
 * @param res - Express response
 */
export const getUserPurchases = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Verify authentication
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
        error: ERROR_MESSAGES.AUTH_REQUIRED 
      });
      return;
    }

    // Get user's purchase history
    const purchases = await purchaseService.getUserPurchases(req.user.id);
    res.status(HTTP_STATUS.OK).json(purchases);
  } catch (error: unknown) {
    handleError(error, res);
  }
};

/**
 * Retrieves all purchases from all users (admin only)
 * 
 * @param req - Authenticated Express request (must be admin)
 * @param res - Express response
 */
export const getAllPurchases = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Verify authentication
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
        error: ERROR_MESSAGES.AUTH_REQUIRED 
      });
      return;
    }

    // Verify admin role
    if (req.user.role !== 'admin') {
      res.status(HTTP_STATUS.FORBIDDEN).json({ 
        error: ERROR_MESSAGES.ADMIN_REQUIRED 
      });
      return;
    }

    // Get all purchases
    const purchases = await purchaseService.getAllPurchases();
    res.status(HTTP_STATUS.OK).json(purchases);
  } catch (error: unknown) {
    handleError(error, res);
  }
};

