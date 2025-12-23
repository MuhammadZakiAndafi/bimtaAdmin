const express = require('express');
const router = express.Router();
const ReferensiController = require('../controllers/referensiController');
const { authenticate, authorizeAdmin } = require('../middlewares/auth');
const { uploadDocument } = require('../middlewares/upload');

// Semua route memerlukan autentikasi dan otorisasi admin
router.use(authenticate, authorizeAdmin);

// Get all referensi (with filters)
router.get('/', ReferensiController.getAllReferensi);

// Get referensi by NIM
router.get('/:nim', ReferensiController.getReferensiById);

// Create new referensi
router.post('/', uploadDocument.single('document'), ReferensiController.createReferensi);

// Update referensi
router.put('/:nim', uploadDocument.single('document'), ReferensiController.updateReferensi);

// Delete referensi
router.delete('/:nim', ReferensiController.deleteReferensi);

module.exports = router;