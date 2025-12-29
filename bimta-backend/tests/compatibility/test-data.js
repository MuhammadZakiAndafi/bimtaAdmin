// tests/compatibility/test-data.js

module.exports = {
  // Test URL
  BASE_URL: 'https://bimta.suralayateknik.com',
  
  // Login credentials
  ADMIN: {
    user_id: 'admin001',
    password: 'sandi123'
  },

  // Browser configurations
  BROWSERS: {
    chrome: {
      name: 'Chrome',
      engine: 'chromium'
    },
    edge: {
      name: 'Edge',
      engine: 'chromium',
      channel: 'msedge'
    },
    firefox: {
      name: 'Firefox',
      engine: 'firefox'
    },
      Comet: {
      name: 'Comet',
      engine: 'chromium'
    },
    brave: {
      name: 'Brave',
      engine: 'chromium'
    },
    opera: {
      name: 'Opera',
      engine: 'chromium'
    },
    vivaldi: {
      name: 'Vivaldi',
      engine: 'chromium'
    },
    min: {
      name: 'Min',
      engine: 'chromium'
    }
  }
};