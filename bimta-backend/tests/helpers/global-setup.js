// tests/helpers/global-setup.js
const axios = require('axios');
const { createTestPDF } = require('./test-helpers');

async function globalSetup() {
  console.log('\n🔧 Starting Global Setup...\n');
  
  try {
    // 1. Wait for backend to be ready
    console.log('⏳ Waiting for backend server...');
    await waitForServer('http://localhost:5000/api/health', 30000);
    console.log('✅ Backend server is ready\n');
    
    // 2. Wait for frontend to be ready
    console.log('⏳ Waiting for frontend server...');
    await waitForServer('http://localhost:3000', 30000);
    console.log('✅ Frontend server is ready\n');
    
    // 3. Setup test database
    console.log('📊 Setting up test database...');
    await setupTestDatabase();
    console.log('✅ Test database ready\n');
    
    // 4. Create test files
    console.log('📁 Creating test files...');
    createTestPDF();
    console.log('✅ Test files created\n');
    
    console.log('✅ Global Setup Complete!\n');
  } catch (error) {
    console.error('❌ Global Setup Failed:', error.message);
    throw error;
  }
}

/**
 * Wait for server to be ready
 */
async function waitForServer(url, timeout = 30000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      await axios.get(url, { timeout: 5000 });
      return true;
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  throw new Error(`Server at ${url} did not become ready within ${timeout}ms`);
}

/**
 * Setup test database with initial data
 */
async function setupTestDatabase() {
  try {
    const API_BASE = 'http://localhost:5000/api';
    
    // Create admin user if not exists
    const adminData = {
      user_id: 'admin001',
      nama: 'Admin BIMTA',
      no_whatsapp: '081234567890',
      password: 'sandi123',
      role: 'admin'
    };
    
    // Check if admin exists by trying to login
    try {
      await axios.post(`${API_BASE}/auth/login`, {
        user_id: adminData.user_id,
        password: adminData.password
      });
      console.log('  ℹ️  Admin user already exists');
    } catch (error) {
      // Admin doesn't exist, create it
      // Note: You might need to create this endpoint or use direct DB insert
      console.log('  ℹ️  Admin user will be created through SQL');
      
      // Alternative: Use direct database connection
      const pool = require('../../src/config/database');
      const bcrypt = require('bcryptjs');
      
      const hashedPassword = await bcrypt.hash(adminData.password, 12);
      
      await pool.query(`
        INSERT INTO users (user_id, nama, no_whatsapp, sandi, role, status_user, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        ON CONFLICT (user_id) DO NOTHING
      `, [
        adminData.user_id,
        adminData.nama,
        adminData.no_whatsapp,
        hashedPassword,
        'admin',
        'active'
      ]);
      
      console.log('  ✅ Admin user created');
    }
    
    // Clean up any existing test data
    const pool = require('../../src/config/database');
    
    // Delete test users (mahasiswa & dosen)
    await pool.query(`
      DELETE FROM users 
      WHERE user_id LIKE 'M2025%' OR user_id LIKE 'D2025%' OR user_id LIKE 'R2025%'
    `);
    
    // Delete test referensi
    await pool.query(`
      DELETE FROM referensi_ta 
      WHERE nim_mahasiswa LIKE 'R2025%'
    `);
    
    console.log('  ✅ Test data cleaned up');
    
  } catch (error) {
    console.error('  ❌ Database setup failed:', error.message);
    throw error;
  }
}

module.exports = globalSetup;