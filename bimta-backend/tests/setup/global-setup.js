require('dotenv').config({ path: '.env.test' });
const DBHelper = require('../helpers/db-helper');
const bcrypt = require('bcryptjs');

async function globalSetup() {
  console.log('\n🚀 Setting up test environment...\n');

  const db = new DBHelper();

  try {
    // Check database connection
    const connection = await db.checkConnection();
    if (!connection.success) {
      throw new Error(`Database connection failed: ${connection.error}`);
    }
    console.log('✅ Database connected successfully');

    // Get initial counts
    const initialCounts = await db.getCounts();
    console.log('📊 Initial database state:', initialCounts);

    // Create test admin user if not exists
    const adminExists = await db.getUserById(process.env.TEST_ADMIN_ID || 'admin001');
    
    if (!adminExists) {
      console.log('👤 Creating test admin user...');
      const hashedPassword = await bcrypt.hash(
        process.env.TEST_ADMIN_PASSWORD || 'sandi123',
        12
      );

      await db.createTestUser({
        user_id: process.env.TEST_ADMIN_ID || 'admin001',
        nama: 'Test Admin',
        no_whatsapp: '081234567890',
        sandi: hashedPassword,
        role: 'admin',
        status_user: 'active',
      });
      console.log('✅ Test admin user created');
    } else {
      console.log('✅ Test admin user already exists');
    }

    // Create test dosen user if not exists
    const dosenExists = await db.getUserById('test_dosen_001');
    if (!dosenExists) {
      console.log('👤 Creating test dosen user...');
      const hashedPassword = await bcrypt.hash('Dosen123!', 12);

      await db.createTestUser({
        user_id: 'test_dosen_001',
        nama: 'Test Dosen',
        no_whatsapp: '081234567891',
        sandi: hashedPassword,
        role: 'dosen',
        status_user: 'active',
      });
      console.log('✅ Test dosen user created');
    }

    // Create test mahasiswa user if not exists
    const mahasiswaExists = await db.getUserById('test_mahasiswa_001');
    if (!mahasiswaExists) {
      console.log('👤 Creating test mahasiswa user...');
      const hashedPassword = await bcrypt.hash('Mahasiswa123!', 12);

      await db.createTestUser({
        user_id: 'test_mahasiswa_001',
        nama: 'Test Mahasiswa',
        no_whatsapp: '081234567892',
        sandi: hashedPassword,
        role: 'mahasiswa',
        status_user: 'active',
      });
      console.log('✅ Test mahasiswa user created');
    }

    // Clean up old test data
    console.log('🧹 Cleaning up old test data...');
    await db.cleanupTestData();
    console.log('✅ Cleanup completed');

    console.log('\n✨ Test environment setup completed!\n');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  } finally {
    await db.close();
  }
}

module.exports = globalSetup;