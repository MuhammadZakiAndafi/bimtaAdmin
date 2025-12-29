const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/compatibility',
  
  timeout: 120000, 
  expect: {
    timeout: 10000  
  },
  
  fullyParallel: false,
  workers: 1,
  
  retries: 0, 
  
  reporter: [
    ['html', { 
      outputFolder: 'compatibility-report',
      open: 'never' 
    }],
    ['list'] 
  ],

  use: {
    baseURL: 'https://bimta.suralayateknik.com',
    video: 'on',
    trace: 'on',
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: 'chrome',
      use: { 
        ...devices['Desktop Chrome'],
      },
    },

    {
      name: 'edge',
      use: { 
        ...devices['Desktop Edge'],
        channel: 'msedge',
      },
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
      },
    },
    

    {
      name: 'Comet',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },

    {
      name: 'brave',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },

    {
      name: 'opera',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },

    {
      name: 'vivaldi',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },

    {
      name: 'min',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
  ],
});