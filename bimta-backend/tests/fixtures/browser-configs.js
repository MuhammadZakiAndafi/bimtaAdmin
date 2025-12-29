const BROWSER_CONFIGS = {
  chrome: {
    name: 'Chrome',
    channel: 'chrome',
    required: true,
    priority: 'high',
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    features: ['modern-css', 'modern-js', 'webgl', 'service-worker']
  },

  safari: {
    name: 'Safari',
    channel: 'webkit',
    required: true,
    priority: 'high',
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    features: ['webkit-specific', 'safari-storage']
  },

  edge: {
    name: 'Edge',
    channel: 'msedge',
    required: true,
    priority: 'high',
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    features: ['chromium-based', 'edge-specific']
  },

  firefox: {
    name: 'Firefox',
    channel: 'firefox',
    required: true,
    priority: 'high',
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    features: ['gecko-engine', 'firefox-storage']
  },

  brave: {
    name: 'Brave',
    channel: 'chrome', // Brave uses Chromium
    required: false,
    priority: 'medium',
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    launchOptions: {
      executablePath: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser' // macOS
      // Windows: 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe'
      // Linux: '/usr/bin/brave-browser'
    },
    features: ['privacy-focused', 'ad-blocking']
  },

  opera: {
    name: 'Opera',
    channel: 'chrome', // Opera uses Chromium
    required: false,
    priority: 'medium',
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0',
    launchOptions: {
      executablePath: '/Applications/Opera.app/Contents/MacOS/Opera' // macOS
      // Windows: 'C:\\Program Files\\Opera\\launcher.exe'
      // Linux: '/usr/bin/opera'
    },
    features: ['chromium-based', 'opera-turbo']
  },

  vivaldi: {
    name: 'Vivaldi',
    channel: 'chrome', // Vivaldi uses Chromium
    required: false,
    priority: 'low',
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Vivaldi/6.5',
    launchOptions: {
      executablePath: '/Applications/Vivaldi.app/Contents/MacOS/Vivaldi' // macOS
      // Windows: 'C:\\Program Files\\Vivaldi\\Application\\vivaldi.exe'
      // Linux: '/usr/bin/vivaldi'
    },
    features: ['chromium-based', 'customizable']
  },

  min: {
    name: 'Min',
    channel: 'chrome', // Min uses Chromium
    required: false,
    priority: 'low',
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    launchOptions: {
      executablePath: '/Applications/Min.app/Contents/MacOS/Min' // macOS
      // Windows: 'C:\\Program Files\\Min\\Min.exe'
      // Linux: '/usr/bin/min'
    },
    features: ['minimalist', 'privacy-focused']
  },

  zen: {
    name: 'Zen',
    channel: 'firefox', // Zen is based on Firefox
    required: false,
    priority: 'low',
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    launchOptions: {
      executablePath: '/Applications/Zen Browser.app/Contents/MacOS/zen' // macOS
      // Windows: 'C:\\Program Files\\Zen Browser\\zen.exe'
      // Linux: '/usr/bin/zen'
    },
    features: ['firefox-based', 'privacy-focused']
  }
};

// Test URLs
const TEST_URLS = {
  base: 'https://bimta.suralayateknik.com',
  login: 'https://bimta.suralayateknik.com/login',
  dashboard: 'https://bimta.suralayateknik.com/dashboard',
  akunMahasiswa: 'https://bimta.suralayateknik.com/akun-mahasiswa',
  akunDosen: 'https://bimta.suralayateknik.com/akun-dosen',
  referensiTA: 'https://bimta.suralayateknik.com/referensi-ta',
  generateLaporan: 'https://bimta.suralayateknik.com/generate-laporan'
};

// Test credentials
const TEST_CREDENTIALS = {
  admin: {
    user_id: 'admin001',
    password: 'sandi123'
  }
};

// Compatibility test categories
const COMPAT_CATEGORIES = {
  rendering: 'Page Rendering & Layout',
  functionality: 'Interactive Functionality',
  fileOperations: 'File Upload/Download',
  dataOperations: 'CRUD Operations',
  navigation: 'Navigation & Routing',
  storage: 'Local Storage & Session',
  performance: 'Performance & Speed',
  responsive: 'Responsive Design'
};

// Browser-specific known issues (for documentation)
const KNOWN_ISSUES = {
  safari: [
    'Date input format differences',
    'File upload dialog behavior',
    'LocalStorage quota limits'
  ],
  firefox: [
    'CSS Grid rendering differences',
    'PDF viewer handling'
  ],
  brave: [
    'Ad-blocking may affect some CDN resources',
    'Fingerprinting protection may affect tracking'
  ],
  opera: [
    'Built-in VPN may affect geolocation',
    'Sidebar interactions'
  ]
};

module.exports = {
  BROWSER_CONFIGS,
  TEST_URLS,
  TEST_CREDENTIALS,
  COMPAT_CATEGORIES,
  KNOWN_ISSUES
};