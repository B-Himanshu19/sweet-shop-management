import { authService } from '../services/authService';
import { database } from '../database/database';

const defaultUsers = [
  {
    username: 'admin',
    email: 'admin@sweetshop.com',
    password: 'admin123',
    role: 'admin' as const,
  },
  {
    username: 'user',
    email: 'user@sweetshop.com',
    password: 'user123',
    role: 'user' as const,
  },
];

async function seedUsers() {
  try {
    console.log('Starting user seed...');
    
    // Check if users already exist
    const existingUsers = await database.all('SELECT COUNT(*) as count FROM users');
    const count = existingUsers[0]?.count || 0;
    
    if (count > 0) {
      console.log(`Database already has ${count} users.`);
      console.log('Checking if default users exist...');
    }

    // Add default users
    for (const userData of defaultUsers) {
      try {
        // Check if user already exists
        const existing = await database.get(
          'SELECT * FROM users WHERE username = ? OR email = ?',
          [userData.username, userData.email]
        );

        if (existing) {
          console.log(`⊘ User '${userData.username}' already exists (role: ${existing.role})`);
        } else {
          await authService.register(userData);
          console.log(`✓ Created ${userData.role}: ${userData.username} (password: ${userData.password})`);
        }
      } catch (error: any) {
        if (error.message.includes('already exists')) {
          console.log(`⊘ User '${userData.username}' already exists`);
        } else {
          console.error(`✗ Error creating user ${userData.username}:`, error.message);
        }
      }
    }

    console.log('\n✓ User seeding completed!');
    console.log('\n📋 Default Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Admin User:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   Email: admin@sweetshop.com');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Regular User:');
    console.log('   Username: user');
    console.log('   Password: user123');
    console.log('   Email: user@sweetshop.com');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  } finally {
    await database.close();
    process.exit(0);
  }
}

seedUsers();

