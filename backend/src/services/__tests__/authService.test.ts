import { AuthService } from '../authService';
import { database } from '../../database/database';

describe('AuthService', () => {
  let authService: AuthService;

  beforeAll(async () => {
    authService = new AuthService();
    // Clean up test data
    await database.run('DELETE FROM users');
  });

  afterAll(async () => {
    await database.run('DELETE FROM users');
  });

  describe('register', () => {
    beforeEach(async () => {
      await database.run('DELETE FROM users');
    });

    it('should register a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const user = await authService.register(userData);

      expect(user).toHaveProperty('id');
      expect(user.username).toBe(userData.username);
      expect(user.email).toBe(userData.email);
      expect(user.role).toBe('user');
      expect(user).not.toHaveProperty('password');
    });

    it('should throw error if username already exists', async () => {
      // First create a user
      await authService.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      // Try to register with same username
      const userData = {
        username: 'testuser',
        email: 'test2@example.com',
        password: 'password123',
      };

      await expect(authService.register(userData)).rejects.toThrow('Username or email already exists');
    });

    it('should throw error if email already exists', async () => {
      // First create a user
      await authService.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      // Try to register with same email
      const userData = {
        username: 'testuser2',
        email: 'test@example.com',
        password: 'password123',
      };

      await expect(authService.register(userData)).rejects.toThrow('Username or email already exists');
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      await database.run('DELETE FROM users');
      // Create a user for login tests
      await authService.register({
        username: 'logintestuser',
        email: 'logintest@example.com',
        password: 'password123',
      });
    });

    it('should login successfully with correct credentials', async () => {
      const result = await authService.login('logintestuser', 'password123');

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user.username).toBe('logintestuser');
      expect(result.user.email).toBe('logintest@example.com');
    });

    it('should throw error with incorrect password', async () => {
      await expect(authService.login('logintestuser', 'wrongpassword')).rejects.toThrow('Invalid credentials');
    });

    it('should throw error with non-existent user', async () => {
      await expect(authService.login('nonexistent', 'password123')).rejects.toThrow('Invalid credentials');
    });
  });
});

