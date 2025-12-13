import { UserCreate, UserPublic } from '../models/User';

/**
 * Interface for Authentication Service operations
 * Follows Interface Segregation Principle (ISP)
 */
export interface IAuthService {
  register(userData: UserCreate): Promise<UserPublic>;
  login(username: string, password: string): Promise<{ token: string; user: UserPublic }>;
  getCurrentUser(userId: number): Promise<UserPublic>;
}

