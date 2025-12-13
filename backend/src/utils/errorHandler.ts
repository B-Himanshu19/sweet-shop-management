import { Response } from 'express';

/**
 * Error response interface for consistent error handling
 */
export interface ApiError {
  message: string;
  statusCode: number;
  details?: any;
}

/**
 * Custom error class for application-specific errors
 * Follows Single Responsibility Principle - handles error creation
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Centralized error handler utility
 * Follows DRY principle - single place for error handling logic
 * 
 * @param error - The error object to handle
 * @param res - Express response object
 */
export const handleError = (error: unknown, res: Response): void => {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: error.message,
      ...(error.details && { details: error.details })
    });
    return;
  }

  if (error instanceof Error) {
    // Handle known error messages
    const statusCode = getStatusCodeForError(error.message);
    res.status(statusCode).json({ error: error.message });
    return;
  }

  // Unknown error
  res.status(500).json({ 
    error: 'An unexpected error occurred',
    ...(process.env.NODE_ENV === 'development' && { details: String(error) })
  });
};

/**
 * Maps error messages to appropriate HTTP status codes
 * 
 * @param message - Error message
 * @returns HTTP status code
 */
const getStatusCodeForError = (message: string): number => {
  const errorStatusMap: Record<string, number> = {
    'Sweet not found': 404,
    'User not found': 404,
    'Invalid credentials': 401,
    'Authentication required': 401,
    'Admin access required': 403,
    'Insufficient quantity in stock': 400,
    'Username or email already exists': 409,
    'Sweet with this name already exists': 409,
  };

  return errorStatusMap[message] || 500;
};

/**
 * Validation error handler
 * 
 * @param errors - Validation errors array
 * @param res - Express response object
 * @returns true if errors exist and response was sent
 */
export const handleValidationErrors = (errors: any[], res: Response): boolean => {
  if (errors.length > 0) {
    res.status(400).json({ errors });
    return true;
  }
  return false;
};

