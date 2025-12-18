// app/api/lottery/winners/route.ts
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
        lw.id,
        lw.ft_code,
        lw.full_name,
        lw.prize_name,
        lw.won_at,
        g.mobile_phone
      FROM lottery_winners lw
      LEFT JOIN guests g ON lw.ft_code = g.ft_code
      ORDER BY lw.won_at DESC
    `);

    client.release();

    return NextResponse.json(result.rows);

  } catch (error) {
    console.error('Get winners error:', error);
    return NextResponse.json(
      { message: 'Алдаа гарлаа' },
      { status: 500 }
    );
  }
}