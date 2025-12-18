// app/api/checkin/reset/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

export async function POST(request: NextRequest) {
  // ⚠️ ЗӨВХӨН DEVELOPMENT MODE-Д АШИГЛАХ!
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { message: 'Production mode дээр ашиглах боломжгүй' },
      { status: 403 }
    );
  }

  try {
    const { ftCode } = await request.json();

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // lottery_participants-с устгах
      await client.query(
        'DELETE FROM lottery_participants WHERE ft_code = $1',
        [ftCode.toUpperCase()]
      );

      // is_checked_in reset хийх
      await client.query(
        `UPDATE guests 
         SET is_checked_in = false, 
             checked_in_at = NULL 
         WHERE ft_code = $1`,
        [ftCode.toUpperCase()]
      );

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'Reset хийгдлээ'
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Reset error:', error);
    return NextResponse.json(
      { message: 'Алдаа гарлаа' },
      { status: 500 }
    );
  }
}