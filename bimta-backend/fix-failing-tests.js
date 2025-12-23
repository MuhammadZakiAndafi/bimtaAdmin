// fix-failing-tests.js
require('dotenv').config({ path: '.env.test' });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'bimta_db',
  user: process.env.DB_USER || 'postgres',
  ...(process.env.DB_PASSWORD && { password: process.env.DB_PASSWORD }),
});

async function setupTestData() {
  try {
    console.log('🔧 Setting up test data for referensi...\n');

    // Create sample referensi for testing
    const sampleReferensi = [
      {
        nim: 'test_ref_001',
        nama: 'Test Mahasiswa 1',
        judul: 'Test Judul Machine Learning',
        topik: 'Machine Learning',
        tahun: 2024,
        doc_url: 'https://example.com/doc1.pdf',
      },
      {
        nim: 'test_ref_002',
        nama: 'Test Mahasiswa 2',
        judul: 'Test Judul Web Development',
        topik: 'Web Development',
        tahun: 2024,
        doc_url: 'https://example.com/doc2.pdf',
      },
      {
        nim: 'test_ref_003',
        nama: 'Test Mahasiswa 3',
        judul: 'Test Judul Mobile App',
        topik: 'Mobile Development',
        tahun: 2023,
        doc_url: 'https://example.com/doc3.pdf',
      },
    ];

    for (const ref of sampleReferensi) {
      // Check if exists
      const existing = await pool.query(
        'SELECT * FROM referensi_ta WHERE nim_mahasiswa = $1',
        [ref.nim]
      );

      if (existing.rows.length === 0) {
        await pool.query(
          `INSERT INTO referensi_ta (nim_mahasiswa, nama_mahasiswa, judul, topik, tahun, doc_url, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
          [ref.nim, ref.nama, ref.judul, ref.topik, ref.tahun, ref.doc_url]
        );
        console.log(`✅ Created referensi: ${ref.nim}`);
      } else {
        console.log(`✅ Referensi already exists: ${ref.nim}`);
      }
    }

    console.log('\n✨ Test data setup completed!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

setupTestData();