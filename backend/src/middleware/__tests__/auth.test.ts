import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken, requireAdmin, AuthRequest } from '../auth';

/**
 * Unit tests for authentication middleware
 * Tests token verification and role-based access control
 */
jest.mock('jsonwebtoken');

describe('Authentication Middleware', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock<void>;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe('authenticateToken', () => {
    describe('missing token', () => {
      it('should return 401 when no authorization header', () => {
        mockReq.headers = {};

        authenticateToken(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Access token required'
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should return 401 when authorization header is empty', () => {
        mockReq.headers = { authorization: '' };

        authenticateToken(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should return 401 when only "Bearer" is provided without token', () => {
        mockReq.headers = { authorization: 'Bearer' };

        authenticateToken(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockNext).not.toHaveBeenCalled();
      });
    });

    describe('invalid token', () => {
      it('should return 403 when token is invalid', () => {
        mockReq.headers = { authorization: 'Bearer invalid-token' };
        (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
          callback(new Error('Invalid token'), null);
        });

        authenticateToken(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Invalid or expired token'
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should return 403 when token is expired', () => {
        mockReq.headers = { authorization: 'Bearer expired-token' };
        (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
          const error = new Error('jwt expired');
          callback(error, null);
        });

        authenticateToken(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockNext).not.toHaveBeenCalled();
      });
    });

    describe('valid token', () => {
      it('should set user from valid token and call next', () => {
        const user = {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          role: 'user' as const,
        };

        mockReq.headers = { authorization: 'Bearer valid-token' };
        (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
          callback(null, user);
        });

        authenticateToken(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockReq.user).toEqual(user);
        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
      });

      it('should extract token correctly from "Bearer" prefix', () => {
        const user = { id: 2, username: 'admin', email: 'admin@example.com', role: 'admin' as const };

        mockReq.headers = { authorization: 'Bearer some-random-token' };
        (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
          expect(token).toBe('some-random-token');
          callback(null, user);
        });

        authenticateToken(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
      });

      it('should use JWT_SECRET from environment', () => {
        const originalEnv = process.env.JWT_SECRET;
        process.env.JWT_SECRET = 'custom-secret';

        const user = { id: 1, username: 'test', email: 'test@example.com', role: 'user' as const };
        mockReq.headers = { authorization: 'Bearer token' };
        (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
          expect(secret).toBe('custom-secret');
          callback(null, user);
        });

        authenticateToken(mockReq as AuthRequest, mockRes as Response, mockNext);

        process.env.JWT_SECRET = originalEnv;
        expect(mockNext).toHaveBeenCalled();
      });

      it('should use default secret if JWT_SECRET env not set', () => {
        const originalEnv = process.env.JWT_SECRET;
        delete process.env.JWT_SECRET;

        const user = { id: 1, username: 'test', email: 'test@example.com', role: 'user' as const };
        mockReq.headers = { authorization: 'Bearer token' };
        (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
          expect(secret).toBe('default-secret');
          callback(null, user);
        });

        authenticateToken(mockReq as AuthRequest, mockRes as Response, mockNext);

        process.env.JWT_SECRET = originalEnv;
        expect(mockNext).toHaveBeenCalled();
      });

      it('should handle extra spaces in authorization header', () => {
        const user = { id: 1, username: 'test', email: 'test@example.com', role: 'user' as const };
        mockReq.headers = { authorization: 'Bearer token-value' };
        (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
          expect(token).toBe('token-value');
          callback(null, user);
        });

        authenticateToken(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
      });
    });

    describe('token payload variations', () => {
      it('should handle admin user token', () => {
        const adminUser = {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin' as const,
        };

        mockReq.headers = { authorization: 'Bearer admin-token' };
        (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
          callback(null, adminUser);
        });

        authenticateToken(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockReq.user?.role).toBe('admin');
        expect(mockNext).toHaveBeenCalled();
      });

      it('should handle regular user token', () => {
        const regularUser = {
          id: 2,
          username: 'user',
          email: 'user@example.com',
          role: 'user' as const,
        };

        mockReq.headers = { authorization: 'Bearer user-token' };
        (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
          callback(null, regularUser);
        });

        authenticateToken(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockReq.user?.role).toBe('user');
        expect(mockNext).toHaveBeenCalled();
      });
    });
  });

  describe('requireAdmin', () => {
    describe('no authentication', () => {
      it('should return 401 when req.user is undefined', () => {
        mockReq.user = undefined;

        requireAdmin(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Authentication required'
        });
        expect(mockNext).not.toHaveBeenCalled();
      });
    });

    describe('non-admin user', () => {
      it('should return 403 for regular user', () => {
        mockReq.user = {
          id: 1,
          username: 'user',
          email: 'user@example.com',
          role: 'user',
        };

        requireAdmin(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(403);
        expect(mockRes.json).toHaveBeenCalledWith({
          error: 'Admin access required'
        });
        expect(mockNext).not.toHaveBeenCalled();
      });
    });

    describe('admin user', () => {
      it('should call next for admin user', () => {
        mockReq.user = {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin',
        };

        requireAdmin(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
      });

      it('should allow only exact "admin" role', () => {
        mockReq.user = {
          id: 1,
          username: 'superuser',
          email: 'super@example.com',
          role: 'admin',
        };

        requireAdmin(mockReq as AuthRequest, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
      });
    });
  });

  describe('middleware composition', () => {
    it('should authenticate then check admin role in sequence', () => {
      const user = { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin' as const };

      // First, authenticate
      mockReq.headers = { authorization: 'Bearer admin-token' };
      (jwt.verify as jest.Mock).mockImplementation((token, secret, callback) => {
        callback(null, user);
      });

      authenticateToken(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toEqual(user);

      // Then check admin
      mockNext.mockClear();
      requireAdmin(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
  });
});
