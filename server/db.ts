import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '@shared/schema';

let _db: ReturnType<typeof drizzle>;

function getDb() {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL not configured!');
      console.error('   Please set DATABASE_URL in Vercel environment variables');
      console.error('   Get a free PostgreSQL database from:');
      console.error('   - Neon: https://neon.tech');
      console.error('   - Supabase: https://supabase.com');
      throw new Error('DATABASE_URL environment variable is required');
    }
    const sql = neon(process.env.DATABASE_URL);
    _db = drizzle(sql, { schema });
  }
  return _db;
}

// Export a proxy that lazily initializes the database
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    const database = getDb();
    return database[prop as keyof typeof database];
  }
});