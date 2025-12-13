import { sweetService } from '../services/sweetService';
import { database } from '../database/database';

// Sample sweets with prices per kg and stock in kg
const sampleSweets = [
  { 
    name: 'Chocolate Bar', 
    category: 'Chocolate', 
    price: 599.00, 
    quantity: 50.0, 
    image_url: 'https://images.unsplash.com/photo-1606312619070-d48b4bc98fb0?w=400&h=300&fit=crop',
    description: 'Rich and creamy chocolate bars made from premium cocoa beans. Perfect for gifting or personal indulgence. Available in various weights to suit your needs.'
  },
  { 
    name: 'Gummy Bears', 
    category: 'Gummies', 
    price: 399.00, 
    quantity: 100.0, 
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    description: 'Colorful and fruity gummy bears that are soft, chewy, and bursting with natural fruit flavors. A favorite among kids and adults alike.'
  },
  { 
    name: 'Lollipop', 
    category: 'Hard Candy', 
    price: 150.00, 
    quantity: 75.0, 
    image_url: 'https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=400&h=300&fit=crop',
    description: 'Classic hard candy lollipops in various flavors. Long-lasting sweetness that brings back childhood memories.'
  },
  { 
    name: 'Caramel Candy', 
    category: 'Caramel', 
    price: 450.00, 
    quantity: 60.0, 
    image_url: 'https://images.unsplash.com/photo-1606312619070-d48b4bc98fb0?w=400&h=300&fit=crop',
    description: 'Smooth and buttery caramel candies with a rich, melt-in-your-mouth texture. Made with real butter and cream for authentic flavor.'
  },
  { 
    name: 'Jelly Beans', 
    category: 'Gummies', 
    price: 699.00, 
    quantity: 80.0, 
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    description: 'Premium jelly beans in a rainbow of flavors. Each bean is carefully crafted with a soft center and a slightly firm shell.'
  },
  { 
    name: 'Marshmallows', 
    category: 'Soft Candy', 
    price: 350.00, 
    quantity: 90.0, 
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    description: 'Fluffy and light marshmallows that are perfect for roasting, baking, or enjoying straight from the bag. Soft and pillowy texture.'
  },
  { 
    name: 'Licorice', 
    category: 'Hard Candy', 
    price: 299.00, 
    quantity: 40.0, 
    image_url: 'https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=400&h=300&fit=crop',
    description: 'Traditional black licorice with a distinctive anise flavor. A classic candy for those who enjoy bold, unique tastes.'
  },
  { 
    name: 'Toffee', 
    category: 'Caramel', 
    price: 550.00, 
    quantity: 55.0, 
    image_url: 'https://images.unsplash.com/photo-1606312619070-d48b4bc98fb0?w=400&h=300&fit=crop',
    description: 'Buttery toffee with a perfect balance of sweetness and crunch. Made with premium ingredients for a rich, satisfying treat.'
  },
  { 
    name: 'Sour Patch Kids', 
    category: 'Gummies', 
    price: 499.00, 
    quantity: 70.0, 
    image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    description: 'Tangy and sweet gummy candies that start sour and end sweet. A fun and flavorful treat for all ages.'
  },
  { 
    name: 'Peppermint Candy', 
    category: 'Hard Candy', 
    price: 250.00, 
    quantity: 65.0, 
    image_url: 'https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=400&h=300&fit=crop',
    description: 'Refreshing peppermint hard candies that provide a cool, minty sensation. Great for freshening breath and satisfying sweet cravings.'
  },
];

async function seedDatabase() {
  try {
    console.log('Starting database seed...');
    
    // Check if sweets already exist
    const existingSweets = await database.all('SELECT COUNT(*) as count FROM sweets');
    const count = existingSweets[0]?.count || 0;
    
    if (count > 0) {
      console.log(`✓ Database already has ${count} sweets. Skipping seed to preserve your data.`);
      console.log('   Your existing sweets and categories will be preserved.');
      console.log('   To add more sweets, use the admin panel.');
      return;
    }
    
    console.log('Database is empty. Adding sample sweets...');

    // Add sample sweets
    for (const sweet of sampleSweets) {
      try {
        await sweetService.createSweet(sweet);
        console.log(`✓ Added: ${sweet.name}`);
      } catch (error: any) {
        if (error.message.includes('already exists')) {
          console.log(`⊘ Skipped: ${sweet.name} (already exists)`);
        } else {
          console.error(`✗ Error adding ${sweet.name}:`, error.message);
        }
      }
    }

    console.log('\n✓ Database seeding completed!');
    const finalCount = await database.all('SELECT COUNT(*) as count FROM sweets');
    console.log(`Total sweets in database: ${finalCount[0]?.count || 0}`);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await database.close();
    process.exit(0);
  }
}

seedDatabase();

