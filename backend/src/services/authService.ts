import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { database } from '../database/database';
import { User, UserCreate, UserPublic } from '../models/User';
import { IAuthService } from '../interfaces/IAuthService';
import { AppError } from '../utils/errorHandler';
import { ERROR_MESSAGES, USER_ROLES, JWT_CONFIG, DB_CONFIG } from '../utils/constants';

/**
 * Authentication Service
 * 
 * Follows Single Responsibility Principle (SRP):
 * - Handles user authentication and authorization logic only
 * 
 * Follows Dependency Inversion Principle (DIP):
 * - Implements IAuthService interface
 * - Depends on database abstraction
 */
export class AuthService implements IAuthService {
  /**
   * Registers a new user in the system
   * 
   * @param userData - User registration data (username, email, password, role)
   * @returns Public user information (without password)
   * @throws AppError if user already exists
   */
  async register(userData: UserCreate): Promise<UserPublic> {
    const { username, email, password, role = USER_ROLES.USER } = userData;

    // Validate user doesn't already exist
    const existingUser = await this.findUserByUsernameOrEmail(username, email);
    if (existingUser) {
      throw new AppError(ERROR_MESSAGES.USER_ALREADY_EXISTS, 409);
    }

    // Hash password before storing
    const hashedPassword = await this.hashPassword(password);

    // Create user record
    const userId = await this.createUserRecord(username, email, hashedPassword, role);

    // Return user data without sensitive information
    const user = await this.getUserPublicData(userId);
    if (!user) {
      throw new AppError('Failed to retrieve created user', 500);
    }
    return user;
  }

  /**
   * Authenticates a user and returns a JWT token
   * 
   * @param username - Username or email for login
   * @param password - User's password
   * @returns JWT token and user public data
   * @throws AppError if credentials are invalid
   */
  async login(username: string, password: string): Promise<{ token: string; user: UserPublic }> {
    // Find user by username or email
    const user = await this.findUserByUsernameOrEmail(username, username);
    if (!user) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    // Verify password
    const isValidPassword = await this.verifyPassword(password, user.password);
    if (!isValidPassword) {
      throw new AppError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    // Generate JWT token
    const token = this.generateToken(user);

    // Return token and user data
    return {
      token,
      user: this.mapToUserPublic(user),
    };
  }

  /**
   * Retrieves current user information by ID
   * 
   * @param userId - User ID to retrieve
   * @returns Public user information
   * @throws AppError if user not found
   */
  async getCurrentUser(userId: number): Promise<UserPublic> {
    const user = await this.getUserPublicData(userId);
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
    }
    return user as UserPublic;
  }

  /**
   * Private helper: Finds user by username or email
   * 
   * @param username - Username to search
   * @param email - Email to search
   * @returns User object or undefined
   */
  private async findUserByUsernameOrEmail(username: string, email: string): Promise<User | undefined> {
    return await database.get(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    ) as User | undefined;
  }

  /**
   * Private helper: Hashes password using bcrypt
   * 
   * @param password - Plain text password
   * @returns Hashed password
   */
  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, DB_CONFIG.SALT_ROUNDS);
  }

  /**
   * Private helper: Verifies password against hash
   * 
   * @param password - Plain text password
   * @param hash - Hashed password to compare against
   * @returns True if password matches
   */
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Private helper: Creates user record in database
   * 
   * @param username - Username
   * @param email - Email address
   * @param hashedPassword - Hashed password
   * @param role - User role
   * @returns Created user ID
   */
  private async createUserRecord(
    username: string,
    email: string,
    hashedPassword: string,
    role: string
  ): Promise<number> {
    const result = await database.run(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role]
    );
    return (result as any).lastID;
  }

  /**
   * Private helper: Retrieves public user data by ID
   * 
   * @param userId - User ID
   * @returns Public user data or undefined
   */
  private async getUserPublicData(userId: number): Promise<UserPublic | undefined> {
    return await database.get(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
      [userId]
    ) as UserPublic | undefined;
  }

  /**
   * Private helper: Generates JWT token for user
   * 
   * @param user - User object
   * @returns JWT token string
   */
  private generateToken(user: User): string {
    const jwtSecret = process.env.JWT_SECRET || JWT_CONFIG.DEFAULT_SECRET;
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: JWT_CONFIG.EXPIRES_IN }
    );
  }

  /**
   * Private helper: Maps User to UserPublic (removes sensitive data)
   * 
   * @param user - Full user object
   * @returns Public user data
   */
  private mapToUserPublic(user: User): UserPublic {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    };
  }
}

export const authService = new AuthService();

