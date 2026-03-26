const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'shopnova.db');
const db = new sqlite3.Database(dbPath);

const runAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this);
    });
  });

const allAsync = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });

const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        // Users table
        await runAsync(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          reset_token_hash TEXT,
          reset_token_expires_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

        // Migration for existing databases
        const columns = await allAsync(`PRAGMA table_info(users)`);
        const columnNames = columns.map((column) => column.name);

        if (!columnNames.includes('reset_token_hash')) {
          await runAsync(`ALTER TABLE users ADD COLUMN reset_token_hash TEXT`);
        }

        if (!columnNames.includes('reset_token_expires_at')) {
          await runAsync(`ALTER TABLE users ADD COLUMN reset_token_expires_at DATETIME`);
        }

        // Categories table
        await runAsync(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          icon TEXT,
          image TEXT
        )
      `);

        // Products table
        await runAsync(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          price REAL NOT NULL,
          sale_price REAL,
          image TEXT,
          category_id INTEGER,
          rating REAL DEFAULT 4.5,
          reviews INTEGER DEFAULT 0,
          stock INTEGER DEFAULT 100,
          featured INTEGER DEFAULT 0,
          FOREIGN KEY (category_id) REFERENCES categories(id)
        )
      `);

        // Cart items table
        await runAsync(`
        CREATE TABLE IF NOT EXISTS cart_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          session_id TEXT,
          product_id INTEGER NOT NULL,
          quantity INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (product_id) REFERENCES products(id)
        )
      `);

        // Orders table
        await runAsync(`
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          total_amount REAL NOT NULL,
          status TEXT DEFAULT 'pending',
          shipping_address TEXT,
          payment_method TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `);

        // Order items table
        await runAsync(`
        CREATE TABLE IF NOT EXISTS order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          price REAL NOT NULL,
          FOREIGN KEY (order_id) REFERENCES orders(id),
          FOREIGN KEY (product_id) REFERENCES products(id)
        )
      `);

        // Wishlist table
        await runAsync(`
        CREATE TABLE IF NOT EXISTS wishlist (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (product_id) REFERENCES products(id),
          UNIQUE(user_id, product_id)
        )
      `);

        console.log('Database tables created successfully');
        resolve(db);
      } catch (error) {
        reject(error);
      }
    });
  });
};

