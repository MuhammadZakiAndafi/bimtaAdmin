const UserController = require('./userController');
const User = require('../models/User');
const { hashPassword } = require('../utils/bcrypt');
const fs = require('fs');
const path = require('path');

jest.mock('../models/User');
jest.mock('../utils/bcrypt');
jest.mock('fs');

describe('UserController Full Coverage Test', () => {
  let mockReq, mockRes, mockNext;

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

    hashPassword.mockResolvedValue('hashed_password_mock');
    fs.existsSync.mockReturnValue(true);
    fs.unlinkSync = jest.fn();
  });

  // --- GET USERS ---
  describe('getUsers', () => {
    test('harus berhasil mengambil daftar user dengan filter lengkap', async () => {
      mockReq.query = { role: 'mahasiswa', status: 'active', search: 'ari' };
      User.findAll.mockResolvedValue([{ user_id: '1', sandi: 'secret', nama: 'Ari' }]);
      await UserController.getUsers(mockReq, mockRes, mockNext);
      expect(User.findAll).toHaveBeenCalledWith({ role: 'mahasiswa', status_user: 'active', search: 'ari' });
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    test('harus menangani error di getUsers (Catch Block)', async () => {
      const error = new Error('Database Error');
      User.findAll.mockRejectedValue(error);
      await UserController.getUsers(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // --- GET USER BY ID ---
  describe('getUserById', () => {
    test('harus berhasil mengambil user by ID', async () => {
      mockReq.params.userId = '123';
      User.findById.mockResolvedValue({ user_id: '123', sandi: 'secret' });
      await UserController.getUserById(mockReq, mockRes, mockNext);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    test('harus return 404 jika user tidak ditemukan', async () => {
      User.findById.mockResolvedValue(null);
      await UserController.getUserById(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  // --- CREATE USER ---
  describe('createUser', () => {
    test('harus return 400 jika input tidak lengkap', async () => {
      mockReq.body = { user_id: '1' }; // data tidak lengkap
      await UserController.createUser(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    test('harus menghapus file jika User.create gagal (Catch Block)', async () => {
      mockReq.body = { user_id: '1', nama: 'A', no_whatsapp: '1', role: 'mahasiswa', password: '1' };
      mockReq.file = { path: 'temp/photo.jpg' };
      User.findById.mockResolvedValue(null);
      User.create.mockRejectedValue(new Error('Create Fail'));

      await UserController.createUser(mockReq, mockRes, mockNext);
      expect(fs.unlinkSync).toHaveBeenCalledWith('temp/photo.jpg');
      expect(mockNext).toHaveBeenCalled();
    });
  });

  // --- UPDATE USER ---
  describe('updateUser', () => {
    test('harus update data tanpa mengganti foto (menggunakan data lama)', async () => {
      mockReq.params.userId = '1';
      mockReq.body = {}; // Body kosong untuk menguji fallback (|| user.nama)
      User.findById.mockResolvedValue({ nama: 'Lama', photo_url: 'old.png', status_user: 'active' });
      User.update.mockResolvedValue({ user_id: '1' });

      await UserController.updateUser(mockReq, mockRes, mockNext);
      expect(User.update).toHaveBeenCalledWith('1', expect.objectContaining({ nama: 'Lama' }));
    });

    test('harus hapus file baru jika user tidak ditemukan', async () => {
      mockReq.params.userId = '999';
      mockReq.file = { path: 'temp/new.jpg' };
      User.findById.mockResolvedValue(null);

      await UserController.updateUser(mockReq, mockRes, mockNext);
      expect(fs.unlinkSync).toHaveBeenCalledWith('temp/new.jpg');
    });
  });

  // --- RESET PASSWORD ---
  describe('resetPassword', () => {
    test('harus berhasil reset password', async () => {
      mockReq.params.userId = '1';
      mockReq.body = { new_password: 'password123' };
      User.findById.mockResolvedValue({ user_id: '1' });
      
      await UserController.resetPassword(mockReq, mockRes, mockNext);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    test('harus menangani error di resetPassword (Catch Block - FIX)', async () => {
      // PENTING: Berikan body agar lolos validasi "if (!new_password)"
      mockReq.params.userId = '1';
      mockReq.body = { new_password: 'valid_password' }; 
      
      const error = new Error('Reset Fail');
      User.findById.mockRejectedValue(error); // Sekarang ini akan terpanggil
      
      await UserController.resetPassword(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // --- DELETE USER ---
  describe('deleteUser', () => {
    test('harus menghapus user dengan foto kustom', async () => {
      mockReq.params.userId = '123';
      User.findById.mockResolvedValue({ photo_url: '/uploads/photos/my-avatar.jpg' });
      
      await UserController.deleteUser(mockReq, mockRes, mockNext);
      expect(fs.unlinkSync).toHaveBeenCalled();
      expect(User.delete).toHaveBeenCalledWith('123');
    });

    test('harus sukses delete user yang menggunakan foto default (tanpa unlink kustom)', async () => {
      mockReq.params.userId = '123';
      User.findById.mockResolvedValue({ photo_url: 'default-avatar.png' });
      
      await UserController.deleteUser(mockReq, mockRes, mockNext);
      expect(fs.unlinkSync).not.toHaveBeenCalled();
      expect(User.delete).toHaveBeenCalled();
    });
    
    test('harus menangani error di deleteUser (Catch Block)', async () => {
      const error = new Error('Delete Error');
      User.findById.mockRejectedValue(error);
      await UserController.deleteUser(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
  describe('userController Branch Coverage Boost', () => {
    // Update User - Logic Hapus Foto Lama
    test('updateUser: harus melewati penghapusan jika file lama tidak ada di disk', async () => {
      mockReq.params.userId = '1';
      mockReq.file = { filename: 'new.jpg' };
      User.findById.mockResolvedValue({ photo_url: '/uploads/photos/ada-di-db-tapi-hilang.jpg' });
      
      // BRANCH: user.photo_url ada, BUKAN default, TAPI fs.existsSync = false
      fs.existsSync.mockReturnValue(false); 
      User.update.mockResolvedValue({ user_id: '1' });

      await UserController.updateUser(mockReq, mockRes, mockNext);
      
      expect(fs.unlinkSync).not.toHaveBeenCalled(); // Karena filenya tidak ada di disk
      expect(mockRes.json).toHaveBeenCalled();
    });

    // Update User - 404 Cleanup
    test('updateUser: harus cleanup file jika user 404 DAN tidak ada file yang diupload', async () => {
      mockReq.params.userId = '999';
      mockReq.file = null; // BRANCH: req.file adalah null
      User.findById.mockResolvedValue(null);

      await UserController.updateUser(mockReq, mockRes, mockNext);
      
      expect(fs.unlinkSync).not.toHaveBeenCalled(); 
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });
});