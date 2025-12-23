const User = require('../models/User');
const { hashPassword } = require('../utils/bcrypt');
const fs = require('fs');
const path = require('path');

class UserController {
  // Get All Users (Mahasiswa atau Dosen)
  static async getUsers(req, res, next) {
    try {
      const { role, status, search } = req.query;

      const filters = {};
      if (role) filters.role = role;
      if (status) filters.status_user = status;
      if (search) filters.search = search;

      const users = await User.findAll(filters);

      const usersWithoutPassword = users.map(user => {
        const { sandi, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      res.json({
        success: true,
        data: usersWithoutPassword,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get User by ID
  static async getUserById(req, res, next) {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan',
        });
      }

      const { sandi, ...userWithoutPassword } = user;

      res.json({
        success: true,
        data: userWithoutPassword,
      });
    } catch (error) {
      next(error);
    }
  }

  // Create User (Mahasiswa atau Dosen)
  static async createUser(req, res, next) {
    try {
      const { user_id, nama, no_whatsapp, role, password } = req.body;

      // Validasi input
      if (!user_id || !nama || !no_whatsapp || !role || !password) {
        return res.status(400).json({
          success: false,
          message: 'Semua field harus diisi',
        });
      }

      if (!['mahasiswa', 'dosen'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Role harus mahasiswa atau dosen',
        });
      }

      // Cek apakah user sudah ada
      const existingUser = await User.findById(user_id);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User ID sudah digunakan',
        });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Tentukan photo_url
      let photoUrl = '/uploads/photos/default-avatar.png';
      if (req.file) {
        photoUrl = `/uploads/photos/${req.file.filename}`;
      }

      const userData = {
        user_id,
        nama,
        no_whatsapp,
        sandi: hashedPassword,
        role,
        photo_url: photoUrl,
        status_user: 'active',
      };

      const newUser = await User.create(userData);

      const { sandi, ...userWithoutPassword } = newUser;

      res.status(201).json({
        success: true,
        message: 'User berhasil dibuat',
        data: userWithoutPassword,
      });
    } catch (error) {
      // Hapus file yang sudah diupload jika error
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      next(error);
    }
  }

  // Update User
  static async updateUser(req, res, next) {
    try {
      const { userId } = req.params;
      const { nama, no_whatsapp, status_user } = req.body;

      const user = await User.findById(userId);

      if (!user) {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan',
        });
      }

      let photoUrl = user.photo_url;

      // Jika ada file baru yang diupload
      if (req.file) {
        // Hapus foto lama jika bukan default
        if (user.photo_url && !user.photo_url.includes('default-avatar')) {
          const oldPhotoPath = path.join(__dirname, '../../', user.photo_url);
          if (fs.existsSync(oldPhotoPath)) {
            fs.unlinkSync(oldPhotoPath);
          }
        }
        photoUrl = `/uploads/photos/${req.file.filename}`;
      }

      const userData = {
        nama: nama || user.nama,
        no_whatsapp: no_whatsapp || user.no_whatsapp,
        photo_url: photoUrl,
        status_user: status_user || user.status_user,
      };

      const updatedUser = await User.update(userId, userData);

      const { sandi, ...userWithoutPassword } = updatedUser;

      res.json({
        success: true,
        message: 'User berhasil diupdate',
        data: userWithoutPassword,
      });
    } catch (error) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      next(error);
    }
  }

  // Reset Password
  static async resetPassword(req, res, next) {
    try {
      const { userId } = req.params;
      const { new_password } = req.body;

      if (!new_password) {
        return res.status(400).json({
          success: false,
          message: 'Password baru harus diisi',
        });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan',
        });
      }

      const hashedPassword = await hashPassword(new_password);
      await User.updatePassword(userId, hashedPassword);

      res.json({
        success: true,
        message: 'Password berhasil direset',
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete User
  static async deleteUser(req, res, next) {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan',
        });
      }

      // Hapus foto jika bukan default
      if (user.photo_url && !user.photo_url.includes('default-avatar')) {
        const photoPath = path.join(__dirname, '../../', user.photo_url);
        if (fs.existsSync(photoPath)) {
          fs.unlinkSync(photoPath);
        }
      }

      await User.delete(userId);

      res.json({
        success: true,
        message: 'User berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;