import { database } from '../database/database';

console.log('🔍 Checking users in database...\n');

async function checkUsers() {
  try {
    const result = await database.all('SELECT id, username, email, role FROM users');
    
    console.log('👥 Users in database:');
    if (result && result.length > 0) {
      result.forEach((user: any) => {
        console.log(`  - ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Role: ${user.role}`);
      });
      console.log(`\n✅ Total users: ${result.length}`);
    } else {
      console.log('\n⚠️  No users found in database!');
      console.log('   Please run: npm run seed:users');
    }
  } catch (error: any) {
    console.error('❌ Error checking users:', error.message);
  } finally {
    process.exit(0);
  }
}

checkUsers();
