const UserController = require('./userController');

const User = require('../models/User');
const { hashPassword } = require('../utils/bcrypt');
const fs = require('fs');


jest.mock('../models/User');
jest.mock('../utils/bcrypt');
jest.mock('fs');

describe('UserController', () => {
  let mockReq, mockRes, mockNext;
  
  let mockUnlinkSync, mockExistsSync;
  
  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      body: {},
      params: {},
      query: {},
      file: null,
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();

    mockUnlinkSync = jest.fn();
    mockExistsSync = jest.fn();
    fs.unlinkSync = mockUnlinkSync;
    fs.existsSync = mockExistsSync;
    
    hashPassword.mockResolvedValue('hashed_password_mock');
  });

  // TEST UNTUK GET USERS
  describe('getUsers', () => {
    test('harus mengembalikan daftar user tanpa password', async () => {
      mockReq.query = { role: 'mahasiswa' };
      const mockUsers = [
        { user_id: '1', nama: 'User A', sandi: 'pass123' },
        { user_id: '2', nama: 'User B', sandi: 'pass456' },
      ];
      User.findAll.mockResolvedValue(mockUsers);

      await UserController.getUsers(mockReq, mockRes, mockNext);

      // Cek filter yang dikirim ke model
      expect(User.findAll).toHaveBeenCalledWith({
        role: 'mahasiswa',
        status_user: undefined,
        search: undefined,
      });

      // Cek 'sandi' telah dihapus dari respons
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: [
          { user_id: '1', nama: 'User A' },
          { user_id: '2', nama: 'User B' },
        ],
      });
    });
  });
  
  // TES UNTUK getUserById
  describe('getUserById', () => {
    test('harus mengembalikan 404 jika user tidak ditemukan', async () => {
      mockReq.params.userId = '404';
      User.findById.mockResolvedValue(null);
      
      await UserController.getUserById(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'User tidak ditemukan',
      });
    });
  });

  // TEST UNTUK createUser
  describe('createUser', () => {
    beforeEach(() => {
      mockReq.body = {
        user_id: '123',
        nama: 'User Baru',
        no_whatsapp: '08123',
        role: 'mahasiswa',
        password: 'password123',
      };
    });

    test('harus return 400 jika user ID sudah ada', async () => {
      User.findById.mockResolvedValue({ user_id: '123' }); // Simulasikan user ada

      await UserController.createUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'User ID sudah digunakan',
      });
    });

    test('harus berhasil membuat user dengan default-avatar (tanpa file)', async () => {
      User.findById.mockResolvedValue(null); // User belum ada
      const mockNewUser = { ...mockReq.body, photo_url: '/uploads/photos/default-avatar.png', status_user: 'active' };
      User.create.mockResolvedValue(mockNewUser);
      
      await UserController.createUser(mockReq, mockRes, mockNext);
      
      // Cek password di-hash
      expect(hashPassword).toHaveBeenCalledWith('password123');
      
      // Cek data yang dikirim ke User.create
      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
        user_id: '123',
        sandi: 'hashed_password_mock',
        photo_url: '/uploads/photos/default-avatar.png',
      }));
      
      // Cek respons (tanpa 'sandi')
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.not.objectContaining({ sandi: expect.anything() })
      }));
    });
    
    test('harus berhasil membuat user dengan foto (dengan file)', async () => {
      mockReq.file = { filename: 'photo-123.jpg', path: 'temp/photo-123.jpg' };
      User.findById.mockResolvedValue(null);
      const mockNewUser = { ...mockReq.body, photo_url: '/uploads/photos/photo-123.jpg', status_user: 'active' };
      User.create.mockResolvedValue(mockNewUser);
      
      await UserController.createUser(mockReq, mockRes, mockNext);
      
      // Cek data yang dikirim ke User.create
      expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
        photo_url: '/uploads/photos/photo-123.jpg',
      }));
      
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    test('harus menghapus file jika terjadi error database', async () => {
      mockReq.file = { filename: 'photo-123.jpg', path: 'temp/photo-123.jpg' };
      User.findById.mockResolvedValue(null); // Cek user lolos
      const mockError = new Error('Database create failed');
      User.create.mockRejectedValue(mockError); // Gagal saat create

      await UserController.createUser(mockReq, mockRes, mockNext);

      // Cek error handler dipanggil
      expect(mockNext).toHaveBeenCalledWith(mockError);
      
      // Cek file dihapus (rollback)
      expect(mockUnlinkSync).toHaveBeenCalledWith('temp/photo-123.jpg');
    });
  });

  // TEST UNTUK updateUser
  describe('updateUser', () => {
    test('harus menghapus file baru jika user tidak ditemukan', async () => {
      mockReq.params.userId = '404';
      mockReq.file = { filename: 'new.jpg', path: 'temp/new.jpg' };
      User.findById.mockResolvedValue(null); // User tidak ada

      await UserController.updateUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      // Cek file baru (yang gagal di-upload) dihapus
      expect(mockUnlinkSync).toHaveBeenCalledWith('temp/new.jpg');
    });

    test('harus update user dan mengganti foto (menghapus foto lama)', async () => {
      mockReq.params.userId = '123';
      mockReq.body = { nama: 'Nama Baru' };
      mockReq.file = { filename: 'new.jpg', path: 'temp/new.jpg' };
      const mockOldUser = {
        user_id: '123',
        nama: 'Nama Lama',
        photo_url: '/uploads/photos/old.jpg', // Foto kustom
      };
      const mockUpdatedUser = { ...mockOldUser, nama: 'Nama Baru', photo_url: '/uploads/photos/new.jpg' };

      User.findById.mockResolvedValue(mockOldUser);
      mockExistsSync.mockReturnValue(true); // Simulasikan file lama ada
      User.update.mockResolvedValue(mockUpdatedUser);
      
      await UserController.updateUser(mockReq, mockRes, mockNext);
      
      // Cek file lama dihapus
      expect(mockExistsSync).toHaveBeenCalledWith(expect.stringContaining('old.jpg'));
      expect(mockUnlinkSync).toHaveBeenCalledWith(expect.stringContaining('old.jpg'));
      
      // Cek data dikirim ke User.update
      expect(User.update).toHaveBeenCalledWith('123', expect.objectContaining({
        nama: 'Nama Baru',
        photo_url: '/uploads/photos/new.jpg',
      }));

      // Cek respons
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
    
    test('harus update user dan mengganti foto (foto lama adalah default)', async () => {
      mockReq.params.userId = '123';
      mockReq.file = { filename: 'new.jpg', path: 'temp/new.jpg' };
      const mockOldUser = {
        user_id: '123',
        photo_url: '/uploads/photos/default-avatar.png', // Foto default
      };
      User.findById.mockResolvedValue(mockOldUser);
      User.update.mockResolvedValue({ ...mockOldUser, photo_url: '/uploads/photos/new.jpg' });

      await UserController.updateUser(mockReq, mockRes, mockNext);
      
      // Cek file lama TIDAK dihapus
      expect(mockExistsSync).not.toHaveBeenCalled();
      expect(mockUnlinkSync).not.toHaveBeenCalled();
      
      // Cek User.update
      expect(User.update).toHaveBeenCalledWith('123', expect.objectContaining({
        photo_url: '/uploads/photos/new.jpg',
      }));
    });
  });

  // === TEST UNTUK deleteUser ===
  describe('deleteUser', () => {
    test('harus menghapus user dan foto kustomnya', async () => {
      mockReq.params.userId = '123';
      const mockUser = {
        user_id: '123',
        photo_url: '/uploads/photos/custom.jpg',
      };
      User.findById.mockResolvedValue(mockUser);
      mockExistsSync.mockReturnValue(true); // File ada
      User.delete.mockResolvedValue(true);

      await UserController.deleteUser(mockReq, mockRes, mockNext);

      // Cek file kustom dihapus
      expect(mockExistsSync).toHaveBeenCalledWith(expect.stringContaining('custom.jpg'));
      expect(mockUnlinkSync).toHaveBeenCalledWith(expect.stringContaining('custom.jpg'));
      
      // Cek user dihapus
      expect(User.delete).toHaveBeenCalledWith('123');
      
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'User berhasil dihapus',
      });
    });
  });
});