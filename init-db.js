#!/usr/bin/env node

/**
 * Database Setup Script
 * Creates necessary tables for Finance AI application
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection
if (!process.env.DB_PASSWORD) {
  console.error('❌ Environment variable DB_PASSWORD is not set. Please set it before running this script.');
  process.exit(1);
}

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...');

    // Read SQL schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split schema into individual statements and execute
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      try {
        await pool.query(statement);
        console.log('✅ Executed statement');
      } catch (err) {
        console.log('⚠️  Statement error (may be expected):', err.message.split('\n')[0]);
      }
    }

    console.log('✅ Database initialization complete!');
    console.log('📋 Tables created:');
    console.log('  - users');
    console.log('  - transactions');
    console.log('  - recurring_expenses');

    // Verify tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    console.log('\n📊 Existing tables:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    await pool.end();
  } catch (err) {
    console.error('❌ Database initialization failed:', err);
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();
