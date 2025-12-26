// app/api/directors/[id]/unattend/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await pool.connect();

    const result = await client.query(
      `UPDATE directors 
       SET is_attended = false,
           attended_at = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Зочин олдсонгүй' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Амжилттай буцаагдлаа'
    });
  } catch (error) {
    console.error('Error unmarking attended:', error);
    return NextResponse.json(
      { success: false, message: 'Алдаа гарлаа' },
      { status: 500 }
    );
  }
}