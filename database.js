const sqlite3 = require('sqlite3').verbose();
const path    = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'etoh.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error('Database connection error:', err.message);
  else if (process.env.NODE_ENV !== 'test') console.log(`Connected to SQLite: ${path.basename(DB_PATH)}`);
});

db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON');

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    whatsapp TEXT,
    profile_picture TEXT,
    bio TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS stands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    vendor_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    stand_description TEXT,
    city TEXT DEFAULT 'Douala',
    creation_date TEXT DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stand_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    price_cfa REAL NOT NULL,
    category TEXT DEFAULT 'general',
    image_path TEXT,
    video_path TEXT,
    audio_voice_path TEXT,
    FOREIGN KEY (stand_id) REFERENCES stands(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    buyer_name TEXT NOT NULL,
    target_city TEXT NOT NULL,
    target_quarter TEXT NOT NULL,
    near_landmark TEXT NOT NULL,
    order_date TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stand_id INTEGER REFERENCES stands(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    media_path TEXT,
    media_type TEXT DEFAULT 'image',
    likes INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )`);

  const migrations = [
    "ALTER TABLE users ADD COLUMN whatsapp TEXT",
    "ALTER TABLE users ADD COLUMN profile_picture TEXT",
    "ALTER TABLE users ADD COLUMN bio TEXT",
    "ALTER TABLE stands ADD COLUMN user_id INTEGER REFERENCES users(id)",
    "ALTER TABLE stands ADD COLUMN city TEXT DEFAULT 'Douala'",
    "ALTER TABLE products ADD COLUMN category TEXT DEFAULT 'general'",
    "ALTER TABLE stands ADD COLUMN is_verified INTEGER DEFAULT 0",
  ];
  migrations.forEach((sql) => db.run(sql, () => {}));

  if (process.env.NODE_ENV !== 'test') console.log('Database tables initialized.');
});

module.exports = db;
