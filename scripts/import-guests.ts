// scripts/import-guests.ts
import { Pool } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

async function importGuests() {
  // JSON файл унших
  const filePath = path.join(__dirname, 'guests.json');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const guestsData = JSON.parse(fileContent);

  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    console.log(`📥 ${guestsData.length} хүн оруулж байна...`);

    for (let i = 0; i < guestsData.length; i++) {
      const guest = guestsData[i];
      
      // Desk дугаар автоматаар тооцоолох (10 хүн тутамд 1 ширээ)
      const deskNo = Math.floor(i / 10) + 1;
      
      await client.query(
        `INSERT INTO guests (ft_code, first_name, last_name, mobile_phone, desk_no)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (ft_code) DO NOTHING`,
        [
          guest['No_'],
          guest['First Name']?.trim() || '',
          guest['Last Name']?.trim() || '',
          guest['Mobile Phone No_']?.trim().replace(/\n/g, '') || '',
          deskNo.toString()
        ]
      );
    }

    await client.query('COMMIT');
    console.log('✅ Import амжилттай!');
    
    // Шалгалт
    const result = await client.query('SELECT COUNT(*) FROM guests');
    console.log(`📊 Нийт оруулсан: ${result.rows[0].count} хүн`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Алдаа:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

importGuests();