import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '@shared/schema';

const { Pool } = pg;

let _db: ReturnType<typeof drizzle>;
let _pool: pg.Pool;

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
    _pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    _db = drizzle(_pool, { schema });
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