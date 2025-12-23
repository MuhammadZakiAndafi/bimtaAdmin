// tests/setup/global-teardown.js
require('dotenv').config({ path: '.env.test' });
const DBHelper = require('../helpers/db-helper');

async function globalTeardown() {
  console.log('\n🧹 Cleaning up test environment...\n');

  const db = new DBHelper();

  try {
    // Clean up all test data
    console.log('🗑️  Removing test data...');
    await db.cleanupTestData();

    // Get final counts
    const finalCounts = await db.getCounts();
    console.log('📊 Final database state:', finalCounts);

    console.log('\n✅ Test environment cleanup completed!\n');

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    // Don't throw error to not fail the test suite
  } finally {
    await db.close();
  }
}

module.exports = globalTeardown;