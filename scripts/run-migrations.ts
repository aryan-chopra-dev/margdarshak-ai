import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { Client } from 'pg';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function run() {
  console.log('🔄 Running Margdarshak AI migrations...');
  let connectionString = process.env.DATABASE_URL;
  if (connectionString && connectionString.includes('pooler.supabase.com')) {
    connectionString = 'postgres://postgres:Supabase%40123@db.qzmvmbsbdajyxfddbxcr.supabase.co:5432/postgres';
  }
  if (!connectionString) {
    console.error('❌ DATABASE_URL is not set in environment variables.');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });
  try {
    await client.connect();
    const sqlPath = path.resolve(process.cwd(), 'scripts/migrations.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('Executing SQL migration script...');
    await client.query(sql);
    console.log('✅ Migrations applied successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
