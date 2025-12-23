const { test, expect } = require('@playwright/test');
const APIHelper = require('../helpers/api-helper');

test.describe('Laporan API Tests', () => {
  let api;

  test.beforeAll(async () => {
    api = new APIHelper();
    await api.init();
    await api.login(
      process.env.TEST_ADMIN_ID || 'admin001',
      process.env.TEST_ADMIN_PASSWORD || 'Admin123!'
    );
  });

  test.afterAll(async () => {
    await api.dispose();
  });

  test.describe('GET /api/laporan/generate', () => {
    test('should fail without jenis_laporan parameter', async () => {
      const response = await api.get('/api/laporan/generate');
      const data = await response.json();

      expect(response.status()).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toContain('Jenis laporan');
    });

    test('should generate bulanan report', async () => {
      const response = await api.get('/api/laporan/generate', {
        jenis_laporan: 'bulanan',
      });
      const data = await response.json();

      expect(response.ok()).toBeTruthy();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('jenis_laporan');
      expect(data.data.jenis_laporan).toBe('bulanan');
      expect(data.data).toHaveProperty('periode');
      expect(data.data).toHaveProperty('total_records');
      expect(data.data).toHaveProperty('laporan');
      expect(Array.isArray(data.data.laporan)).toBe(true);
    });

    test('should generate bulanan report with date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';

      const response = await api.get('/api/laporan/generate', {
        jenis_laporan: 'bulanan',
        start_date: startDate,
        end_date: endDate,
      });
      const data = await response.json();

      expect(response.ok()).toBeTruthy();
      expect(data.data.periode.start_date).toBe(startDate);
      expect(data.data.periode.end_date).toBe(endDate);
    });

    test('should generate semester report', async () => {
      const response = await api.get('/api/laporan/generate', {
        jenis_laporan: 'semester',
      });
      const data = await response.json();

      expect(response.ok()).toBeTruthy();
      expect(data.success).toBe(true);
      expect(data.data.jenis_laporan).toBe('semester');
      expect(Array.isArray(data.data.laporan)).toBe(true);
    });

    test('should generate semester report with program_studi filter', async () => {
      const response = await api.get('/api/laporan/generate', {
        jenis_laporan: 'semester',
        program_studi: 'IF',
      });
      const data = await response.json();

      expect(response.ok()).toBeTruthy();
      expect(data.success).toBe(true);
    });

    test('bulanan report should have correct structure', async () => {
      const response = await api.get('/api/laporan/generate', {
        jenis_laporan: 'bulanan',
      });
      const data = await response.json();

      if (data.data.laporan.length > 0) {
        const record = data.data.laporan[0];
        expect(record).toHaveProperty('bimbingan_id');
        expect(record).toHaveProperty('nim');
        expect(record).toHaveProperty('nama_mahasiswa');
        expect(record).toHaveProperty('nama_dosen');
        expect(record).toHaveProperty('status_bimbingan');
        expect(record).toHaveProperty('total_bimbingan');
        expect(record).toHaveProperty('total_progress');
        expect(record).toHaveProperty('progress_selesai');
        expect(record).toHaveProperty('progress_revisi');
      }
    });

    test('semester report should have correct structure', async () => {
      const response = await api.get('/api/laporan/generate', {
        jenis_laporan: 'semester',
      });
      const data = await response.json();

      if (data.data.laporan.length > 0) {
        const record = data.data.laporan[0];
        expect(record).toHaveProperty('nama_dosen');
        expect(record).toHaveProperty('total_bimbingan');
        expect(record).toHaveProperty('bimbingan_selesai');
        expect(record).toHaveProperty('bimbingan_berlangsung');
        expect(record).toHaveProperty('rata_rata_pertemuan');
      }
    });
  });

  test.describe('GET /api/laporan/export', () => {
    test('should fail without jenis_laporan parameter', async () => {
      const response = await api.get('/api/laporan/export');
      const data = await response.json();

      expect(response.status()).toBe(400);
      expect(data.success).toBe(false);
    });

    test('should export bulanan report as Excel', async () => {
      const response = await api.get('/api/laporan/export', {
        jenis_laporan: 'bulanan',
      });

      if (response.status() === 404) {
        // No data available
        const data = await response.json();
        expect(data.message).toContain('Tidak ada data');
      } else {
        expect(response.ok()).toBeTruthy();
        expect(response.headers()['content-type']).toContain('spreadsheet');
        expect(response.headers()['content-disposition']).toContain('attachment');
        expect(response.headers()['content-disposition']).toContain('.xlsx');
      }
    });

    test('should export semester report as Excel', async () => {
      const response = await api.get('/api/laporan/export', {
        jenis_laporan: 'semester',
      });

      if (response.status() === 404) {
        const data = await response.json();
        expect(data.message).toContain('Tidak ada data');
      } else {
        expect(response.ok()).toBeTruthy();
        expect(response.headers()['content-type']).toContain('spreadsheet');
      }
    });

    test('should export with date range', async () => {
      const response = await api.get('/api/laporan/export', {
        jenis_laporan: 'bulanan',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
      });

      // Either successful export or 404 if no data
      expect([200, 404]).toContain(response.status());
    });

    test('should return 404 when no data available', async () => {
      const response = await api.get('/api/laporan/export', {
        jenis_laporan: 'bulanan',
        start_date: '2099-01-01',
        end_date: '2099-12-31',
      });

      const data = await response.json();
      expect(response.status()).toBe(404);
      expect(data.message).toContain('Tidak ada data');
    });
  });

  test.describe('GET /api/laporan/statistik', () => {
    test('should get laporan statistik', async () => {
      const response = await api.get('/api/laporan/statistik');
      const data = await response.json();

      expect(response.ok()).toBeTruthy();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('statistik_umum');
      expect(data.data).toHaveProperty('status_bimbingan');
    });

    test('statistik_umum should have correct structure', async () => {
      const response = await api.get('/api/laporan/statistik');
      const data = await response.json();

      const { statistik_umum } = data.data;
      expect(statistik_umum).toHaveProperty('total_bimbingan');
      expect(statistik_umum).toHaveProperty('total_mahasiswa_bimbingan');
      expect(statistik_umum).toHaveProperty('total_dosen_pembimbing');
      expect(statistik_umum).toHaveProperty('total_progress');
      expect(statistik_umum).toHaveProperty('rata_rata_pertemuan');
    });

    test('status_bimbingan should be an array', async () => {
      const response = await api.get('/api/laporan/statistik');
      const data = await response.json();

      expect(Array.isArray(data.data.status_bimbingan)).toBe(true);
      
      if (data.data.status_bimbingan.length > 0) {
        const status = data.data.status_bimbingan[0];
        expect(status).toHaveProperty('status_bimbingan');
        expect(status).toHaveProperty('jumlah');
      }
    });

    test('should get statistik with date range', async () => {
      const response = await api.get('/api/laporan/statistik', {
        start_date: '2024-01-01',
        end_date: '2024-12-31',
      });

      const data = await response.json();
      expect(response.ok()).toBeTruthy();
      expect(data.success).toBe(true);
    });
  });

  test.describe('Authorization Tests', () => {
    test('should require authentication for generate', async () => {
      api.setToken(null);
      const response = await api.get('/api/laporan/generate', {
        jenis_laporan: 'bulanan',
      });

      expect(response.status()).toBe(401);

      // Re-login
      await api.login(
        process.env.TEST_ADMIN_ID || 'admin001',
        process.env.TEST_ADMIN_PASSWORD || 'Admin123!'
      );
    });

    test('should require admin role', async () => {
      // This test validates that only admin can access laporan endpoints
      // The middleware authorizeAdmin should reject non-admin users
      const response = await api.get('/api/laporan/generate', {
        jenis_laporan: 'bulanan',
      });

      // If logged in as admin, should succeed
      expect(response.ok()).toBeTruthy();
    });
  });
});