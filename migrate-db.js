// Database migration script to add password_hash column
import { neon } from '@neondatabase/serverless';

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
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

    // Also make email required (not null)
    await sql`ALTER TABLE users ALTER COLUMN email SET NOT NULL`;
    console.log('✅ email column set to NOT NULL');

    console.log('🎉 Database migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();