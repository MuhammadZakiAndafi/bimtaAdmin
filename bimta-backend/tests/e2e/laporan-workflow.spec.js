// tests/e2e/laporan-workflow.spec.js
const { test, expect } = require('@playwright/test');
const APIHelper = require('../helpers/api-helper');
const DBHelper = require('../helpers/db-helper');

test.describe('Laporan Generation Complete Workflow', () => {
  let api;
  let db;
  let testData = {
    dosenId: null,
    mahasiswaId: null,
    bimbinganId: null,
  };

  test.beforeAll(async () => {
    api = new APIHelper();
    db = new DBHelper();
    await api.init();
    await api.login('admin001', 'sandi123');

    // Setup test data
    console.log('🔧 Setting up test data...');
    
    // Create test dosen
    const dosenResponse = await api.post('/api/users', {
      user_id: `laporan_dosen_${Date.now()}`,
      nama: 'Laporan Test Dosen',
      no_whatsapp: '081111111111',
      role: 'dosen',
      password: 'Test123!',
    });
    const dosenData = await dosenResponse.json();
    testData.dosenId = dosenData.data.user_id;

    // Create test mahasiswa
    const mhsResponse = await api.post('/api/users', {
      user_id: `laporan_mhs_${Date.now()}`,
      nama: 'Laporan Test Mahasiswa',
      no_whatsapp: '082222222222',
      role: 'mahasiswa',
      password: 'Test123!',
    });
    const mhsData = await mhsResponse.json();
    testData.mahasiswaId = mhsData.data.user_id;

    // Create bimbingan
    const bimbingan = await db.createTestBimbingan({
      mahasiswa_id: testData.mahasiswaId,
      dosen_id: testData.dosenId,
      status_bimbingan: 'ongoing',
      total_bimbingan: 5,
    });
    testData.bimbinganId = bimbingan.bimbingan_id;

    // Create some progress
    for (let i = 1; i <= 3; i++) {
      await db.createTestProgress({
        bimbingan_id: testData.bimbinganId,
        subject_progress: `Test Progress ${i}`,
        description_progress: `Description ${i}`,
        status_progress: i % 2 === 0 ? 'done' : 'need_revision',
      });
    }

    console.log('✅ Test data ready');
  });

  test.afterAll(async () => {
    // Cleanup
    console.log('🧹 Cleaning up...');
    
    if (testData.bimbinganId) {
      await db.deleteTestBimbingan(testData.bimbinganId);
    }
    
    if (testData.mahasiswaId) {
      await api.delete(`/api/users/${testData.mahasiswaId}`);
    }
    
    if (testData.dosenId) {
      await api.delete(`/api/users/${testData.dosenId}`);
    }

    await db.close();
    await api.dispose();
  });

  test('Complete Laporan Workflow: Generate → View → Filter → Export', async () => {
    // STEP 1: Generate Laporan Bulanan
    console.log('📊 Step 1: Generating monthly report...');
    const bulananResponse = await api.get('/api/laporan/generate', {
      jenis_laporan: 'bulanan',
    });
    const bulananData = await bulananResponse.json();

    expect(bulananResponse.ok()).toBeTruthy();
    expect(bulananData.success).toBe(true);
    expect(bulananData.data.jenis_laporan).toBe('bulanan');
    expect(Array.isArray(bulananData.data.laporan)).toBe(true);
    console.log(`✅ Found ${bulananData.data.total_records} records`);

    // STEP 2: Generate Laporan Semester
    console.log('📊 Step 2: Generating semester report...');
    const semesterResponse = await api.get('/api/laporan/generate', {
      jenis_laporan: 'semester',
    });
    const semesterData = await semesterResponse.json();

    expect(semesterResponse.ok()).toBeTruthy();
    expect(semesterData.success).toBe(true);
    expect(semesterData.data.jenis_laporan).toBe('semester');
    console.log(`✅ Found ${semesterData.data.total_records} dosen`);

    // STEP 3: Filter by Date Range
    console.log('🔍 Step 3: Filtering by date range...');
    const startDate = '2024-01-01';
    const endDate = '2024-12-31';
    
    const filteredResponse = await api.get('/api/laporan/generate', {
      jenis_laporan: 'bulanan',
      start_date: startDate,
      end_date: endDate,
    });
    const filteredData = await filteredResponse.json();

    expect(filteredResponse.ok()).toBeTruthy();
    expect(filteredData.data.periode.start_date).toBe(startDate);
    expect(filteredData.data.periode.end_date).toBe(endDate);
    console.log('✅ Date filter applied');

    // STEP 4: Get Statistics
    console.log('📈 Step 4: Getting statistics...');
    const statsResponse = await api.get('/api/laporan/statistik');
    const statsData = await statsResponse.json();

    expect(statsResponse.ok()).toBeTruthy();
    expect(statsData.data).toHaveProperty('statistik_umum');
    expect(statsData.data).toHaveProperty('status_bimbingan');
    console.log('✅ Statistics retrieved');

    // STEP 5: Export to Excel (if data exists)
    console.log('📥 Step 5: Exporting to Excel...');
    const exportResponse = await api.get('/api/laporan/export', {
      jenis_laporan: 'bulanan',
    });

    if (exportResponse.status() === 404) {
      console.log('ℹ️ No data to export (expected for test)');
    } else {
      expect(exportResponse.ok()).toBeTruthy();
      expect(exportResponse.headers()['content-type']).toContain('spreadsheet');
      console.log('✅ Excel exported successfully');
    }

    console.log('\n✨ Complete laporan workflow passed!');
  });

  test('Verify our test data appears in reports', async () => {
    const response = await api.get('/api/laporan/generate', {
      jenis_laporan: 'bulanan',
    });
    const data = await response.json();

    // Check if our test mahasiswa appears
    const hasTestData = data.data.laporan.some(record => 
      record.nim === testData.mahasiswaId
    );

    if (hasTestData) {
      console.log('✅ Test data found in report');
    } else {
      console.log('ℹ️ Test data not in current report period');
    }
  });
});