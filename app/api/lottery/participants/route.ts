// // app/api/lottery/participants/route.ts
// import { NextResponse } from 'next/server';
// import sql from 'mssql';

// const config: sql.config = {
//   user: process.env.DB_USER!,
//   password: process.env.DB_PASSWORD!,
//   server: process.env.DB_SERVER!,
//   database: process.env.DB_DATABASE!,
//   options: {
//     encrypt: true,
//     trustServerCertificate: false
//   }
// };

// export async function GET() {
//   try {
//     const pool = await sql.connect(config);
    
//     const result = await pool.request().query(`
//       SELECT 
//         lp.id,
//         lp.ft_code,
//         lp.full_name,
//         lp.entered_at
//       FROM lottery_participants lp
//       INNER JOIN guests g ON lp.guest_id = g.id
//       WHERE g.is_checked_in = 1
//       ORDER BY lp.entered_at DESC
//     `);

//     await pool.close();

//     return NextResponse.json(result.recordset);

//   } catch (error) {
//     console.error('Get participants error:', error);
//     return NextResponse.json(
//       { message: 'Серверийн алдаа гарлаа' },
//       { status: 500 }
//     );
//   }
// }