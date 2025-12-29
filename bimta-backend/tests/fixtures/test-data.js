// tests/fixtures/test-data.js

// Admin credentials for testing
const ADMIN_CREDENTIALS = {
  user_id: 'admin001',
  password: 'sandi123',
  nama: 'Admin BIMTA',
  role: 'admin'
};

// Test mahasiswa data
const TEST_MAHASISWA = {
  user_id: 'M2025001',
  nama: 'Test Mahasiswa',
  no_whatsapp: '081234567890',
  password: 'mahasiswa123',
  role: 'mahasiswa'
};

// Test dosen data
const TEST_DOSEN = {
  user_id: 'D2025001',
  nama: 'Test Dosen',
  no_whatsapp: '081234567891',
  password: 'dosen123',
  role: 'dosen'
};

// Test referensi data
const TEST_REFERENSI = {
  nim_mahasiswa: 'R2025001',
  nama_mahasiswa: 'Mahasiswa Referensi',
  judul: 'Sistem Informasi Berbasis Web untuk Manajemen Data',
  topik: 'Web Development',
  tahun: 2025
};

// Test laporan parameters
const TEST_LAPORAN = {
  bulanan: {
    jenis_laporan: 'bulanan',
    bulan: new Date().getMonth() + 1,
    tahun: new Date().getFullYear()
  },
  semester: {
    jenis_laporan: 'semester',
    tahun: new Date().getFullYear()
  }
};

// API endpoints
const API_ENDPOINTS = {
  BASE_URL: 'http://localhost:5000/api',
  AUTH: {
    LOGIN: '/auth/login',
    PROFILE: '/auth/profile'
  },
  USERS: '/users',
  REFERENSI: '/referensi',
  LAPORAN: {
    GENERATE: '/laporan/generate',
    EXPORT: '/laporan/export',
    STATISTIK: '/laporan/statistik'
  },
  DASHBOARD: '/dashboard'
};

// Frontend routes
const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  AKUN_MAHASISWA: '/akun-mahasiswa',
  AKUN_DOSEN: '/akun-dosen',
  REFERENSI_TA: '/referensi-ta',
  GENERATE_LAPORAN: '/generate-laporan'
};

// Test timeouts
const TIMEOUTS = {
  SHORT: 5000,
  MEDIUM: 10000,
  LONG: 30000
};

module.exports = {
  ADMIN_CREDENTIALS,
  TEST_MAHASISWA,
  TEST_DOSEN,
  TEST_REFERENSI,
  TEST_LAPORAN,
  API_ENDPOINTS,
  ROUTES,
  TIMEOUTS
};