import { Response } from 'express';
import { AppError, handleError } from '../errorHandler';

/**
 * Unit tests for error handling utilities
 * Tests the error handling strategy and AppError class
 */
describe('AppError', () => {
  describe('constructor', () => {
    it('should create error with message and default status code', () => {
      const error = new AppError('Test error');
      
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.name).toBe('AppError');
    });

    it('should create error with custom status code', () => {
      const error = new AppError('Not found', 404);
      
      expect(error.message).toBe('Not found');
      expect(error.statusCode).toBe(404);
    });

    it('should create error with details', () => {
      const details = { field: 'email', reason: 'Invalid format' };
      const error = new AppError('Validation failed', 400, details);
      
      expect(error.details).toEqual(details);
    });

    it('should capture stack trace', () => {
      const error = new AppError('Test');
      
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AppError');
    });
  });

  describe('instanceof checks', () => {
    it('should be instance of AppError', () => {
      const error = new AppError('Test');
      expect(error instanceof AppError).toBe(true);
    });

    it('should be instance of Error', () => {
      const error = new AppError('Test');
      expect(error instanceof Error).toBe(true);
    });
  });
});

describe('handleError', () => {
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('with AppError', () => {
    it('should return error message and status code', () => {
      const error = new AppError('Unauthorized access', 401);
      
      handleError(error, mockRes as Response);
      
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Unauthorized access'
      });
    });

    it('should include details when provided', () => {
      const details = { field: 'username', reason: 'Already exists' };
      const error = new AppError('Conflict', 409, details);
      
      handleError(error, mockRes as Response);
      
      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Conflict',
        details: details
      });
    });
  });

  describe('with standard Error', () => {
    it('should handle generic Error messages', () => {
      const error = new Error('Something went wrong');
      
      handleError(error, mockRes as Response);
      
      expect(mockRes.status).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Something went wrong'
      });
    });

    it('should return 400 for validation errors', () => {
      const error = new Error('Validation error: Invalid email');
      
      handleError(error, mockRes as Response);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should return 404 for not found errors', () => {
      const error = new Error('User not found');
      
      handleError(error, mockRes as Response);
      
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should return 500 for unknown errors', () => {
      const error = new Error('Database connection failed');
      
      handleError(error, mockRes as Response);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('with non-Error objects', () => {
    it('should handle unknown error types gracefully', () => {
      handleError('String error', mockRes as Response);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalled();
    });

    it('should handle null/undefined', () => {
      handleError(null, mockRes as Response);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('error status code detection', () => {
    it('should recognize "duplicate" errors as 409', () => {
      const error = new Error('Sweet with this name already exists');
      handleError(error, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(409);
    });

    it('should recognize "unauthorized" errors as 401', () => {
      const error = new Error('Invalid credentials');
      handleError(error, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('should recognize "insufficient" errors as 400', () => {
      const error = new Error('Insufficient quantity in stock');
      handleError(error, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should recognize "not found" errors as 404', () => {
      const error = new Error('Sweet not found');
      handleError(error, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should recognize "admin" errors as 403', () => {
      const error = new Error('Admin access required');
      handleError(error, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(403);
    });
  });
});

describe('handleValidationErrors', () => {
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should return true and send error response when errors exist', () => {
    const { handleValidationErrors } = require('../errorHandler');
    const errors = [
      { field: 'email', message: 'Invalid email' },
      { field: 'password', message: 'Too short' }
    ];
    
    const result = handleValidationErrors(errors, mockRes as Response);
    
    expect(result).toBe(true);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ errors });
  });

  it('should return false when no errors', () => {
    const { handleValidationErrors } = require('../errorHandler');
    
    const result = handleValidationErrors([], mockRes as Response);
    
    expect(result).toBe(false);
    expect(mockRes.status).not.toHaveBeenCalled();
  });
});
