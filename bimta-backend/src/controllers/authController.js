const User = require('../models/User');
const { comparePassword } = require('../utils/bcrypt');
const { generateToken } = require('../utils/jwt');

class AuthController {
  static async login(req, res, next) {
    try {
      const { user_id, password } = req.body;

      if (!user_id || !password) {
        return res.status(400).json({
          success: false,
          message: 'User ID dan password harus diisi',
        });
      }

      const user = await User.findByUserIdWithPassword(user_id);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User ID atau password salah',
        });
      }

      if (user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Hanya admin yang dapat login ke web',
        });
      }

      const isPasswordValid = await comparePassword(password, user.sandi);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'User ID atau password salah',
        });
      }

      if (user.status_user === 'inactive') {
        return res.status(403).json({
          success: false,
          message: 'Akun Anda sedang tidak aktif',
        });
      }

      const token = generateToken({
        user_id: user.user_id,
        nama: user.nama,
        role: user.role,
      });

      const { sandi, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: 'Login berhasil',
        data: {
          user: userWithoutPassword,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req, res, next) {
    try {
      const user = await User.findById(req.user.user_id);

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
}

module.exports = AuthController;