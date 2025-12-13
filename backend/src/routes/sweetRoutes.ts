import { Router } from 'express';
import {
  createSweet,
  getAllSweets,
  getSweetById,
  updateSweet,
  deleteSweet,
  searchSweets,
  purchaseSweet,
  restockSweet,
  createSweetValidators,
  updateSweetValidators,
  purchaseSweetValidators,
  restockSweetValidators,
  searchSweetsValidators,
} from '../controllers/sweetController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Public authenticated routes
router.get('/', getAllSweets);
router.get('/search', searchSweetsValidators, searchSweets);
router.get('/:id', getSweetById);
router.post('/:id/purchase', purchaseSweetValidators, purchaseSweet);

// Admin only routes
router.post('/', requireAdmin, createSweetValidators, createSweet);
router.put('/:id', requireAdmin, updateSweetValidators, updateSweet);
router.delete('/:id', requireAdmin, deleteSweet);
router.post('/:id/restock', requireAdmin, restockSweetValidators, restockSweet);

export default router;

