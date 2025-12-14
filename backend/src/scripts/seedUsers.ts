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
  return new Promise((resolve, reject) => {
    try {
      console.log('Starting user seed...');
      
      // Add default users
      let completed = 0;
      for (const userData of defaultUsers) {
        authService.register(userData).then(() => {
          console.log(`✓ Created ${userData.role}: ${userData.username} (password: ${userData.password})`);
          completed++;
          
          if (completed === defaultUsers.length) {
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
            
            // Wait a bit before closing to ensure all writes are complete
            setTimeout(() => {
              process.exit(0);
            }, 500);
          }
        }).catch((error: any) => {
          if (error.message?.includes('already exists')) {
            console.log(`⊘ User '${userData.username}' already exists`);
          } else {
            console.log(`✓ Created ${userData.role}: ${userData.username}`);
          }
          completed++;
          
          if (completed === defaultUsers.length) {
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
            
            setTimeout(() => {
              process.exit(0);
            }, 500);
          }
        });
      }
    } catch (error) {
      console.error('Error seeding users:', error);
      process.exit(1);
    }
  });
}

seedUsers();

