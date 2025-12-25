const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const initDB = async () => {
    try {
        await pool.query(`
            CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- For gen_random_uuid()

            CREATE TABLE IF NOT EXISTS plans (
                id SERIAL PRIMARY KEY,
                name VARCHAR(50) NOT NULL,
                price NUMERIC(10,2) NOT NULL,
                duration_days INT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS subscriptions (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(50) NOT NULL,
                plan_id INT REFERENCES plans(id),
                status VARCHAR(20) DEFAULT 'ACTIVE',
                start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                end_date TIMESTAMP
            );
            `);

        console.log('✅ Database initialized');
    } catch (err) {
        console.error('❌ Error initializing database:', err.message);
        process.exit(1);
    }
};

module.exports = { initDB, pool };
