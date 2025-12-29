// tests/helpers/global-teardown.js
const { cleanupTestFiles } = require('./test-helpers');

async function globalTeardown() {
  console.log('\n🧹 Starting Global Teardown...\n');
  
  try {
    // 1. Clean up test files
    console.log('📁 Cleaning up test files...');
    cleanupTestFiles();
    console.log('✅ Test files cleaned\n');
    
    // 2. Clean up test database
    console.log('📊 Cleaning up test database...');
    await cleanupTestDatabase();
    console.log('✅ Test database cleaned\n');
    
    console.log('✅ Global Teardown Complete!\n');
  } catch (error) {
    console.error('❌ Global Teardown Failed:', error.message);
    // Don't throw error in teardown to allow test results to be saved
  }
}

/**
 * Clean up test database
 */
async function cleanupTestDatabase() {
  try {
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
    
    console.log('  ✅ Test data removed');
    
  } catch (error) {
    console.error('  ⚠️  Database cleanup warning:', error.message);
  }
}

module.exports = globalTeardown;