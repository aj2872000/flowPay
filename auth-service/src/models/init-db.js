const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const initDB = async () => {
  try {
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- For gen_random_uuid()

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(50) DEFAULT 'USER',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Database initialized');
  } catch (err) {
    console.error('❌ Error initializing database:', err.message);
    process.exit(1);
  }
};

module.exports = { initDB, pool };
