const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const initDB = async () => {
    try {
        await pool.query(`
            CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- For gen_random_uuid()

            CREATE TABLE IF NOT EXISTS simulated_payments (
                id UUID PRIMARY KEY,
                order_id UUID NOT NULL,
                status VARCHAR(20) NOT NULL,
                amount NUMERIC(10,2),
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
