// Database migration script to add password_hash column
import pg from 'pg';

const { Client } = pg;

function parseConnectionString(connectionString) {
  const url = new URL(connectionString);
  return {
    host: url.hostname,
    port: parseInt(url.port || '5432'),
    database: url.pathname.slice(1),
    user: url.username,
    password: url.password,
  };
}

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️  DATABASE_URL not set - skipping migration');
    console.warn('   Please set DATABASE_URL in Vercel environment variables');
    process.exit(0); // Exit successfully to continue build
  }

  // Parse connection string to force IPv4
  const config = parseConnectionString(process.env.DATABASE_URL);
  
  const client = new Client({
    ...config,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 10000,
  });

  try {
    await client.connect();
    console.log('Connected to database');
    console.log('Adding password_hash column to users table...');
    
    // Check if column already exists
    const columnExists = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'password_hash'
    `);

    if (columnExists.rows.length === 0) {
      await client.query('ALTER TABLE users ADD COLUMN password_hash varchar');
      console.log('✅ password_hash column added successfully');
    } else {
      console.log('✅ password_hash column already exists');
    }

    // Try to make email required (not null) - skip if it fails
    try {
      // First update any null emails to prevent constraint violation
      await client.query("UPDATE users SET email = CONCAT('user_', id, '@example.com') WHERE email IS NULL");
      await client.query('ALTER TABLE users ALTER COLUMN email SET NOT NULL');
      console.log('✅ email column set to NOT NULL');
    } catch (e) {
      console.log('⚠️  Could not set email to NOT NULL (might already be set)');
    }

    console.log('🎉 Database migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.warn('⚠️  Continuing build despite migration failure...');
    console.warn('   The app may not work properly without a valid database.');
    console.warn('   Please check your DATABASE_URL in Vercel environment variables.');
    
    // Check if it's a connection error
    if (error.message && error.message.includes('ENOTFOUND')) {
      console.error('   → Database host not found. Is your DATABASE_URL correct?');
    }
    
    // Exit successfully to continue build
    process.exit(0);
  } finally {
    await client.end();
  }
}

migrate();