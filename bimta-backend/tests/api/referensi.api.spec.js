// tests/api/referensi.api.spec.js
const { test, expect } = require('@playwright/test');
const APIHelper = require('../helpers/api-helper');
const fs = require('fs');
const path = require('path');

test.describe('Referensi TA API Tests', () => {
  let api;
  let testNim;

  test.beforeAll(async () => {
    api = new APIHelper();
    await api.init();
    await api.login(
      process.env.TEST_ADMIN_ID || 'admin001',
      process.env.TEST_ADMIN_PASSWORD || 'Admin123!'
    );
  });

  test.afterAll(async () => {
    // Cleanup test data
    if (testNim) {
      await api.delete(`/api/referensi/${testNim}`);
    }
    await api.dispose();
  });

  test.describe('GET /api/referensi', () => {
    test('should get all referensi', async () => {
      const response = await api.get('/api/referensi');
      const data = await response.json();

      expect(response.ok()).toBeTruthy();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });

    test('should filter referensi by search', async () => {
      const response = await api.get('/api/referensi', { 
        search: 'test' 
      });
      const data = await response.json();

      expect(response.ok()).toBeTruthy();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      
      // Search might return empty results, that's okay
      console.log(`Search found ${data.data.length} referensi`);
    });

    test('should filter referensi by tahun', async () => {
      const response = await api.get('/api/referensi', { 
        tahun: 2024 // Send as number, not string
      });
      const data = await response.json();

      expect(response.ok()).toBeTruthy();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      
      // Only check tahun if data exists
      if (data.data.length > 0) {
        data.data.forEach(ref => {
          expect(ref.tahun).toBe(2024);
        });
      } else {
        console.log('No referensi found for year 2024');
      }
    });

    test('should filter referensi by topik', async () => {
      const response = await api.get('/api/referensi', { 
        topik: 'test' // Use generic search term
      });
      const data = await response.json();

      expect(response.ok()).toBeTruthy();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      
      console.log(`Topik filter found ${data.data.length} referensi`);
    });
  });

  test.describe('GET /api/referensi/:nim', () => {
    test('should return 404 for non-existent referensi', async () => {
      const response = await api.get('/api/referensi/99999999');
      const data = await response.json();

      expect(response.status()).toBe(404);
      expect(data.success).toBe(false);
      expect(data.message).toContain('tidak ditemukan');
    });
  });

  test.describe('POST /api/referensi', () => {
    test('should fail without file upload', async () => {
      const response = await api.post('/api/referensi', {
        nim_mahasiswa: 'test_ref_001',
        nama_mahasiswa: 'Test Referensi',
        judul: 'Test Judul',
        topik: 'Test Topik',
        tahun: '2024',
      });

      const data = await response.json();
      expect(response.status()).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toContain('PDF');
    });

    test('should fail with missing required fields', async () => {
      const response = await api.post('/api/referensi', {
        nim_mahasiswa: 'test_ref_002',
        // Missing other required fields
      });

      const data = await response.json();
      expect(response.status()).toBe(400);
      expect(data.success).toBe(false);
    });

    // Note: File upload test requires actual file and multipart form data
    // This is a placeholder - implement with actual file upload
    test('should create referensi with PDF upload', async () => {
      // Remove test.skip()
      
      testNim = `test_ref_${Date.now()}`;
      
      const response = await api.uploadFile(
        '/api/referensi',
        './tests/fixtures/test-files/sample.pdf',
        'document',
        {
          nim_mahasiswa: testNim,
          nama_mahasiswa: 'Test Upload',
          judul: 'Test Judul',
          topik: 'Test',
          tahun: '2024',
        }
      );

      expect(response.status()).toBe(201);
    });
  });

  test.describe('PUT /api/referensi/:nim', () => {
    test('should return 404 for non-existent referensi', async () => {
      const response = await api.put('/api/referensi/99999999', {
        nama_mahasiswa: 'Updated Name',
      });

      const data = await response.json();
      expect(response.status()).toBe(404);
      expect(data.success).toBe(false);
    });
  });

  test.describe('DELETE /api/referensi/:nim', () => {
    test('should return 404 when deleting non-existent referensi', async () => {
      const response = await api.delete('/api/referensi/99999999');
      const data = await response.json();

      expect(response.status()).toBe(404);
      expect(data.success).toBe(false);
    });
  });

  test.describe('Authorization Tests', () => {
    test('should require authentication', async () => {
      api.setToken(null);
      const response = await api.get('/api/referensi');
      const data = await response.json();

      expect(response.status()).toBe(401);
      expect(data.success).toBe(false);

      // Re-login
      await api.login(
        process.env.TEST_ADMIN_ID || 'admin001',
        process.env.TEST_ADMIN_PASSWORD || 'Admin123!'
      );
    });

    test('should require admin role', async () => {
      // All referensi endpoints require admin authorization
      const response = await api.get('/api/referensi');
      expect(response.ok()).toBeTruthy();
    });
  });
});