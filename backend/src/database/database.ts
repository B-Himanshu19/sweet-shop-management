import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

// Use absolute path to ensure database persists in the same location
// Default to backend/sweet_shop.db - this ensures data persists across restarts
const getDbPath = () => {
  if (process.env.DB_PATH) {
    return path.resolve(process.env.DB_PATH);
  }
  
  // Determine if we're running from source (src/) or compiled (dist/)
  // __dirname will be either backend/src/database or backend/dist/database
  // Go up two levels to get to backend directory
  const backendDir = path.resolve(__dirname, '../..');
  const dbPath = path.join(backendDir, 'sweet_shop.db');
  
  // Ensure the directory exists
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  return dbPath;
};

const DB_PATH = getDbPath();

class Database {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log(`✓ Connected to SQLite database at: ${DB_PATH}`);
        console.log('  ✓ Data will persist across application restarts');
        this.initializeTables();
      }
    });
  }

  private initializeTables() {
    // Users table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Sweets table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS sweets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL CHECK(price >= 0),
        quantity REAL NOT NULL DEFAULT 0 CHECK(quantity >= 0),
        image_url TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Migrate existing databases: Add image_url and description columns if needed
    this.db.all("PRAGMA table_info(sweets)", (err, rows: any[]) => {
      if (!err && rows) {
        const hasImageUrl = rows.some((col: any) => col.name === 'image_url');
        const hasDescription = rows.some((col: any) => col.name === 'description');
        
        if (!hasImageUrl) {
          this.db.run(`ALTER TABLE sweets ADD COLUMN image_url TEXT`, (err2) => {
            if (err2) {
              // Column might already exist, ignore error
            } else {
              console.log('Added image_url column to sweets table');
            }
          });
        }
        
        if (!hasDescription) {
          this.db.run(`ALTER TABLE sweets ADD COLUMN description TEXT`, (err2) => {
            if (err2) {
              // Column might already exist, ignore error
            } else {
              console.log('Added description column to sweets table');
            }
          });
        }
      }
    });

    // Purchases table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS purchases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        sweet_id INTEGER NOT NULL,
        sweet_name TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        quantity REAL NOT NULL CHECK(quantity > 0),
        total_amount REAL NOT NULL,
        purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (sweet_id) REFERENCES sweets(id)
      )
    `);
  }

  getDb(): sqlite3.Database {
    return this.db;
  }

  run(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }

  get(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

export const database = new Database();

