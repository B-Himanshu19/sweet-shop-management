/**
 * Application-wide constants
 * Follows DRY principle - single source of truth for constants
 */

/**
 * User roles in the system
 */
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  SWEET_NOT_FOUND: 'Sweet not found',
  USER_NOT_FOUND: 'User not found',
  INVALID_CREDENTIALS: 'Invalid credentials',
  AUTH_REQUIRED: 'Authentication required',
  ADMIN_REQUIRED: 'Admin access required',
  INSUFFICIENT_QUANTITY: 'Insufficient quantity in stock',
  USER_ALREADY_EXISTS: 'Username or email already exists',
  SWEET_NAME_EXISTS: 'Sweet with this name already exists',
  INVALID_TOKEN: 'Invalid or expired token',
  TOKEN_REQUIRED: 'Access token required',
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  SWEET_CREATED: 'Sweet created successfully',
  SWEET_UPDATED: 'Sweet updated successfully',
  SWEET_DELETED: 'Sweet deleted successfully',
  PURCHASE_SUCCESS: 'Purchase successful',
  RESTOCK_SUCCESS: 'Restock successful',
  USER_REGISTERED: 'User registered successfully',
} as const;

/**
 * Validation constraints
 */
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
  PRICE_MIN: 0,
  QUANTITY_MIN: 0,
  QUANTITY_PURCHASE_MIN: 0.01,
} as const;

/**
 * JWT Configuration
 */
export const JWT_CONFIG = {
  EXPIRES_IN: '24h',
  DEFAULT_SECRET: 'default-secret',
} as const;

/**
 * Database configuration
 */
export const DB_CONFIG = {
  SALT_ROUNDS: 10,
} as const;

