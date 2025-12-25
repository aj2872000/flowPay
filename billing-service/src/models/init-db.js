const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const initDB = async () => {
    try {
        await pool.query(`
            CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- For gen_random_uuid()

            CREATE TABLE IF NOT EXISTS invoices (
                id UUID PRIMARY KEY,
                user_id UUID NOT NULL,
                subscription_id UUID NOT NULL,
                amount NUMERIC NOT NULL,
                status VARCHAR(20) DEFAULT 'PENDING',
                retry_count INT DEFAULT 0,
                idempotency_key VARCHAR(255) UNIQUE,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );

            `);

        console.log('✅ Database initialized');
    } catch (err) {
        console.error('❌ Error initializing database:', err.message);
        process.exit(1);
    }
};

module.exports = { initDB, pool };
