const AuthController = require('./authController');

const User = require('../models/User');
const { comparePassword } = require('../utils/bcrypt');
const { generateToken } = require('../utils/jwt');

// mocking
jest.mock('../models/User');
jest.mock('../utils/bcrypt');
jest.mock('../utils/jwt');

describe('AuthController', () => {

  describe('login', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
      jest.clearAllMocks();

      mockReq = {
        body: {},
      };
      mockRes = {
        status: jest.fn().mockReturnThis(), 
        json: jest.fn(),
      };
      mockNext = jest.fn();
    });
    
  //SIMULASI LOGIN BERHASIL

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
  expect(User.findByUserIdWithPassword).toHaveBeenCalledWith('admin01');
  expect(comparePassword).toHaveBeenCalledWith('password123', 'hashed_password');
  expect(mockRes.status).not.toHaveBeenCalled(); 
  expect(mockRes.json).toHaveBeenCalledWith({
    success: true,
    message: 'Login berhasil',
    data: {
      user: {
        user_id: 'admin01',
        nama: 'Admin Utama',
        role: 'admin',
        status_user: 'active',
      },
      token: 'fake_jwt_token',
    },
  });
});

// SIMULASI ID/PASS SALAH

test('harus mengembalikan error 401 jika user tidak ditemukan', async () => {
  // Arrange
  mockReq.body = { user_id: 'salah', password: 'salah' };
  User.findByUserIdWithPassword.mockResolvedValue(null); // Simulasikan user TIDAK ditemukan

  // Act
  await AuthController.login(mockReq, mockRes, mockNext);

  // Assert
  expect(mockRes.status).toHaveBeenCalledWith(401);
  expect(mockRes.json).toHaveBeenCalledWith({
    success: false,
    message: 'User ID atau password salah',
  });
});

// SIMULASI JIKA USER BUKAN ADMIN

test('harus mengembalikan error 403 jika user bukan admin', async () => {
  // Arrange
  mockReq.body = { user_id: 'mahasiswa01', password: 'password123' };
  const mockNonAdminUser = {
    user_id: 'mahasiswa01',
    role: 'mahasiswa', 
  };
  User.findByUserIdWithPassword.mockResolvedValue(mockNonAdminUser);

  // Act
  await AuthController.login(mockReq, mockRes, mockNext);

  // Assert
  expect(mockRes.status).toHaveBeenCalledWith(403);
  expect(mockRes.json).toHaveBeenCalledWith({
    success: false,
    message: 'Hanya admin yang dapat login ke web',
  });
});

// SIMULASI PASSWORD SALAH

test('harus mengembalikan error 401 jika password tidak valid', async () => {
    // Arrange
    mockReq.body = { user_id: 'admin01', password: 'password_salah' };
    const mockAdminUser = {
        user_id: 'admin01',
        role: 'admin',
        sandi: 'hashed_password'
    };
    User.findByUserIdWithPassword.mockResolvedValue(mockAdminUser);
    comparePassword.mockResolvedValue(false); // <-- Simulasikan password salah

    // Act
    await AuthController.login(mockReq, mockRes, mockNext);

    // Assert
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'User ID atau password salah',
    });
});

  });
});