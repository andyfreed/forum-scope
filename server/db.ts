import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '@shared/schema';

const { Pool } = pg;

let _db: ReturnType<typeof drizzle>;
let _pool: pg.Pool;

function parseConnectionString(connectionString: string) {
  const url = new URL(connectionString);
  return {
    host: url.hostname,
    port: parseInt(url.port || '5432'),
    database: url.pathname.slice(1),
    user: url.username,
    password: url.password,
  };
}

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
    
    // Parse connection string to force IPv4
    const config = parseConnectionString(process.env.DATABASE_URL);
    
    _pool = new Pool({
      ...config,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      // Force IPv4
      ...(process.env.NODE_ENV === 'production' && {
        host: config.host.replace('.supabase.co', '.supabase.co'),
        connectionTimeoutMillis: 10000,
      }),
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