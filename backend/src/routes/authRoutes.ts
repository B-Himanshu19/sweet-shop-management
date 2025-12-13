import { Router } from 'express';
import { register, login, getCurrentUser, registerValidators, loginValidators } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', registerValidators, register);
router.post('/login', loginValidators, login);

// Protected route - requires JWT token
router.get('/me', authenticateToken, getCurrentUser);

export default router;

