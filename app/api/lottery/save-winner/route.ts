// app/api/lottery/save-winner/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

export async function POST(request: NextRequest) {
  try {
    const { participantId, ftCode, fullName, prizeName } = await request.json();

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Хожигч хадгалах
      await client.query(
        `INSERT INTO lottery_winners (participant_id, ft_code, full_name, prize_name)
         VALUES ($1, $2, $3, $4)`,
        [participantId, ftCode, fullName, prizeName || 'Шагнал']
      );

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'Хожигч хадгалагдлаа'
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Save winner error:', error);
    return NextResponse.json(
      { message: 'Алдаа гарлаа' },
      { status: 500 }
    );
  }
}