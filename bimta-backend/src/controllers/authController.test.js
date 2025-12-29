const AuthController = require('./authController');
const User = require('../models/User');
const { comparePassword } = require('../utils/bcrypt');
const { generateToken } = require('../utils/jwt');

// 1. Mocking dependensi
jest.mock('../models/User');
jest.mock('../utils/bcrypt');
jest.mock('../utils/jwt');

describe('AuthController', () => {
  let mockReq, mockRes, mockNext;

  // 2. Setup mock request dan response 
  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      body: {},
      user: {}, 
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(), 
      json: jest.fn(),
    };
    
    mockNext = jest.fn();
  });

  describe('login', () => {
    
    test('harus berhasil login dan mengembalikan token jika kredensial valid', async () => {
      // Arrange
      mockReq.body = { user_id: 'admin01', password: 'password123' };
      const mockAdminUser = {
        user_id: 'admin01',
        nama: 'Admin Utama',
        role: 'admin',
        sandi: 'hashed_password', 
        status_user: 'active',
      };

      User.findByUserIdWithPassword.mockResolvedValue(mockAdminUser); 
      comparePassword.mockResolvedValue(true); 
      generateToken.mockReturnValue('fake_jwt_token'); 

      // Act
      await AuthController.login(mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: 'Login berhasil',
        data: expect.objectContaining({ token: 'fake_jwt_token' })
      }));
    });

    test('harus return 400 jika user_id atau password kosong', async () => {
      // Arrange
      mockReq.body = { user_id: '', password: '' };

      // Act
      await AuthController.login(mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'User ID dan password harus diisi',
      });
    });

    test('harus return 401 jika user tidak ditemukan', async () => {
      mockReq.body = { user_id: 'salah', password: 'salah' };
      User.findByUserIdWithPassword.mockResolvedValue(null);

      await AuthController.login(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    test('harus return 403 jika user bukan admin', async () => {
      mockReq.body = { user_id: 'mhs01', password: 'password123' };
      User.findByUserIdWithPassword.mockResolvedValue({ role: 'mahasiswa' });

      await AuthController.login(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
    });

    test('harus return 401 jika password salah', async () => {
      mockReq.body = { user_id: 'admin01', password: 'salah' };
      User.findByUserIdWithPassword.mockResolvedValue({ role: 'admin', sandi: 'hash' });
      comparePassword.mockResolvedValue(false);

      await AuthController.login(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    test('harus return 403 jika akun berstatus inactive', async () => {
      mockReq.body = { user_id: 'admin01', password: 'password123' };
      User.findByUserIdWithPassword.mockResolvedValue({ 
        role: 'admin', 
        sandi: 'hash', 
        status_user: 'inactive' 
      });
      comparePassword.mockResolvedValue(true);

      await AuthController.login(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Akun Anda sedang tidak aktif'
      }));
    });

    test('harus memanggil next(error) jika terjadi kesalahan server/database', async () => {
      mockReq.body = { user_id: 'admin01', password: 'password123' };
      const dbError = new Error('Database error');
      User.findByUserIdWithPassword.mockRejectedValue(dbError);

      await AuthController.login(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(dbError);
    });
  });

  describe('getProfile', () => {
    
    test('harus mengembalikan data profil jika user ditemukan', async () => {
      // Arrange
      mockReq.user = { user_id: 'admin01' };
      const mockUser = { user_id: 'admin01', nama: 'Admin Utama', sandi: 'secret_hash' };
      User.findById.mockResolvedValue(mockUser);

      // Act
      await AuthController.getProfile(mockReq, mockRes, mockNext);

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: { user_id: 'admin01', nama: 'Admin Utama' } // sandi harus terhapus
      });
    });

    test('harus return 404 jika user tidak ditemukan di getProfile', async () => {
      mockReq.user = { user_id: 'tidak_ada' };
      User.findById.mockResolvedValue(null);

      await AuthController.getProfile(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    test('harus memanggil next(error) jika getProfile terjadi kesalahan', async () => {
      mockReq.user = { user_id: 'admin01' };
      const error = new Error('Database error');
      User.findById.mockRejectedValue(error);

      await AuthController.getProfile(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});