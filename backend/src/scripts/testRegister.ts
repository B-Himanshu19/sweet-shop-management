import { authService } from '../services/authService';
import { database } from '../database/database';

async function testRegister() {
  try {
    console.log('🔍 Testing user registration...\n');

    // Try to register a test user
    const testUser = {
      username: 'testuser123',
      email: 'test@example.com',
      password: 'test123456',
      role: 'user' as const
    };

    console.log('Registering test user:', testUser.username);
    const user = await authService.register(testUser);
    console.log('✅ User registered successfully:', user);

    // Give it a moment then check database
    await new Promise(r => setTimeout(r, 1000));

    console.log('\nChecking if user is in database...');
    const allUsers = database.db.prepare('SELECT * FROM users WHERE username = ?').all(testUser.username);
    console.log('Found users:', allUsers);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

testRegister();
