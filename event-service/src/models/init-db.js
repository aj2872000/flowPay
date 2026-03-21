const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const initDB = async () => {
    try {
        await pool.query(`
            CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- For gen_random_uuid()

            CREATE TABLE IF NOT EXISTS events (
                id UUID PRIMARY KEY,
                event_type VARCHAR(50) NOT NULL,
                source VARCHAR(50) NOT NULL,
                payload JSONB NOT NULL,
                processed BOOLEAN DEFAULT FALSE,
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
