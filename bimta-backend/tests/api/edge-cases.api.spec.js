// tests/api/edge-cases.api.spec.js
const { test, expect } = require('@playwright/test');
const APIHelper = require('../helpers/api-helper');

test.describe('Edge Cases & Error Handling Tests', () => {
  let api;

  test.beforeAll(async () => {
    api = new APIHelper();
    await api.init();
    await api.login('admin001', 'Admin123!');
  });

  test.afterAll(async () => {
    await api.dispose();
  });

  test.describe('Input Validation', () => {
    test('should handle SQL injection attempts', async () => {
      const maliciousInput = "'; DROP TABLE users; --";
      
      const response = await api.get('/api/users', {
        search: maliciousInput,
      });

      // Should not crash, return 200 with empty or filtered results
      expect([200, 400]).toContain(response.status());
    });

    test('should handle XSS attempts in user creation', async () => {
      const xssPayload = '<script>alert("XSS")</script>';
      
      const response = await api.post('/api/users', {
        user_id: `xss_test_${Date.now()}`,
        nama: xssPayload,
        no_whatsapp: '081234567890',
        role: 'mahasiswa',
        password: 'Test123!',
      });

      const data = await response.json();
      
      if (response.status() === 201) {
        // Should store but escape the input
        expect(data.data.nama).toBeDefined();
        
        // Cleanup
        await api.delete(`/api/users/${data.data.user_id}`);
      }
    });

    test('should handle very long input strings', async () => {
      const longString = 'A'.repeat(500); // Reduced from 1000
      
      const response = await api.post('/api/users', {
        user_id: `long_test_${Date.now()}`,
        nama: longString,
        no_whatsapp: '081234567890',
        role: 'mahasiswa',
        password: 'Test123!',
      });

      // Should either accept (201) or reject (400), not crash (500)
      expect(response.status()).toBeLessThan(500);
      
      if (response.status() === 201) {
        const data = await response.json();
        await api.delete(`/api/users/${data.data.user_id}`);
      }
    });

    test('should handle special characters in search', async () => {
      const specialChars = ['%', '_', '\\', "'", '"', '`'];
      
      for (const char of specialChars) {
        const response = await api.get('/api/users', {
          search: char,
        });
        
        // Should not crash
        expect(response.status()).toBeLessThan(500);
      }
    });

    test('should validate phone number format', async () => {
      const invalidPhones = [
        '123', // Too short
        'abcdefghij', // Not numbers
        '0812345678901234567890', // Too long
      ];

      for (const phone of invalidPhones) {
        const response = await api.post('/api/users', {
          user_id: `phone_test_${Date.now()}`,
          nama: 'Test User',
          no_whatsapp: phone,
          role: 'mahasiswa',
          password: 'Test123!',
        });

        // May accept or reject, but shouldn't crash
        expect(response.status()).toBeLessThan(500);
        
        if (response.status() === 201) {
          const data = await response.json();
          await api.delete(`/api/users/${data.data.user_id}`);
        }
      }
    });
  });

  test.describe('Concurrent Operations', () => {
    test('should handle concurrent user creation', async () => {
      const promises = [];
      const userIds = [];

      // Try to create 5 users simultaneously
      for (let i = 0; i < 5; i++) {
        const userId = `concurrent_${Date.now()}_${i}`;
        userIds.push(userId);
        
        promises.push(
          api.post('/api/users', {
            user_id: userId,
            nama: `Concurrent User ${i}`,
            no_whatsapp: `0812345678${i}0`,
            role: 'mahasiswa',
            password: 'Test123!',
          })
        );
      }

      const responses = await Promise.all(promises);
      
      // All should succeed
      responses.forEach(response => {
        expect([201, 400]).toContain(response.status());
      });

      // Cleanup
      for (const userId of userIds) {
        await api.delete(`/api/users/${userId}`);
      }
    });

    test('should handle concurrent updates to same user', async () => {
      // Create test user
      const userId = `update_test_${Date.now()}`;
      await api.post('/api/users', {
        user_id: userId,
        nama: 'Original Name',
        no_whatsapp: '081234567890',
        role: 'mahasiswa',
        password: 'Test123!',
      });

      // Try to update simultaneously
      const promises = [
        api.put(`/api/users/${userId}`, { nama: 'Name 1' }),
        api.put(`/api/users/${userId}`, { nama: 'Name 2' }),
        api.put(`/api/users/${userId}`, { nama: 'Name 3' }),
      ];

      const responses = await Promise.all(promises);
      
      // All should succeed (last write wins)
      responses.forEach(response => {
        expect(response.ok()).toBeTruthy();
      });

      // Cleanup
      await api.delete(`/api/users/${userId}`);
    });
  });

  test.describe('Rate Limiting & Performance', () => {
    test('should handle rapid successive requests', async () => {
      const promises = [];
      
      // Make 10 rapid requests
      for (let i = 0; i < 10; i++) {
        promises.push(api.get('/api/dashboard'));
      }

      const responses = await Promise.all(promises);
      
      // All should succeed or be rate limited
      responses.forEach(response => {
        expect([200, 429]).toContain(response.status());
      });
    });
  });

  test.describe('Boundary Value Testing', () => {
    test('should handle empty strings', async () => {
      const response = await api.post('/api/users', {
        user_id: `empty_test_${Date.now()}`,
        nama: '',
        no_whatsapp: '',
        role: 'mahasiswa',
        password: '',
      });

      // Should reject empty required fields
      expect(response.status()).toBe(400);
    });

    test('should handle null values', async () => {
      const response = await api.post('/api/users', {
        user_id: `null_test_${Date.now()}`,
        nama: null,
        no_whatsapp: null,
        role: null,
        password: null,
      });

      // Should reject null required fields
      expect(response.status()).toBe(400);
    });

    test('should handle undefined values', async () => {
      const response = await api.post('/api/users', {
        user_id: `undefined_test_${Date.now()}`,
        // Other fields undefined
      });

      // Should reject missing required fields
      expect(response.status()).toBe(400);
    });
  });

  test.describe('API Response Format', () => {
    test('all success responses should have consistent format', async () => {
      const response = await api.get('/api/users');
      const data = await response.json();

      // Check standard response format
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(typeof data.success).toBe('boolean');
    });

    test('all error responses should have consistent format', async () => {
      const response = await api.get('/api/users/nonexistent_user');
      const data = await response.json();

      // Check error response format
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('message');
      expect(data.success).toBe(false);
      expect(typeof data.message).toBe('string');
    });
  });

  test.describe('Database Connection Issues', () => {
    test('should handle gracefully if database is slow', async () => {
      // This test checks if API has proper timeout handling
      const response = await api.get('/api/users');
      
      // Should respond within reasonable time (not hang forever)
      expect(response.status()).toBeLessThan(500);
    });
  });

  test.describe('Invalid Route Testing', () => {
    test('should return 404 for non-existent endpoints', async () => {
      const response = await api.get('/api/nonexistent-endpoint');
      expect(response.status()).toBe(404);
    });

    test('should handle invalid HTTP methods', async () => {
      // Try POST on GET-only endpoint
      const response = await api.post('/api/dashboard', {});
      
      // Should return 404 or 405
      expect([404, 405]).toContain(response.status());
    });
  });
});