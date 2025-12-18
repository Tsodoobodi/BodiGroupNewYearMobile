// app/api/checkin/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

export async function POST(request: NextRequest) {
  try {
    const { ftCode } = await request.json();

    if (!ftCode) {
      return NextResponse.json(
        { message: 'FT код оруулна уу' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    const result = await client.query(
      `SELECT 
        id,
        ft_code,
        first_name,
        last_name,
        mobile_phone,
        desk_no,
        is_checked_in
      FROM guests 
      WHERE ft_code = $1`,
      [ftCode.toUpperCase()]
    );

    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: 'FT код олдсонгүй. Дахин шалгана уу.' },
        { status: 404 }
      );
    }

    const guest = result.rows[0];

    // ✅ Бүртгүүлсэн эсэхийг шалгахгүй - мэдээлэл буцаана
    return NextResponse.json({
      ft_code: guest.ft_code,
      first_name: guest.first_name,
      last_name: guest.last_name,
      mobile_phone: guest.mobile_phone,
      desk_no: guest.desk_no,
      is_checked_in: guest.is_checked_in  // ← Frontend-д хэрэгтэй
    });

  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json(
      { message: 'Серверийн алдаа гарлаа' },
      { status: 500 }
    );
  }
}