const seedDatabase = () => {
  return new Promise((resolve, reject) => {
    // Check if categories exist
    db.get('SELECT COUNT(*) as count FROM categories', (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      if (row.count > 0) {
        console.log('Database already seeded');
        resolve();
        return;
      }

      // Seed categories
      const categories = [
        { name: 'Electronics & Gadgets', icon: '💻', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400' },
        { name: 'Fashion & Apparel', icon: '👔', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400' },
        { name: 'Home & Living', icon: '🏠', image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400' },
        { name: 'Beauty & Skincare', icon: '✨', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400' },
        { name: 'Sports & Outdoors', icon: '⚽', image: 'https://images.unsplash.com/photo-1461896836934- voices-4723606?w=400' },
        { name: 'Books & Media', icon: '📚', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400' }
      ];

      const categoryStmt = db.prepare('INSERT INTO categories (name, icon, image) VALUES (?, ?, ?)');
      categories.forEach(cat => {
        categoryStmt.run(cat.name, cat.icon, cat.image);
      });
      categoryStmt.finalize();

      // Seed products
      const products = [
        // Electronics
        { name: 'Premium Wireless Headphones', description: 'High-fidelity audio with noise cancellation', price: 299.99, sale_price: 199.99, category_id: 1, rating: 4.8, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' },
        { name: 'Smart Watch Pro', description: 'Advanced fitness tracking and notifications', price: 449.99, sale_price: 349.99, category_id: 1, rating: 4.7, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' },
        { name: 'Portable Bluetooth Speaker', description: '360° surround sound, waterproof', price: 129.99, sale_price: 89.99, category_id: 1, rating: 4.6, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400' },
        { name: '4K Ultra HD Webcam', description: 'Crystal clear video for streaming', price: 179.99, sale_price: 129.99, category_id: 1, rating: 4.5, image: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=400' },
        
        // Fashion
        { name: 'Classic Leather Jacket', description: 'Genuine leather, timeless design', price: 399.99, sale_price: 299.99, category_id: 2, rating: 4.9, image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400' },
        { name: 'Designer Sunglasses', description: 'UV400 protection, premium frames', price: 199.99, sale_price: 149.99, category_id: 2, rating: 4.7, image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400' },
        { name: 'Cashmere Sweater', description: '100% pure cashmere, luxury comfort', price: 289.99, sale_price: 219.99, category_id: 2, rating: 4.8, image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400' },
        { name: 'Premium Watch Collection', description: 'Swiss movement, water resistant', price: 599.99, sale_price: 449.99, category_id: 2, rating: 4.9, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' },

        // Home & Living
        { name: 'Modern Table Lamp', description: 'LED lighting with touch control', price: 89.99, sale_price: 59.99, category_id: 3, rating: 4.5, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400' },
        { name: 'Luxury Bedding Set', description: 'Egyptian cotton, 1000 thread count', price: 299.99, sale_price: 199.99, category_id: 3, rating: 4.8, image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400' },
        { name: 'Ceramic Vase Collection', description: 'Handcrafted, minimalist design', price: 79.99, sale_price: 49.99, category_id: 3, rating: 4.6, image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400' },
        { name: 'Smart Home Speaker', description: 'Voice control, premium sound', price: 199.99, sale_price: 149.99, category_id: 3, rating: 4.7, image: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=400' },

        // Beauty
        { name: 'Luxury Skincare Set', description: 'Anti-aging, hydrating formula', price: 249.99, sale_price: 179.99, category_id: 4, rating: 4.9, image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400' },
        { name: 'Professional Makeup Palette', description: '24 colors, high pigment', price: 89.99, sale_price: 64.99, category_id: 4, rating: 4.7, image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400' },
        { name: 'Premium Perfume Collection', description: 'Long-lasting, designer scent', price: 159.99, sale_price: 119.99, category_id: 4, rating: 4.8, image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400' },
        { name: 'Hair Care Deluxe Set', description: 'Sulfate-free, salon quality', price: 129.99, sale_price: 89.99, category_id: 4, rating: 4.6, image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400' },

        // Sports
        { name: 'Yoga Mat Pro', description: 'Non-slip, eco-friendly material', price: 69.99, sale_price: 49.99, category_id: 5, rating: 4.7, image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400' },
        { name: 'Adjustable Dumbbell Set', description: 'Space-saving, multiple weights', price: 299.99, sale_price: 229.99, category_id: 5, rating: 4.8, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400' },
        { name: 'Running Shoes Elite', description: 'Lightweight, maximum cushioning', price: 179.99, sale_price: 129.99, category_id: 5, rating: 4.9, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
        { name: 'Fitness Tracker Band', description: 'Heart rate, sleep monitoring', price: 99.99, sale_price: 69.99, category_id: 5, rating: 4.5, image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=400' },

        // Books
        { name: 'Bestseller Novel Collection', description: 'Award-winning fiction', price: 49.99, sale_price: 34.99, category_id: 6, rating: 4.8, image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400' },
        { name: 'Business Strategy Guide', description: 'Expert insights and case studies', price: 39.99, sale_price: 27.99, category_id: 6, rating: 4.6, image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400' },
        { name: 'Cooking Masterclass Book', description: '100+ gourmet recipes', price: 59.99, sale_price: 42.99, category_id: 6, rating: 4.7, image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400' },
        { name: 'Photography Art Book', description: 'Stunning visuals, expert tips', price: 79.99, sale_price: 54.99, category_id: 6, rating: 4.9, image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400' }
      ];

      const productStmt = db.prepare('INSERT INTO products (name, description, price, sale_price, category_id, rating, image) VALUES (?, ?, ?, ?, ?, ?, ?)');
      products.forEach(prod => {
        productStmt.run(prod.name, prod.description, prod.price, prod.sale_price, prod.category_id, prod.rating, prod.image);
      });
      productStmt.finalize();

      console.log('Database seeded successfully');
      resolve();
    });
  });
};

module.exports = { db, initializeDatabase, seedDatabase };
