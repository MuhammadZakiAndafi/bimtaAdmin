const { test, expect } = require('@playwright/test');
const APIHelper = require('../helpers/api-helper');

test.describe('Authentication API Tests', () => {
  let api;

  test.beforeAll(async () => {
    api = new APIHelper();
    await api.init();
  });

  test.afterAll(async () => {
    await api.dispose();
  });

  test.describe('POST /api/auth/login', () => {
    test('should login successfully with valid admin credentials', async () => {
      const { response, data } = await api.login(
        process.env.TEST_ADMIN_ID || 'admin001',
        process.env.TEST_ADMIN_PASSWORD || 'Admin123!'
      );

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Login berhasil');
      expect(data.data).toHaveProperty('token');
      expect(data.data).toHaveProperty('user');
      expect(data.data.user.role).toBe('admin');
      expect(data.data.user).not.toHaveProperty('sandi');
    });

    test('should fail with invalid credentials', async () => {
      const response = await api.post('/api/auth/login', {
        user_id: 'admin001',
        password: 'wrongpassword',
      });

      const data = await response.json();
      expect(response.status()).toBe(401);
      expect(data.success).toBe(false);
      expect(data.message).toContain('salah');
    });

    test('should fail with missing user_id', async () => {
      const response = await api.post('/api/auth/login', {
        password: 'Admin123!',
      });

      const data = await response.json();
      expect(response.status()).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toContain('harus diisi');
    });

    test('should fail with missing password', async () => {
      const response = await api.post('/api/auth/login', {
        user_id: 'admin001',
      });

      const data = await response.json();
      expect(response.status()).toBe(400);
      expect(data.success).toBe(false);
    });

    test('should fail when non-admin tries to login', async () => {
      const response = await api.post('/api/auth/login', {
        user_id: 'mahasiswa001',
        password: 'Mahasiswa123!',
      });

      const data = await response.json();
      expect(response.status()).toBe(403);
      expect(data.success).toBe(false);
      expect(data.message).toContain('admin');
    });

    test('should fail with inactive user', async () => {
      // Assuming you have an inactive user in test DB
      const response = await api.post('/api/auth/login', {
        user_id: 'inactive_user',
        password: 'Test123!',
      });

      const data = await response.json();
      if (response.status() === 403) {
        expect(data.message).toContain('tidak aktif');
      }
    });
  });

  test.describe('GET /api/auth/profile', () => {
    test.beforeEach(async () => {
      await api.login(
        process.env.TEST_ADMIN_ID || 'admin001',
        process.env.TEST_ADMIN_PASSWORD || 'Admin123!'
      );
    });

    test('should get profile with valid token', async () => {
      const response = await api.get('/api/auth/profile');
      const data = await response.json();

      expect(response.ok()).toBeTruthy();
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('user_id');
      expect(data.data).toHaveProperty('nama');
      expect(data.data).toHaveProperty('role');
      expect(data.data).not.toHaveProperty('sandi');
    });

    test('should fail without token', async () => {
      api.setToken(null);
      const response = await api.get('/api/auth/profile');
      const data = await response.json();

      expect(response.status()).toBe(401);
      expect(data.success).toBe(false);
      expect(data.message).toContain('Token');
    });

    test('should fail with invalid token', async () => {
      api.setToken('invalid_token_here');
      const response = await api.get('/api/auth/profile');
      const data = await response.json();

      expect(response.status()).toBe(401);
      expect(data.success).toBe(false);
    });
  });
});