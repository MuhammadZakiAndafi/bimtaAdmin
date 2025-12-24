const { test, expect } = require('@playwright/test');
const APIHelper = require('../helpers/api-helper');

test.describe('User Management API Tests', () => {
  let api;
  let testUserId;

  test.beforeAll(async () => {
    api = new APIHelper();
    await api.init();
    await api.login(
      process.env.TEST_ADMIN_ID || 'admin001',
      process.env.TEST_ADMIN_PASSWORD || 'sandi123'
    );
  });

  test.afterAll(async () => {
    // Cleanup: Delete test user if created
    if (testUserId) {
      await api.delete(`/api/users/${testUserId}`);
    }
    await api.dispose();
  });

  test.describe('GET /api/users', () => {
    test('should get all users', async () => {
      const response = await api.get('/api/users');
      const data = await response.json();

      expect(response.ok()).toBeTruthy();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      
      if (data.data.length > 0) {
        expect(data.data[0]).toHaveProperty('user_id');
        expect(data.data[0]).toHaveProperty('nama');
        expect(data.data[0]).not.toHaveProperty('sandi');
      }
    });

    test('should filter users by role=mahasiswa', async () => {
      const response = await api.get('/api/users', { role: 'mahasiswa' });
      const data = await response.json();

      expect(response.ok()).toBeTruthy();
      expect(data.success).toBe(true);
      
      if (data.data.length > 0) {
        data.data.forEach(user => {
          expect(user.role).toBe('mahasiswa');
        });
      }
    });

    test('should filter users by role=dosen', async () => {
      const response = await api.get('/api/users', { role: 'dosen' });
      const data = await response.json();

      expect(response.ok()).toBeTruthy();
      
      if (data.data.length > 0) {
        data.data.forEach(user => {
          expect(user.role).toBe('dosen');
        });
      }
    });

    test('should search users by name', async () => {
      const response = await api.get('/api/users', { search: 'admin' });
      const data = await response.json();

      expect(response.ok()).toBeTruthy();
      expect(data.success).toBe(true);
    });

    test('should filter by status', async () => {
      const response = await api.get('/api/users', { status: 'active' });
      const data = await response.json();

      expect(response.ok()).toBeTruthy();
      
      if (data.data.length > 0) {
        data.data.forEach(user => {
          expect(user.status_user).toBe('active');
        });
      }
    });
  });

  test.describe('POST /api/users', () => {
    test('should create new mahasiswa user', async () => {
      testUserId = `test_mhs_${Date.now()}`;
      
      const response = await api.post('/api/users', {
        user_id: testUserId,
        nama: 'Test Mahasiswa',
        no_whatsapp: '081234567890',
        role: 'mahasiswa',
        password: 'Test123!',
      });

      const data = await response.json();

      expect(response.status()).toBe(201);
      expect(data.success).toBe(true);
      expect(data.message).toContain('berhasil');
      expect(data.data.user_id).toBe(testUserId);
      expect(data.data).not.toHaveProperty('sandi');
    });

    test('should fail to create user with existing user_id', async () => {
      const response = await api.post('/api/users', {
        user_id: 'admin001', // Assuming this exists
        nama: 'Duplicate User',
        no_whatsapp: '081234567890',
        role: 'mahasiswa',
        password: 'Test123!',
      });

      const data = await response.json();

      expect(response.status()).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toContain('sudah digunakan');
    });

    test('should fail with missing required fields', async () => {
      const response = await api.post('/api/users', {
        user_id: 'test_incomplete',
        nama: 'Test User',
        // Missing required fields
      });

      const data = await response.json();

      expect(response.status()).toBe(400);
      expect(data.success).toBe(false);
    });

    test('should fail with invalid role', async () => {
      const response = await api.post('/api/users', {
        user_id: 'test_invalid_role',
        nama: 'Test User',
        no_whatsapp: '081234567890',
        role: 'invalid_role',
        password: 'Test123!',
      });

      const data = await response.json();

      expect(response.status()).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  test.describe('GET /api/users/:userId', () => {
    test('should get user by id', async () => {
      const response = await api.get('/api/users/admin001');
      const data = await response.json();

      expect(response.ok()).toBeTruthy();
      expect(data.success).toBe(true);
      expect(data.data.user_id).toBe('admin001');
      expect(data.data).not.toHaveProperty('sandi');
    });

    test('should return 404 for non-existent user', async () => {
      const response = await api.get('/api/users/nonexistent_user_id');
      const data = await response.json();

      expect(response.status()).toBe(404);
      expect(data.success).toBe(false);
    });
  });

  test.describe('PUT /api/users/:userId', () => {
    let updateTestUserId;

    test.beforeAll(async () => {
      updateTestUserId = `test_update_${Date.now()}`;
      await api.post('/api/users', {
        user_id: updateTestUserId,
        nama: 'User To Update',
        no_whatsapp: '081234567890',
        role: 'mahasiswa',
        password: 'Test123!',
      });
    });

    test.afterAll(async () => {
      await api.delete(`/api/users/${updateTestUserId}`);
    });

    test('should update user information', async () => {
      const response = await api.put(`/api/users/${updateTestUserId}`, {
        nama: 'Updated Name',
        no_whatsapp: '089876543210',
      });

      const data = await response.json();

      expect(response.ok()).toBeTruthy();
      expect(data.success).toBe(true);
      expect(data.data.nama).toBe('Updated Name');
      expect(data.data.no_whatsapp).toBe('089876543210');
    });

    test('should update user status', async () => {
      const response = await api.put(`/api/users/${updateTestUserId}`, {
        status_user: 'inactive',
      });

      const data = await response.json();

      expect(response.ok()).toBeTruthy();
      expect(data.data.status_user).toBe('inactive');
    });
  });

  test.describe('PATCH /api/users/:userId/reset-password', () => {
    test('should reset user password', async () => {
      const response = await api.patch(`/api/users/${testUserId}/reset-password`, {
        new_password: 'NewPassword123!',
      });

      const data = await response.json();

      expect(response.ok()).toBeTruthy();
      expect(data.success).toBe(true);
      expect(data.message).toContain('berhasil');
    });

    test('should fail without new_password', async () => {
      const response = await api.patch(`/api/users/${testUserId}/reset-password`, {});

      const data = await response.json();

      expect(response.status()).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  test.describe('DELETE /api/users/:userId', () => {
    test('should delete user', async () => {
      const deleteTestId = `test_delete_${Date.now()}`;
      
      // Create user to delete
      await api.post('/api/users', {
        user_id: deleteTestId,
        nama: 'User To Delete',
        no_whatsapp: '081234567890',
        role: 'mahasiswa',
        password: 'Test123!',
      });

      // Delete user
      const response = await api.delete(`/api/users/${deleteTestId}`);
      const data = await response.json();

      expect(response.ok()).toBeTruthy();
      expect(data.success).toBe(true);
      expect(data.message).toContain('berhasil dihapus');

      // Verify user is deleted
      const getResponse = await api.get(`/api/users/${deleteTestId}`);
      expect(getResponse.status()).toBe(404);
    });

    test('should return 404 when deleting non-existent user', async () => {
      const response = await api.delete('/api/users/nonexistent_user');
      const data = await response.json();

      expect(response.status()).toBe(404);
      expect(data.success).toBe(false);
    });
  });

  test.describe('Authorization Tests', () => {
    test('should require authentication', async () => {
      api.setToken(null);
      const response = await api.get('/api/users');
      const data = await response.json();

      expect(response.status()).toBe(401);
      expect(data.success).toBe(false);

      // Re-login for other tests
      await api.login(
        process.env.TEST_ADMIN_ID || 'admin001',
        process.env.TEST_ADMIN_PASSWORD || 'sandi123'
      );
    });
  });
});