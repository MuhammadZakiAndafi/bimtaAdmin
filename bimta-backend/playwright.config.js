const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/e2e',
  
  // REDUCED timeouts for speed
  timeout: 30000,      
  expect: {
    timeout: 5000      
  },

  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,          
  workers: 1,
  
  // Minimal reporter
  reporter: [
    ['list'],
    ['html', { outputFolder: 'e2e-report', open: 'never' }]
  ],

  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    
    // ALL DISABLED for maximum speed
    screenshot: 'off',
    video: 'off',
    trace: 'off',
    
    viewport: { width: 1280, height: 720 },  
    ignoreHTTPSErrors: true,
    
    // AGGRESSIVE timeouts
    actionTimeout: 8000,        
    navigationTimeout: 15000,  
  },

  projects: [
    {
      name: 'e2e',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-blink-features=AutomationControlled'
          ]
        }
      },
    },
  ],

  globalSetup: require.resolve('./tests/helpers/global-setup.js'),
  globalTeardown: require.resolve('./tests/helpers/global-teardown.js'),
});