#!/usr/bin/env node

const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'postgres',
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
});

async function createTable() {
  try {
    console.log('Creating recurring_expenses table...');
    
    const result = await pool.query(`
      CREATE TABLE IF NOT EXISTS recurring_expenses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'monthly')),
        category VARCHAR(50) DEFAULT 'Other',
        description TEXT,
        last_added DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ Table created successfully');
    
    // Verify table exists
    const verify = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'recurring_expenses'
    `);
    
    if (verify.rows.length > 0) {
      console.log('✅ Verified: recurring_expenses table exists');
    }
    
    await pool.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createTable();
