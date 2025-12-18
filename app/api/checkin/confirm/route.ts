// app/api/checkin/confirm/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

export async function POST(request: NextRequest) {
  const client = await pool.connect();
  
  try {
    const { ftCode } = await request.json();

    // Guest мэдээлэл авах
    const guestResult = await client.query(
      `SELECT id, first_name, last_name, is_checked_in 
       FROM guests 
       WHERE ft_code = $1`,
      [ftCode.toUpperCase()]
    );

    if (guestResult.rows.length === 0) {
      client.release();
      return NextResponse.json(
        { message: 'FT код олдсонгүй' },
        { status: 404 }
      );
    }

    const guest = guestResult.rows[0];

    if (guest.is_checked_in) {
      client.release();
      return NextResponse.json(
        { message: 'Энэ код аль хэдийн ашигласан байна' },
        { status: 400 }
      );
    }

    // Transaction эхлүүлэх
    await client.query('BEGIN');

    try {
      // Check-in хийх
      await client.query(
        `UPDATE guests 
         SET is_checked_in = true, 
             checked_in_at = CURRENT_TIMESTAMP 
         WHERE ft_code = $1`,
        [ftCode.toUpperCase()]
      );

      // Сугалаанд бүртгэх
      const fullName = `${guest.first_name} ${guest.last_name}`.trim();
      
      await client.query(
        `INSERT INTO lottery_participants (guest_id, ft_code, full_name)
         VALUES ($1, $2, $3)`,
        [guest.id, ftCode.toUpperCase(), fullName]
      );

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        message: 'Амжилттай баталгаажлаа'
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Confirm error:', error);
    return NextResponse.json(
      { message: 'Серверийн алдаа гарлаа' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}