// app/api/directors/route.ts
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
        id,
        full_name,
        mobile_phone,
        desk_no,
        is_attended,
        attended_at,
        created_at
      FROM directors
      ORDER BY created_at ASC
    `);

    client.release();

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching directors:', error);
    return NextResponse.json(
      { success: false, message: 'Алдаа гарлаа' },
      { status: 500 }
    );
  }
}