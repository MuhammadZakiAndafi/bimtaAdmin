const ReferensiTA = require('./ReferensiTA');
const pool = require('../config/database');

jest.mock('../config/database');

describe('ReferensiTA Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    test('harus mengambil semua data tanpa filter (default parameter)', async () => {
      pool.query.mockResolvedValue({ rows: [{ id: 1 }] });
      
      const result = await ReferensiTA.findAll(); // Menguji default filters = {}
      
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM referensi_ta WHERE 1=1 ORDER BY created_at DESC'),
        []
      );
      expect(result).toHaveLength(1);
    });

    test('harus menangani semua filter (search, tahun, topik) secara bersamaan', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      const filters = { search: 'IoT', tahun: 2023, topik: 'Web' };
      
      await ReferensiTA.findAll(filters);
      
      // Memastikan urutan parameter $1, $2, $3 benar sesuai logika kode
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE $1'),
        expect.arrayContaining(['%IoT%', 2023, '%Web%'])
      );
    });

    test('harus menangani filter parsial (hanya tahun)', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      
      await ReferensiTA.findAll({ tahun: 2024 });
      
      // Jika hanya tahun, maka tahun harus menjadi $1
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE 1=1 AND tahun = $1'),
        [2024]
      );
    });
  });

  describe('findById', () => {
    test('harus mengembalikan data berdasarkan nim_mahasiswa', async () => {
      const mockData = { nim_mahasiswa: '12345', nama_mahasiswa: 'Budi' };
      pool.query.mockResolvedValue({ rows: [mockData] });

      const result = await ReferensiTA.findById('12345');

      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM referensi_ta WHERE nim_mahasiswa = $1',
        ['12345']
      );
      expect(result).toEqual(mockData);
    });

    test('harus mengembalikan undefined jika data tidak ditemukan', async () => {
      pool.query.mockResolvedValue({ rows: [] });
      const result = await ReferensiTA.findById('999');
      expect(result).toBeUndefined();
    });
  });

  describe('CRUD Operations', () => {
    test('create harus menjalankan query INSERT dengan benar', async () => {
      const data = { 
        nim_mahasiswa: '123', nama_mahasiswa: 'A', judul: 'J', 
        topik: 'T', tahun: 2023, doc_url: 'url' 
      };
      pool.query.mockResolvedValue({ rows: [data] });

      const result = await ReferensiTA.create(data);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO referensi_ta'),
        ['123', 'A', 'J', 'T', 2023, 'url']
      );
      expect(result.nim_mahasiswa).toBe('123');
    });

    test('update harus menjalankan query UPDATE berdasarkan NIM', async () => {
        const data = { nama_mahasiswa: 'A Edit', judul: 'J', topik: 'T', tahun: 2023, doc_url: 'url' };
        pool.query.mockResolvedValue({ rows: [{ ...data, nim_mahasiswa: '123' }] });

        await ReferensiTA.update('123', data);

        expect(pool.query).toHaveBeenCalledWith(
            // Gunakan string yang lebih pendek agar tidak terganggu baris baru/spasi
            expect.stringContaining('UPDATE referensi_ta'), 
            ['A Edit', 'J', 'T', 2023, 'url', '123']
        );
        });

    test('delete harus menghapus data berdasarkan NIM', async () => {
      pool.query.mockResolvedValue({ rows: [{ nim_mahasiswa: '123' }] });
      
      await ReferensiTA.delete('123');
      
      expect(pool.query).toHaveBeenCalledWith(
        'DELETE FROM referensi_ta WHERE nim_mahasiswa = $1 RETURNING *',
        ['123']
      );
    });
  });

  describe('Utility Methods', () => {
    test('count harus mengembalikan angka total data', async () => {
      pool.query.mockResolvedValue({ rows: [{ total: '25' }] });
      const count = await ReferensiTA.count();
      expect(count).toBe(25);
    });

    test('getAvailableYears & getAvailableTopics harus memetakan array hasil query', async () => {
      // Test Years
      pool.query.mockResolvedValueOnce({ rows: [{ tahun: 2023 }, { tahun: 2022 }] });
      const years = await ReferensiTA.getAvailableYears();
      expect(years).toEqual([2023, 2022]);

      // Test Topics
      pool.query.mockResolvedValueOnce({ rows: [{ topik: 'AI' }, { topik: 'Web' }] });
      const topics = await ReferensiTA.getAvailableTopics();
      expect(topics).toEqual(['AI', 'Web']);
    });
  });
});