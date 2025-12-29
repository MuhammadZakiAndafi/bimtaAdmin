const DashboardController = require('./dashboardController');

const User = require('../models/User');
const ReferensiTA = require('../models/ReferensiTA');
const Bimbingan = require('../models/Bimbingan');

jest.mock('../models/User');
jest.mock('../models/ReferensiTA');
jest.mock('../models/Bimbingan');

describe('DashboardController', () => {

  describe('getDashboardData', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
      jest.clearAllMocks(); 

      mockReq = {}; 
      mockRes = {
        json: jest.fn(),
      };
      mockNext = jest.fn(); 
    });

    // SEMUA DATA BERHASIL DIAMBIL
    test('harus mengembalikan data dashboard yang terstruktur dengan benar', async () => {
      // Arrange 
      const mockUsersByRole = [
        { role: 'mahasiswa', total: 150 },
        { role: 'dosen', total: 30 },
      ];
      const mockTotalReferensi = 75;
      const mockBimbinganByStatus = [
        { status_bimbingan: 'ongoing', total: 55 }, 
        { status_bimbingan: 'done', total: 80 },
        { status_bimbingan: 'warning', total: 8 }, 
      ];

      const mockRecentActivities = [
        { id: 1, activity: 'Bimbingan baru', time: '1 jam lalu' }
      ];

      User.countByRole.mockResolvedValue(mockUsersByRole);
      ReferensiTA.count.mockResolvedValue(mockTotalReferensi);
      Bimbingan.countByStatus.mockResolvedValue(mockBimbinganByStatus);
      Bimbingan.getRecentActivity.mockResolvedValue(mockRecentActivities);

      // Act 
      await DashboardController.getDashboardData(mockReq, mockRes, mockNext);

      // Assert 
      
      expect(User.countByRole).toHaveBeenCalledTimes(1);
      expect(ReferensiTA.count).toHaveBeenCalledTimes(1);
      expect(Bimbingan.countByStatus).toHaveBeenCalledTimes(1);
      expect(Bimbingan.getRecentActivity).toHaveBeenCalledWith(5);

      const responseData = mockRes.json.mock.calls[0][0].data;
      expect(responseData.statistics.totalMahasiswa).toBe(150);
      expect(responseData.statistics.totalDosen).toBe(30);
      expect(responseData.statistics.totalReferensi).toBe(75);
      expect(responseData.statistics.totalBimbingan.ongoing).toBe(55);
      expect(responseData.statistics.totalBimbingan.done).toBe(80);
      expect(responseData.statistics.totalBimbingan.warning).toBe(8); 
      expect(responseData.statistics.totalBimbingan.terminated).toBe(0); 

      expect(responseData.recentActivities).toEqual(mockRecentActivities);
      expect(responseData.quickActions).toHaveLength(4); 

      expect(responseData.systemWarnings).toHaveLength(3); 
      expect(responseData.systemWarnings[0].message).toBe('8 mahasiswa belum login sejak lama');
      expect(responseData.systemWarnings[1].message).toBe('Dosen referensi mencapai 85%');
      
      expect(mockNext).not.toHaveBeenCalled();
    });

    // JIKA TERJADI ERROR DI DATABASE
    test('harus memanggil next(error) jika terjadi kegagalan di database', async () => {
      // Arrange
      const mockError = new Error('Koneksi database gagal');
      User.countByRole.mockRejectedValue(mockError);

      // Act
      await DashboardController.getDashboardData(mockReq, mockRes, mockNext);

      // Assert
      
      expect(mockRes.json).not.toHaveBeenCalled();
      
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });

    test('harus menangani jika data bimbingan atau user kosong (Baris 11-21)', async () => {
  Bimbingan.countByStatus.mockResolvedValue([]);
  User.countByRole.mockResolvedValue([]);
  Bimbingan.getRecentActivity.mockResolvedValue([]);

  // Ganti .getStats menjadi .getDashboardData (atau sesuai nama di file .js Anda)
  await DashboardController.getDashboardData(mockReq, mockRes, mockNext);

  expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
});

test('harus menangkap error bimbingan (Baris 57-62)', async () => {
  const error = new Error('Database Error');
  Bimbingan.getRecentActivity.mockRejectedValue(error);

  await DashboardController.getDashboardData(mockReq, mockRes, mockNext);

  expect(mockNext).toHaveBeenCalledWith(error);
});
  });
});