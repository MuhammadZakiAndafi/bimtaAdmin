const express = require('express');
const router = express.Router();
const LaporanController = require('../controllers/laporanController');
const { authenticate, authorizeAdmin } = require('../middlewares/auth');

// Semua route memerlukan autentikasi dan otorisasi admin
router.use(authenticate, authorizeAdmin);

// Generate laporan
router.get('/generate', LaporanController.generateLaporan);

// Export laporan ke Excel
router.get('/export', LaporanController.exportLaporanExcel);

// Get statistik laporan
router.get('/statistik', LaporanController.getLaporanStatistik);

module.exports = router;