const Bimbingan = require('./Bimbingan');
const pool = require('../config/database');

// Mocking database driver
jest.mock('../config/database');

describe('Bimbingan Model - Full Coverage Test', () => {
  
  // Membersihkan mock setelah setiap test agar tidak saling mengganggu
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    test('harus mengambil semua data tanpa filter', async () => {
      // Arrange
      pool.query.mockResolvedValue({ rows: [{ bimbingan_id: 1 }], rowCount: 1 });

      // Act
      const result = await Bimbingan.findAll({});

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        expect.not.stringContaining('AND b.status_bimbingan'), 
        []
      );
      expect(result).toHaveLength(1);
    });

    test('harus menerapkan filter status_bimbingan secara spesifik', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      
      await Bimbingan.findAll({ status_bimbingan: 'disetujui' });

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND b.status_bimbingan = $1'),
        ['disetujui']
      );
    });

    test('harus menerapkan filter dosen_id secara spesifik', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      
      await Bimbingan.findAll({ dosen_id: 'D001' });

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND b.dosen_id = $1'),
        ['D001']
      );
    });

    test('harus menerapkan filter mahasiswa_id secara spesifik', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      
      await Bimbingan.findAll({ mahasiswa_id: 'M001' });

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND b.mahasiswa_id = $1'),
        ['M001']
      );
    });

    test('harus menangani kombinasi semua filter sekaligus', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      const filters = { 
        status_bimbingan: 'revisi', 
        dosen_id: 'D002', 
        mahasiswa_id: 'M002' 
      };

      await Bimbingan.findAll(filters);

      // Memastikan urutan parameter $1, $2, $3 sesuai dengan logika kodingan
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('AND b.status_bimbingan = $1 AND b.dosen_id = $2 AND b.mahasiswa_id = $3'),
        ['revisi', 'D002', 'M002']
      );
    });
  });

  describe('findById', () => {
    test('harus mengembalikan satu data bimbingan berdasarkan ID', async () => {
      const mockData = { bimbingan_id: 10, nama_mahasiswa: 'Ari Raihan' };
      pool.query.mockResolvedValue({ rows: [mockData], rowCount: 1 });

      const result = await Bimbingan.findById(10);

      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('WHERE b.bimbingan_id = $1'), [10]);
      expect(result).toEqual(mockData);
    });

    test('harus return undefined jika ID tidak ditemukan', async () => {
      pool.query.mockResolvedValue({ rows: [], rowCount: 0 });
      const result = await Bimbingan.findById(999);
      expect(result).toBeUndefined();
    });
  });

  describe('Statistics & Activity', () => {
    test('countByStatus harus menjalankan query grouping status bimbingan', async () => {
    const mockStats = [{ status_bimbingan: 'aktif', total: 10 }];
    pool.query.mockResolvedValue({ rows: mockStats });

    const result = await Bimbingan.countByStatus();

    // Hapus argumen [] di bawah ini
    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('GROUP BY status_bimbingan')); 
    expect(result).toEqual(mockStats);
    });

    test('getRecentActivity harus mengambil log aktivitas dengan limit default (5)', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      
      await Bimbingan.getRecentActivity();

      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('LIMIT $1'), [5]);
    });

    test('getRecentActivity harus mengambil log aktivitas dengan limit kustom', async () => {
      pool.query.mockResolvedValue({ rows: [{}, {}, {}] });
      
      const result = await Bimbingan.getRecentActivity(3);

      expect(pool.query).toHaveBeenCalledWith(expect.stringContaining('LIMIT $1'), [3]);
      expect(result).toHaveLength(3);
    });
  });
});