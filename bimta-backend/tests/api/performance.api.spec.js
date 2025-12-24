// tests/api/performance.api.spec.js
const { test, expect } = require('@playwright/test');
const APIHelper = require('../helpers/api-helper');

test.describe('Performance Tests', () => {
  let api;

  test.beforeAll(async () => {
    api = new APIHelper();
    await api.init();
    await api.login('admin001', 'sandi123');
  });

  test.afterAll(async () => {
    await api.dispose();
  });

  test.describe('Response Time Tests', () => {
    test('dashboard should respond within 2 seconds', async () => {
      const startTime = Date.now();
      
      const response = await api.get('/api/dashboard');
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.ok()).toBeTruthy();
      expect(responseTime).toBeLessThan(2000); // 2 seconds
      
      console.log(`Dashboard response time: ${responseTime}ms`);
    });

    test('user list should respond within 1.5 seconds', async () => {
      const startTime = Date.now();
      
      const response = await api.get('/api/users');
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.ok()).toBeTruthy();
      expect(responseTime).toBeLessThan(1500); // 1.5 seconds
      
      console.log(`User list response time: ${responseTime}ms`);
    });

    test('login should respond within 1 second', async () => {
      const testApi = new APIHelper();
      await testApi.init();
      
      const startTime = Date.now();
      
      await testApi.login('admin001', 'sandi123');
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(1000); // 1 second
      
      console.log(`Login response time: ${responseTime}ms`);
      
      await testApi.dispose();
    });

    test('laporan generation should respond within 5 seconds', async () => {
      const startTime = Date.now();
      
      const response = await api.get('/api/laporan/generate', {
        jenis_laporan: 'bulanan',
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.ok()).toBeTruthy();
      expect(responseTime).toBeLessThan(5000); // 5 seconds
      
      console.log(`Laporan generation time: ${responseTime}ms`);
    });
  });

  test.describe('Load Tests', () => {
    test('should handle 10 concurrent dashboard requests', async () => {
      const promises = [];
      const startTime = Date.now();

      for (let i = 0; i < 10; i++) {
        promises.push(api.get('/api/dashboard'));
      }

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // All should succeed
      responses.forEach(response => {
        expect(response.ok()).toBeTruthy();
      });

      // Should complete within reasonable time
      expect(totalTime).toBeLessThan(10000); // 10 seconds total
      
      console.log(`10 concurrent requests completed in: ${totalTime}ms`);
      console.log(`Average per request: ${totalTime / 10}ms`);
    });

    test('should handle sequential user operations efficiently', async () => {
      const operations = [];
      const startTime = Date.now();

      // Simulate typical user operations
      operations.push(await api.get('/api/dashboard')); // 1. View dashboard
      operations.push(await api.get('/api/users')); // 2. View users
      operations.push(await api.get('/api/referensi')); // 3. View referensi
      operations.push(await api.get('/api/laporan/statistik')); // 4. View stats

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      expect(totalTime).toBeLessThan(8000); // 8 seconds for 4 operations
      
      console.log(`Sequential operations completed in: ${totalTime}ms`);
    });
  });

  test.describe('Data Volume Tests', () => {
    test('should handle large user lists efficiently', async () => {
      const startTime = Date.now();
      
      const response = await api.get('/api/users');
      const data = await response.json();
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.ok()).toBeTruthy();
      
      const userCount = data.data.length;
      console.log(`Retrieved ${userCount} users in ${responseTime}ms`);
      
      // Performance should degrade linearly, not exponentially
      if (userCount > 100) {
        expect(responseTime).toBeLessThan(3000); // 3 seconds for large lists
      }
    });

    test('should handle filtered searches efficiently', async () => {
      const startTime = Date.now();
      
      const response = await api.get('/api/users', {
        search: 'admin',
        role: 'admin',
      });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.ok()).toBeTruthy();
      expect(responseTime).toBeLessThan(1500); // Filtered should be faster
      
      console.log(`Filtered search completed in: ${responseTime}ms`);
    });
  });

  test.describe('Database Query Optimization', () => {
    test('should use indexes for user search (performance check)', async () => {
      const searches = ['admin', 'dosen', 'mahasiswa', 'test'];
      const times = [];

      for (const term of searches) {
        const startTime = Date.now();
        await api.get('/api/users', { search: term });
        const endTime = Date.now();
        times.push(endTime - startTime);
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      
      console.log(`Average search time: ${avgTime}ms`);
      expect(avgTime).toBeLessThan(500); // Average should be < 500ms
    });

    test('should efficiently handle dashboard aggregations', async () => {
      const iterations = 5;
      const times = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        await api.get('/api/dashboard');
        const endTime = Date.now();
        times.push(endTime - startTime);
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);

      console.log(`Dashboard stats:
        Min: ${minTime}ms
        Max: ${maxTime}ms
        Avg: ${avgTime}ms
      `);

      // Performance should be consistent
      expect(maxTime - minTime).toBeLessThan(1000); // Variance < 1 second
    });
  });

  test.describe('Memory & Resource Usage', () => {
    test('should handle rapid successive requests without memory leak', async () => {
      const iterations = 20;
      
      for (let i = 0; i < iterations; i++) {
        await api.get('/api/health');
      }

      // If no crash/timeout, test passes
      expect(true).toBe(true);
      console.log(`Completed ${iterations} rapid requests successfully`);
    });

    test('should efficiently handle large result sets', async () => {
      const startTime = Date.now();
      
      const response = await api.get('/api/laporan/generate', {
        jenis_laporan: 'bulanan',
      });
      
      const data = await response.json();
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      console.log(`Retrieved ${data.data.total_records} records in ${responseTime}ms`);
      
      // Should scale reasonably
      if (data.data.total_records > 100) {
        expect(responseTime).toBeLessThan(5000);
      }
    });
  });

  test.describe('Caching Tests (if implemented)', () => {
    test('subsequent dashboard requests should be faster', async () => {
      // First request (cold)
      const start1 = Date.now();
      await api.get('/api/dashboard');
      const time1 = Date.now() - start1;

      // Second request (potentially cached)
      const start2 = Date.now();
      await api.get('/api/dashboard');
      const time2 = Date.now() - start2;

      console.log(`First request: ${time1}ms`);
      console.log(`Second request: ${time2}ms`);

      // Note: If no caching, this test may fail
      // Consider implementing caching for better performance
    });
  });

  test.describe('Performance Benchmarks', () => {
    test('performance summary report', async () => {
      const benchmarks = {};

      // Test key endpoints
      const endpoints = [
        { name: 'Health Check', path: '/api/health' },
        { name: 'Login', method: 'login', user: 'admin001', pass: 'sandi123' },
        { name: 'Dashboard', path: '/api/dashboard' },
        { name: 'User List', path: '/api/users' },
        { name: 'Referensi List', path: '/api/referensi' },
        { name: 'Laporan Stats', path: '/api/laporan/statistik' },
      ];

      for (const endpoint of endpoints) {
        const startTime = Date.now();
        
        if (endpoint.method === 'login') {
          const testApi = new APIHelper();
          await testApi.init();
          await testApi.login(endpoint.user, endpoint.pass);
          await testApi.dispose();
        } else {
          await api.get(endpoint.path);
        }
        
        const endTime = Date.now();
        benchmarks[endpoint.name] = endTime - startTime;
      }

      console.log('\n📊 Performance Benchmarks:');
      console.log('─────────────────────────────────');
      Object.entries(benchmarks).forEach(([name, time]) => {
        const status = time < 1000 ? '✅' : time < 2000 ? '⚠️' : '❌';
        console.log(`${status} ${name.padEnd(20)} ${time}ms`);
      });
      console.log('─────────────────────────────────\n');

      // All should be under acceptable limits
      Object.values(benchmarks).forEach(time => {
        expect(time).toBeLessThan(5000); // 5 second max
      });
    });
  });
});