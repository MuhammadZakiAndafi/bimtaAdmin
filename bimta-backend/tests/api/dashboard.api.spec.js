const { test, expect } = require('@playwright/test');
const APIHelper = require('../helpers/api-helper');

test.describe('Dashboard API Tests', () => {
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

  test.describe('GET /api/dashboard', () => {
    test('should get dashboard data with valid token', async () => {
      const response = await api.get('/api/dashboard');
      const data = await response.json();

      expect(response.ok()).toBeTruthy();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('statistics');
      expect(data.data).toHaveProperty('quickActions');
      expect(data.data).toHaveProperty('recentActivities');
      expect(data.data).toHaveProperty('systemWarnings');
    });

    test('should have correct statistics structure', async () => {
      const response = await api.get('/api/dashboard');
      const data = await response.json();

      const { statistics } = data.data;

      expect(statistics).toHaveProperty('totalMahasiswa');
      expect(statistics).toHaveProperty('totalDosen');
      expect(statistics).toHaveProperty('totalReferensi');
      expect(statistics).toHaveProperty('totalBimbingan');
      
      expect(typeof statistics.totalMahasiswa).toBe('number');
      expect(typeof statistics.totalDosen).toBe('number');
      expect(typeof statistics.totalReferensi).toBe('number');

      expect(statistics.totalBimbingan).toHaveProperty('ongoing');
      expect(statistics.totalBimbingan).toHaveProperty('done');
      expect(statistics.totalBimbingan).toHaveProperty('warning');
      expect(statistics.totalBimbingan).toHaveProperty('terminated');
    });

    test('should have quick actions array', async () => {
      const response = await api.get('/api/dashboard');
      const data = await response.json();

      expect(Array.isArray(data.data.quickActions)).toBe(true);
      
      if (data.data.quickActions.length > 0) {
        const action = data.data.quickActions[0];
        expect(action).toHaveProperty('title');
        expect(action).toHaveProperty('description');
        expect(action).toHaveProperty('link');
      }
    });

    test('should have recent activities array', async () => {
      const response = await api.get('/api/dashboard');
      const data = await response.json();

      expect(Array.isArray(data.data.recentActivities)).toBe(true);
      
      if (data.data.recentActivities.length > 0) {
        const activity = data.data.recentActivities[0];
        expect(activity).toHaveProperty('datetime');
        expect(activity).toHaveProperty('activity');
        expect(activity).toHaveProperty('mahasiswa_nama');
        expect(activity).toHaveProperty('dosen_nama');
      }
    });

    test('should have system warnings array', async () => {
      const response = await api.get('/api/dashboard');
      const data = await response.json();

      expect(Array.isArray(data.data.systemWarnings)).toBe(true);
      
      if (data.data.systemWarnings.length > 0) {
        const warning = data.data.systemWarnings[0];
        expect(warning).toHaveProperty('message');
        expect(warning).toHaveProperty('type');
        expect(warning).toHaveProperty('time');
      }
    });

    test('should fail without authentication', async () => {
      api.setToken(null);
      const response = await api.get('/api/dashboard');
      const data = await response.json();

      expect(response.status()).toBe(401);
      expect(data.success).toBe(false);

      // Re-login for other tests
      await api.login(
        process.env.TEST_ADMIN_ID || 'admin001',
        process.env.TEST_ADMIN_PASSWORD || 'Admin123!'
      );
    });

    test('should fail with non-admin user', async () => {
      // This test assumes you have a non-admin test user
      // You might need to create one or adjust this test
      const mahasiswaApi = new APIHelper();
      await mahasiswaApi.init();
      
      // Try to login with non-admin user (this should fail based on authController)
      const loginResponse = await mahasiswaApi.post('/api/auth/login', {
        user_id: 'mahasiswa001',
        password: 'Test123!',
      });

      // If login succeeds (which shouldn't for web according to authController)
      if (loginResponse.ok()) {
        const response = await mahasiswaApi.get('/api/dashboard');
        const data = await response.json();
        
        expect(response.status()).toBe(403);
        expect(data.success).toBe(false);
      }

      await mahasiswaApi.dispose();
    });
  });

  test.describe('Dashboard Data Validation', () => {
    test('statistics should have non-negative numbers', async () => {
      const response = await api.get('/api/dashboard');
      const data = await response.json();

      const { statistics } = data.data;

      expect(statistics.totalMahasiswa).toBeGreaterThanOrEqual(0);
      expect(statistics.totalDosen).toBeGreaterThanOrEqual(0);
      expect(statistics.totalReferensi).toBeGreaterThanOrEqual(0);
      expect(statistics.totalBimbingan.ongoing).toBeGreaterThanOrEqual(0);
      expect(statistics.totalBimbingan.done).toBeGreaterThanOrEqual(0);
      expect(statistics.totalBimbingan.warning).toBeGreaterThanOrEqual(0);
      expect(statistics.totalBimbingan.terminated).toBeGreaterThanOrEqual(0);
    });

    test('recent activities should be limited', async () => {
      const response = await api.get('/api/dashboard');
      const data = await response.json();

      // Based on the controller, limit is 5
      expect(data.data.recentActivities.length).toBeLessThanOrEqual(5);
    });

    test('quick actions should have valid links', async () => {
      const response = await api.get('/api/dashboard');
      const data = await response.json();

      data.data.quickActions.forEach(action => {
        expect(action.link).toMatch(/^\//); // Should start with /
      });
    });
  });
});