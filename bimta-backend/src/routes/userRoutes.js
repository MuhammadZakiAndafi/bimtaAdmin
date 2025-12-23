const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { authenticate, authorizeAdmin } = require('../middlewares/auth');
const { uploadPhoto } = require('../middlewares/upload');

// Semua route memerlukan autentikasi dan otorisasi admin
router.use(authenticate, authorizeAdmin);

// Get all users (with filters)
router.get('/', UserController.getUsers);

// Get user by ID
router.get('/:userId', UserController.getUserById);

// Create new user
router.post('/', uploadPhoto.single('photo'), UserController.createUser);

// Update user
router.put('/:userId', uploadPhoto.single('photo'), UserController.updateUser);

// Reset password
router.patch('/:userId/reset-password', UserController.resetPassword);

// Delete user
router.delete('/:userId', UserController.deleteUser);

module.exports = router;