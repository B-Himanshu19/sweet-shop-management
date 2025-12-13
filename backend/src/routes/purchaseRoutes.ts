import { Router } from 'express';
import { getUserPurchases, getAllPurchases } from '../controllers/purchaseController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get user's own purchase history
router.get('/history', getUserPurchases);

// Admin only - Get all purchases
router.get('/all', requireAdmin, getAllPurchases);

export default router;

