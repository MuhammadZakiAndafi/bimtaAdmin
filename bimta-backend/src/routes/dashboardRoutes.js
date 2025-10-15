const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const { authenticate, authorizeAdmin } = require('../middlewares/auth');

router.get('/', authenticate, authorizeAdmin, DashboardController.getDashboardData);

module.exports = router;