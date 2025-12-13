import { USER_ROLES, HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../constants';

/**
 * Unit tests for application constants
 * Ensures consistency and validates constant definitions
 */
describe('Constants', () => {
  describe('USER_ROLES', () => {
    it('should have USER role defined', () => {
      expect(USER_ROLES.USER).toBe('user');
    });

    it('should have ADMIN role defined', () => {
      expect(USER_ROLES.ADMIN).toBe('admin');
    });

    it('should have exactly 2 roles', () => {
      const roles = Object.values(USER_ROLES);
      expect(roles.length).toBe(2);
    });

    it('should export standard role values', () => {
      expect(Object.values(USER_ROLES)).toContain('user');
      expect(Object.values(USER_ROLES)).toContain('admin');
    });
  });

  describe('HTTP_STATUS', () => {
    it('should have 200 OK status', () => {
      expect(HTTP_STATUS.OK).toBe(200);
    });

    it('should have 201 CREATED status', () => {
      expect(HTTP_STATUS.CREATED).toBe(201);
    });

    it('should have 400 BAD_REQUEST status', () => {
      expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
    });

    it('should have 401 UNAUTHORIZED status', () => {
      expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
    });

    it('should have 403 FORBIDDEN status', () => {
      expect(HTTP_STATUS.FORBIDDEN).toBe(403);
    });

    it('should have 404 NOT_FOUND status', () => {
      expect(HTTP_STATUS.NOT_FOUND).toBe(404);
    });

    it('should have 409 CONFLICT status', () => {
      expect(HTTP_STATUS.CONFLICT).toBe(409);
    });

    it('should have 500 INTERNAL_SERVER_ERROR status', () => {
      expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
    });

    it('should have all standard HTTP status codes', () => {
      const statusCodes = Object.values(HTTP_STATUS);
      expect(statusCodes).toContain(200);
      expect(statusCodes).toContain(201);
      expect(statusCodes).toContain(400);
      expect(statusCodes).toContain(401);
      expect(statusCodes).toContain(403);
      expect(statusCodes).toContain(404);
      expect(statusCodes).toContain(409);
      expect(statusCodes).toContain(500);
    });
  });

  describe('ERROR_MESSAGES', () => {
    it('should have SWEET_NOT_FOUND message', () => {
      expect(ERROR_MESSAGES.SWEET_NOT_FOUND).toBe('Sweet not found');
    });

    it('should have USER_NOT_FOUND message', () => {
      expect(ERROR_MESSAGES.USER_NOT_FOUND).toBe('User not found');
    });

    it('should have INVALID_CREDENTIALS message', () => {
      expect(ERROR_MESSAGES.INVALID_CREDENTIALS).toBe('Invalid credentials');
    });

    it('should have AUTH_REQUIRED message', () => {
      expect(ERROR_MESSAGES.AUTH_REQUIRED).toBe('Authentication required');
    });

    it('should have ADMIN_REQUIRED message', () => {
      expect(ERROR_MESSAGES.ADMIN_REQUIRED).toBe('Admin access required');
    });

    it('should have INSUFFICIENT_QUANTITY message', () => {
      expect(ERROR_MESSAGES.INSUFFICIENT_QUANTITY).toBe('Insufficient quantity in stock');
    });

    it('should have USER_ALREADY_EXISTS message', () => {
      expect(ERROR_MESSAGES.USER_ALREADY_EXISTS).toBe('Username or email already exists');
    });

    it('should have SWEET_NAME_EXISTS message', () => {
      expect(ERROR_MESSAGES.SWEET_NAME_EXISTS).toBe('Sweet with this name already exists');
    });

    it('should have INVALID_TOKEN message', () => {
      expect(ERROR_MESSAGES.INVALID_TOKEN).toBe('Invalid or expired token');
    });

    it('should have TOKEN_REQUIRED message', () => {
      expect(ERROR_MESSAGES.TOKEN_REQUIRED).toBe('Access token required');
    });

    it('should have meaningful error messages', () => {
      const messages = Object.values(ERROR_MESSAGES);
      messages.forEach(msg => {
        expect(typeof msg).toBe('string');
        expect(msg.length).toBeGreaterThan(0);
      });
    });
  });

  describe('SUCCESS_MESSAGES', () => {
    it('should have SWEET_CREATED message', () => {
      expect(SUCCESS_MESSAGES.SWEET_CREATED).toBe('Sweet created successfully');
    });

    it('should have SWEET_UPDATED message', () => {
      expect(SUCCESS_MESSAGES.SWEET_UPDATED).toBe('Sweet updated successfully');
    });

    it('should have SWEET_DELETED message', () => {
      expect(SUCCESS_MESSAGES.SWEET_DELETED).toBe('Sweet deleted successfully');
    });

    it('should have USER_REGISTERED message', () => {
      expect(SUCCESS_MESSAGES.USER_REGISTERED).toBe('User registered successfully');
    });

    it('should have PURCHASE_SUCCESS message', () => {
      expect(SUCCESS_MESSAGES.PURCHASE_SUCCESS).toBe('Purchase successful');
    });

    it('should have RESTOCK_SUCCESS message', () => {
      expect(SUCCESS_MESSAGES.RESTOCK_SUCCESS).toBe('Restock successful');
    });

    it('should have meaningful success messages', () => {
      const messages = Object.values(SUCCESS_MESSAGES);
      messages.forEach(msg => {
        expect(typeof msg).toBe('string');
        expect(msg.length).toBeGreaterThan(0);
        const lowerMsg = msg.toLowerCase();
        expect(
          lowerMsg.includes('success') || 
          lowerMsg.includes('created') || 
          lowerMsg.includes('updated') || 
          lowerMsg.includes('deleted') ||
          lowerMsg.includes('registered') ||
          lowerMsg.includes('restock')
        ).toBe(true);
      });
    });
  });

  describe('Message consistency', () => {
    it('should not have duplicate error messages', () => {
      const messages = Object.values(ERROR_MESSAGES);
      const uniqueMessages = new Set(messages);
      expect(uniqueMessages.size).toBe(messages.length);
    });

    it('should not have duplicate success messages', () => {
      const messages = Object.values(SUCCESS_MESSAGES);
      const uniqueMessages = new Set(messages);
      expect(uniqueMessages.size).toBe(messages.length);
    });

    it('should not overlap between error and success messages', () => {
      const errorMessages: string[] = Object.values(ERROR_MESSAGES);
      const successMessages: string[] = Object.values(SUCCESS_MESSAGES);
      
      const overlap = errorMessages.filter(msg => successMessages.includes(msg));
      expect(overlap.length).toBe(0);
    });
  });
});
