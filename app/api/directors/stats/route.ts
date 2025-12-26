// app/api/directors/stats/route.ts
import { NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

export async function GET() {
  try {
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT 
        COUNT(*)::int as total,
        COUNT(*) FILTER (WHERE is_attended = true)::int as attended,
        COUNT(*) FILTER (WHERE is_attended = false)::int as pending
      FROM directors
    `);

    client.release();

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, message: 'Алдаа гарлаа' },
      { status: 500 }
    );
  }
}