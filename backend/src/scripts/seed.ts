import { sweetService } from '../services/sweetService';
import { database } from '../database/database';

// Sample sweets with prices per kg and stock in kg
const sampleSweets = [
  { 
    name: 'Rasmalai', 
    category: 'Milk-Based', 
    price: 100, 
    quantity: 15, 
    image_url: 'https://palatesdesire.com/wp-content/uploads/2022/09/Rasmalai-recipe@palates-desire.jpg',
    description: 'Experience the richness of traditional Indian desserts with our soft and spongy Rasmalai. Prepared using age-old methods, these delicate milk dumplings are soaked in thick, flavored milk to deliver a royal and refreshing taste.'
  },
  { 
    name: 'Kalakand', 
    category: 'Milk-Based', 
    price: 200, 
    quantity: 16, 
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTK2Z4eYjHUkq3flKvWj78c4SdKyeyHve9ZeQ&s',
    description: 'Relish the authentic taste of Kalakand, a classic Indian sweet known for its grainy texture and rich milk flavor, prepared using traditional cooking techniques.'
  },
  {
    name: 'Gulab Jamun',
    category: 'HOT',
    price: 80,
    quantity: 20,
    image_url: 'https://images.unsplash.com/photo-1585329967900-85b7ad8f69b5?w=400&h=300&fit=crop',
    description: 'Soft, spongy balls soaked in sugar syrup with a hint of cardamom. A beloved dessert that melts in your mouth with every bite.'
  },
  {
    name: 'Jalebi',
    category: 'HOT',
    price: 70,
    quantity: 25,
    image_url: 'https://images.unsplash.com/photo-1585329967900-85b7ad8f69b5?w=400&h=300&fit=crop',
    description: 'Crispy and sweet spiral-shaped Indian sweet made with refined flour and soaked in sugar syrup. Perfect for any celebration.'
  },
  {
    name: 'Barfi',
    category: 'SWEETS',
    price: 120,
    quantity: 18,
    image_url: 'https://images.unsplash.com/photo-1585329967900-85b7ad8f69b5?w=400&h=300&fit=crop',
    description: 'Rich and dense milk-based sweet with a fudgy texture. Available in various flavors including chocolate, coconut, and nuts.'
  },
  {
    name: 'Godavari Peda',
    category: 'GODAVARI SPECIALS',
    price: 180,
    quantity: 10,
    image_url: 'https://images.unsplash.com/photo-1585329967900-85b7ad8f69b5?w=400&h=300&fit=crop',
    description: 'Special delicacy from Godavari region. Soft pedas made with pure milk and flavored with authentic spices.'
  },
  {
    name: 'Laddu',
    category: 'SWEETS',
    price: 110,
    quantity: 22,
    image_url: 'https://images.unsplash.com/photo-1585329967900-85b7ad8f69b5?w=400&h=300&fit=crop',
    description: 'Spherical sweets made with gram flour, ghee, and jaggery. Melts instantly on your tongue.'
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

