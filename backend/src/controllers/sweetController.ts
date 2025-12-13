import { Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { sweetService } from '../services/sweetService';
import { AuthRequest } from '../middleware/auth';
import { handleError, handleValidationErrors } from '../utils/errorHandler';
import { HTTP_STATUS, SUCCESS_MESSAGES } from '../utils/constants';

export const createSweetValidators = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
];

export const updateSweetValidators = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
];

export const purchaseSweetValidators = [
  body('quantity').optional().isFloat({ min: 0.01 }).withMessage('Quantity must be a positive number'),
];

export const restockSweetValidators = [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

export const searchSweetsValidators = [
  query('name').optional().trim(),
  query('category').optional().trim(),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('minPrice must be a positive number'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('maxPrice must be a positive number'),
];

/**
 * Creates a new sweet
 * 
 * @param req - Express request with sweet data in body
 * @param res - Express response
 */
export const createSweet = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request data
    const errors = validationResult(req);
    if (handleValidationErrors(errors.array(), res)) {
      return;
    }

    // Create sweet
    const sweet = await sweetService.createSweet(req.body);
    res.status(HTTP_STATUS.CREATED).json(sweet);
  } catch (error: unknown) {
    handleError(error, res);
  }
};

/**
 * Retrieves all sweets
 * 
 * @param req - Express request
 * @param res - Express response
 */
export const getAllSweets = async (req: Request, res: Response): Promise<void> => {
  try {
    const sweets = await sweetService.getAllSweets();
    res.status(HTTP_STATUS.OK).json(sweets);
  } catch (error: unknown) {
    handleError(error, res);
  }
};

/**
 * Retrieves a sweet by ID
 * 
 * @param req - Express request with sweet ID in params
 * @param res - Express response
 */
export const getSweetById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseIdFromParams(req.params.id);
    const sweet = await sweetService.getSweetById(id);
    
    if (!sweet) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ error: 'Sweet not found' });
      return;
    }

    res.status(HTTP_STATUS.OK).json(sweet);
  } catch (error: unknown) {
    handleError(error, res);
  }
};

/**
 * Updates an existing sweet
 * 
 * @param req - Express request with sweet ID in params and update data in body
 * @param res - Express response
 */
export const updateSweet = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request data
    const errors = validationResult(req);
    if (handleValidationErrors(errors.array(), res)) {
      return;
    }

    const id = parseIdFromParams(req.params.id);
    const sweet = await sweetService.updateSweet(id, req.body);
    res.status(HTTP_STATUS.OK).json(sweet);
  } catch (error: unknown) {
    handleError(error, res);
  }
};

/**
 * Deletes a sweet
 * 
 * @param req - Express request with sweet ID in params
 * @param res - Express response
 */
export const deleteSweet = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseIdFromParams(req.params.id);
    await sweetService.deleteSweet(id);
    res.status(HTTP_STATUS.OK).json({ message: SUCCESS_MESSAGES.SWEET_DELETED });
  } catch (error: unknown) {
    handleError(error, res);
  }
};

/**
 * Searches sweets based on query parameters
 * 
 * @param req - Express request with search parameters in query
 * @param res - Express response
 */
export const searchSweets = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate query parameters
    const errors = validationResult(req);
    if (handleValidationErrors(errors.array(), res)) {
      return;
    }

    // Extract and parse search parameters
    const searchParams = extractSearchParams(req.query);

    // Perform search
    const sweets = await sweetService.searchSweets(searchParams);
    res.status(HTTP_STATUS.OK).json(sweets);
  } catch (error: unknown) {
    handleError(error, res);
  }
};

/**
 * Processes a sweet purchase
 * 
 * @param req - Authenticated request with sweet ID in params and quantity in body
 * @param res - Express response
 */
export const purchaseSweet = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Validate request data
    const errors = validationResult(req);
    if (handleValidationErrors(errors.array(), res)) {
      return;
    }

    // Verify authentication
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Authentication required' });
      return;
    }

    // Parse and process purchase
    const id = parseIdFromParams(req.params.id);
    const quantity = parseFloat(req.body.quantity) || 1;
    const sweet = await sweetService.purchaseSweet(id, quantity, req.user.id);
    
    res.status(HTTP_STATUS.OK).json({ 
      message: SUCCESS_MESSAGES.PURCHASE_SUCCESS, 
      sweet 
    });
  } catch (error: unknown) {
    handleError(error, res);
  }
};

/**
 * Restocks a sweet with additional quantity
 * 
 * @param req - Express request with sweet ID in params and quantity in body
 * @param res - Express response
 */
export const restockSweet = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request data
    const errors = validationResult(req);
    if (handleValidationErrors(errors.array(), res)) {
      return;
    }

    const id = parseIdFromParams(req.params.id);
    const { quantity } = req.body;
    const sweet = await sweetService.restockSweet(id, quantity);
    
    res.status(HTTP_STATUS.OK).json({ 
      message: SUCCESS_MESSAGES.RESTOCK_SUCCESS, 
      sweet 
    });
  } catch (error: unknown) {
    handleError(error, res);
  }
};

// ==================== Private Helper Functions ====================

/**
 * Parses ID from route parameters
 * 
 * @param idParam - ID parameter from route
 * @returns Parsed integer ID
 * @throws AppError if ID is invalid
 */
const parseIdFromParams = (idParam: string): number => {
  const id = parseInt(idParam, 10);
  if (isNaN(id)) {
    throw new Error('Invalid ID parameter');
  }
  return id;
};

/**
 * Extracts and parses search parameters from query string
 * 
 * @param query - Express query object
 * @returns Parsed search parameters
 */
const extractSearchParams = (query: any): {
  name?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
} => {
  return {
    name: query.name as string | undefined,
    category: query.category as string | undefined,
    minPrice: query.minPrice ? parseFloat(query.minPrice as string) : undefined,
    maxPrice: query.maxPrice ? parseFloat(query.maxPrice as string) : undefined,
  };
};

// Export helper functions for use in controller
export const controllerHelpers = {
  parseIdFromParams,
  extractSearchParams,
};

