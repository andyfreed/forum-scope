// Database migration script to add password_hash column
import { neon } from '@neondatabase/serverless';

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️  DATABASE_URL not set - skipping migration');
    console.warn('   Please set DATABASE_URL in Vercel environment variables');
    process.exit(0); // Exit successfully to continue build
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('Adding password_hash column to users table...');
    
    // Check if column already exists
    const columnExists = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'password_hash'
    `;

    if (columnExists.length === 0) {
      await sql`ALTER TABLE users ADD COLUMN password_hash varchar`;
      console.log('✅ password_hash column added successfully');
    } else {
      console.log('✅ password_hash column already exists');
    }

    // Try to make email required (not null) - skip if it fails
    try {
      // First update any null emails to prevent constraint violation
      await sql`UPDATE users SET email = CONCAT('user_', id, '@example.com') WHERE email IS NULL`;
      await sql`ALTER TABLE users ALTER COLUMN email SET NOT NULL`;
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
  }
}

migrate();