// scripts/reset-db.ts
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

async function resetDatabase() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM lottery_winners');
    await client.query('DELETE FROM lottery_participants');
    await client.query('UPDATE guests SET is_checked_in = false, checked_in_at = NULL');
    await client.query('COMMIT');
    
    console.log('✅ Database reset амжилттай!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Алдаа:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

resetDatabase();