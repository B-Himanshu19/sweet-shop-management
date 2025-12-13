import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authService } from '../services/authService';
import { AuthRequest } from '../middleware/auth';
import { handleError, handleValidationErrors } from '../utils/errorHandler';
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants';

export const registerValidators = [
  body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const loginValidators = [
  body('username').notEmpty().withMessage('Username or email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

/**
 * Registers a new user
 * 
 * @param req - Express request with user registration data in body
 * @param res - Express response
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request data
    const errors = validationResult(req);
    if (handleValidationErrors(errors.array(), res)) {
      return;
    }

    // Extract user data
    const { username, email, password, role } = req.body;

    // Register user
    const user = await authService.register({ username, email, password, role });
    
    res.status(HTTP_STATUS.CREATED).json({ 
      message: SUCCESS_MESSAGES.USER_REGISTERED, 
      user 
    });
  } catch (error: unknown) {
    handleError(error, res);
  }
};

/**
 * Authenticates a user and returns JWT token
 * 
 * @param req - Express request with username/email and password in body
 * @param res - Express response
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request data
    const errors = validationResult(req);
    if (handleValidationErrors(errors.array(), res)) {
      return;
    }

    // Extract credentials
    const { username, password } = req.body;

    // Authenticate user
    const result = await authService.login(username, password);
    
    res.status(HTTP_STATUS.OK).json(result);
  } catch (error: unknown) {
    handleError(error, res);
  }
};

/**
 * Retrieves current authenticated user information
 * 
 * @param req - Authenticated Express request
 * @param res - Express response
 */
export const getCurrentUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Verify authentication
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ 
        error: ERROR_MESSAGES.AUTH_REQUIRED 
      });
      return;
    }

    // Get user information
    const user = await authService.getCurrentUser(req.user.id);
    res.status(HTTP_STATUS.OK).json(user);
  } catch (error: unknown) {
    handleError(error, res);
  }
};

