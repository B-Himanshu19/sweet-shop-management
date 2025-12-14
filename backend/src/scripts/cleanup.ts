import { database } from '../database/database';

async function cleanupSweets() {
  try {
    const itemsToDelete = [
      'Vadiyalu',
      'Podulu',
      'Andhra Ariselu',
      'Mango Pickle',
      'Lime Pickle',
      'Premium Gift Box - Assorted',
      'Royal Celebration Box'
    ];

    console.log('Deleting unwanted sweets...');
    
    for (const name of itemsToDelete) {
      await database.run('DELETE FROM sweets WHERE name = ?', [name]);
      console.log(`✓ Deleted: ${name}`);
    }

    const remaining = await database.all('SELECT COUNT(*) as count FROM sweets');
    console.log(`\n✓ Cleanup complete! Remaining sweets: ${remaining[0]?.count || 0}`);
    
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  } finally {
    await database.close();
    process.exit(0);
  }
}

cleanupSweets();
