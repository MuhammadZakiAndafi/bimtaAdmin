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

    mockReq = {
      query: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(), 
      send: jest.fn(),      
    };
    mockNext = jest.fn();


    mockPoolQuery = jest.fn();
    pool.query = mockPoolQuery;

    mockBufferData = Buffer.from('ini file excel palsu');
    mockWriteBuffer = jest.fn().mockResolvedValue(mockBufferData);
    mockAddWorksheet = jest.fn();
    mockGetCell = jest.fn(() => ({ style: {}, value: '', alignment: {} }));
    mockAddRow = jest.fn(() => ({ 
      eachCell: jest.fn(),
      getCell: jest.fn(() => ({ fill: {} })) 
    }));

    ExcelJS.Workbook.mockImplementation(() => ({
      creator: '',
      created: null,
      addWorksheet: mockAddWorksheet.mockReturnValue({
        mergeCells: jest.fn(),
        getCell: mockGetCell,
        addRow: mockAddRow,
        columns: [], 
      }),
      xlsx: {
        writeBuffer: mockWriteBuffer,
      },
    }));
  });

  // TEST UNTUK generateLaporan
  describe('generateLaporan', () => {
    test('harus return 400 jika jenis_laporan tidak ada', async () => {
      await LaporanController.generateLaporan(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Jenis laporan harus dipilih',
      });
      expect(mockPoolQuery).not.toHaveBeenCalled();
    });

    test('harus membuat query bulanan dengan filter tanggal', async () => {
      mockReq.query = {
        jenis_laporan: 'bulanan',
        start_date: '2025-01-01',
        end_date: '2025-01-31',
      };
      const mockData = [{ bimbingan_id: 1, nama_mahasiswa: 'Test' }];
      mockPoolQuery.mockResolvedValue({ rows: mockData });

      await LaporanController.generateLaporan(mockReq, mockRes, mockNext);

      expect(mockPoolQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE p.datetime BETWEEN $1 AND $2'),
        ['2025-01-01', '2025-01-31']
      );
      
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          jenis_laporan: 'bulanan',
          periode: { start_date: '2025-01-01', end_date: '2025-01-31' },
          total_records: 1,
          laporan: mockData,
        },
      });
    });

    test('harus membuat query semester dengan filter tanggal dan prodi', async () => {
      mockReq.query = {
        jenis_laporan: 'semester',
        start_date: '2025-01-01',
        end_date: '2025-05-31',
        program_studi: 'TI',
      };
      const mockData = [{ nama_dosen: 'Dosen A', total_bimbingan: 5 }];
      mockPoolQuery.mockResolvedValue({ rows: mockData });

      await LaporanController.generateLaporan(mockReq, mockRes, mockNext);

      expect(mockPoolQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE p.datetime BETWEEN $1 AND $2 AND d.user_id LIKE $3'),
        ['2025-01-01', '2025-05-31', '%TI%']
      );

      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ laporan: mockData })
      }));
    });

    test('harus memanggil next(error) jika query gagal', async () => {
        mockReq.query = { jenis_laporan: 'bulanan' };
        const mockError = new Error('Database connection failed');
        mockPoolQuery.mockRejectedValue(mockError);

        await LaporanController.generateLaporan(mockReq, mockRes, mockNext);

        expect(mockRes.json).not.toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  // TEST UNTUK exportLaporanExcel
  describe('exportLaporanExcel', () => {
    test('harus return 404 jika tidak ada data untuk diexport', async () => {
      mockReq.query = { jenis_laporan: 'bulanan' };
      mockPoolQuery.mockResolvedValue({ rows: [] }); // Data kosong

      await LaporanController.exportLaporanExcel(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Tidak ada data untuk periode yang dipilih',
      });
    });

    test('harus berhasil generate dan send file excel', async () => {
      mockReq.query = { jenis_laporan: 'bulanan' };
      const mockData = [{ nim: '123', nama_mahasiswa: 'Test', status_bimbingan: 'done' }];
      mockPoolQuery.mockResolvedValue({ rows: mockData });

      await LaporanController.exportLaporanExcel(mockReq, mockRes, mockNext);

      expect(mockPoolQuery).toHaveBeenCalledTimes(1);
      expect(ExcelJS.Workbook).toHaveBeenCalledTimes(1);
      expect(mockAddWorksheet).toHaveBeenCalledWith('Laporan Bulanan');
      expect(mockWriteBuffer).toHaveBeenCalledTimes(1);
      
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Disposition', expect.stringContaining('Laporan_bulanan_')
      );
      
      expect(mockRes.send).toHaveBeenCalledWith(mockBufferData);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  // TEST UNTUK getLaporanStatistik
  describe('getLaporanStatistik', () => {
    test('harus mengembalikan statistik (dengan filter tanggal)', async () => {
      mockReq.query = { start_date: '2025-01-01', end_date: '2025-01-31' };

      const mockStatsData = [{ total_bimbingan: 10, total_progress: 50 }];
      const mockStatusData = [{ status_bimbingan: 'done', jumlah: 5 }];

      mockPoolQuery
        .mockResolvedValueOnce({ rows: mockStatsData })  
        .mockResolvedValueOnce({ rows: mockStatusData }); 

      await LaporanController.getLaporanStatistik(mockReq, mockRes, mockNext);

      expect(mockPoolQuery.mock.calls[0][0]).toContain('WHERE p.datetime BETWEEN $1 AND $2');
      expect(mockPoolQuery.mock.calls[0][1]).toEqual(['2025-01-01', '2025-01-31']);
      
      expect(mockPoolQuery.mock.calls[1][0]).toContain('GROUP BY status_bimbingan');

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          statistik_umum: mockStatsData[0],
          status_bimbingan: mockStatusData,
        },
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});