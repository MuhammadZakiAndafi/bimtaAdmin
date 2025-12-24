// setup-test-user.js
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

async function setupTestUser() {
  try {
    console.log('🔧 Setting up test users...\n');

    // Hash password
    const hashedPassword = await bcrypt.hash('sandi123', 12);

    // Check if admin001 exists
    const checkAdmin = await pool.query(
      'SELECT * FROM users WHERE user_id = $1',
      ['admin001']
    );

    if (checkAdmin.rows.length > 0) {
      console.log('✅ Test admin already exists');
      
      // Update password to make sure it's correct
      await pool.query(
        'UPDATE users SET sandi = $1 WHERE user_id = $2',
        [hashedPassword, 'admin001']
      );
      console.log('✅ Admin password updated');
    } else {
      // Insert new admin
      await pool.query(
        `INSERT INTO users (user_id, nama, no_whatsapp, sandi, role, photo_url, status_user, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [
          'admin001',
          'Test Admin',
          '081234567890',
          hashedPassword,
          'admin',
          '/uploads/photos/default-avatar.png',
          'active'
        ]
      );
      console.log('✅ Test admin created');
    }

    // Create test dosen if not exists
    const checkDosen = await pool.query(
      'SELECT * FROM users WHERE user_id = $1',
      ['dosen001']
    );

    if (checkDosen.rows.length === 0) {
      const dosenPassword = await bcrypt.hash('Dosen123!', 12);
      await pool.query(
        `INSERT INTO users (user_id, nama, no_whatsapp, sandi, role, photo_url, status_user, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [
          'dosen001',
          'Test Dosen',
          '081234567891',
          dosenPassword,
          'dosen',
          '/uploads/photos/default-avatar.png',
          'active'
        ]
      );
      console.log('✅ Test dosen created');
    }

    // Create test mahasiswa if not exists
    const checkMhs = await pool.query(
      'SELECT * FROM users WHERE user_id = $1',
      ['mahasiswa001']
    );

    if (checkMhs.rows.length === 0) {
      const mhsPassword = await bcrypt.hash('Mahasiswa123!', 12);
      await pool.query(
        `INSERT INTO users (user_id, nama, no_whatsapp, sandi, role, photo_url, status_user, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [
          'mahasiswa001',
          'Test Mahasiswa',
          '081234567892',
          mhsPassword,
          'mahasiswa',
          '/uploads/photos/default-avatar.png',
          'active'
        ]
      );
      console.log('✅ Test mahasiswa created');
    }

    console.log('\n✨ Test users setup completed!\n');

    // Verify
    const users = await pool.query(
      "SELECT user_id, nama, role FROM users WHERE user_id IN ('admin001', 'dosen001', 'mahasiswa001')"
    );
    
    console.log('📋 Test users in database:');
    users.rows.forEach(u => {
      console.log(`   - ${u.user_id} (${u.role}): ${u.nama}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

setupTestUser();