const LaporanController = require('./laporanController');
const pool = require('../config/database');
const ExcelJS = require('exceljs');

jest.mock('../config/database');
jest.mock('exceljs');

describe('LaporanController', () => {
  let mockReq, mockRes, mockNext;
  let mockPoolQuery; 
  let mockWriteBuffer, mockAddWorksheet, mockGetCell, mockAddRow, mockBufferData;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = { query: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(), 
      send: jest.fn(),      
    };
    mockNext = jest.fn();

    mockPoolQuery = jest.fn();
    pool.query = mockPoolQuery;

    mockBufferData = Buffer.from('excel-data');
    mockWriteBuffer = jest.fn().mockResolvedValue(mockBufferData);
    
    // Mocking Cell & Row untuk menangani Styling & Loop (Line 291-292)
    const mockCell = { style: {}, value: '', alignment: {}, border: {}, fill: {} };
    mockAddRow = jest.fn(() => ({ 
      eachCell: (cb) => { cb(mockCell, 1); }, // Menjalankan loop header & data
      getCell: jest.fn(() => mockCell) 
    }));

    ExcelJS.Workbook.mockImplementation(() => ({
      creator: '', created: null,
      addWorksheet: jest.fn().mockReturnValue({
        mergeCells: jest.fn(),
        getCell: jest.fn(() => mockCell),
        addRow: mockAddRow,
        columns: [], 
      }),
      xlsx: { writeBuffer: mockWriteBuffer },
    }));
  });

  describe('generateLaporan', () => {
    test('harus return 400 jika jenis_laporan kosong ', async () => {
      await LaporanController.generateLaporan(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
    test('harus mencakup filter tanggal Bulanan ', async () => {
      mockReq.query = { jenis_laporan: 'bulanan', start_date: '2025-01-01', end_date: '2025-01-31' };
      mockPoolQuery.mockResolvedValue({ rows: [] });

      await LaporanController.generateLaporan(mockReq, mockRes, mockNext);
      expect(mockPoolQuery).toHaveBeenCalledWith(expect.stringContaining('WHERE p.datetime'), expect.any(Array));
    });

    test('harus mencakup filter Semester lengkap', async () => {
      mockReq.query = { 
        jenis_laporan: 'semester', 
        start_date: '2025-01-01', 
        end_date: '2025-06-30', 
        program_studi: 'Informatika' 
      };
      mockPoolQuery.mockResolvedValue({ rows: [{ nama_dosen: 'Dosen A' }] });

      await LaporanController.generateLaporan(mockReq, mockRes, mockNext);
      // Memastikan WHERE AND terbentuk 
      expect(mockPoolQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE p.datetime BETWEEN $1 AND $2 AND d.user_id LIKE $3'),
        ['2025-01-01', '2025-06-30', '%Informatika%']
      );
    });

    test('harus menangani error di generateLaporan', async () => {
      mockReq.query = { jenis_laporan: 'bulanan' };
      const err = new Error('Database Error');
      mockPoolQuery.mockRejectedValue(err);

      await LaporanController.generateLaporan(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(err);
    });
  });

  describe('exportLaporanExcel', () => {
    test('harus mencakup loop Header & Row Styling', async () => {
      mockReq.query = { jenis_laporan: 'bulanan' };
      // Menyertakan data dengan status berbeda untuk branch warna
      const mockRows = [
        { status_bimbingan: 'done', nim: '1' },
        { status_bimbingan: 'ongoing', nim: '2' }
      ];
      mockPoolQuery.mockResolvedValue({ rows: mockRows });

      await LaporanController.exportLaporanExcel(mockReq, mockRes, mockNext);
      expect(mockRes.send).toHaveBeenCalled();
    });

    test('harus mencakup export Semester dengan filter', async () => {
      mockReq.query = { jenis_laporan: 'semester', program_studi: 'TI' };
      mockPoolQuery.mockResolvedValue({ rows: [{ nama_dosen: 'A' }] });

      await LaporanController.exportLaporanExcel(mockReq, mockRes, mockNext);
      expect(mockPoolQuery).toHaveBeenCalledWith(expect.stringContaining('WHERE d.user_id LIKE $1'), ['%TI%']);
    });
  });

  describe('getLaporanStatistik', () => {
    test('harus mencakup statistik tanpa filter tanggal', async () => {
      mockPoolQuery.mockResolvedValue({ rows: [{ total: 1 }] });
      await LaporanController.getLaporanStatistik(mockReq, mockRes, mockNext);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });
});