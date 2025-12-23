const ReferensiController = require('./referensiController');

const ReferensiTA = require('../models/ReferensiTA');
const supabase = require('../config/supabase');


// Mock ReferensiTA dan supabase model
jest.mock('../models/ReferensiTA');
jest.mock('../config/supabase');

describe('ReferensiController', () => {
  let mockReq, mockRes, mockNext;

  let mockSupabaseUpload, mockSupabaseGetPublicUrl, mockSupabaseRemove;
  
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

    mockSupabaseUpload = jest.fn();
    mockSupabaseGetPublicUrl = jest.fn();
    mockSupabaseRemove = jest.fn();

    supabase.storage = {
      from: jest.fn(() => ({
        upload: mockSupabaseUpload,
        getPublicUrl: mockSupabaseGetPublicUrl,
        remove: mockSupabaseRemove,
      })),
    };
  });

  // TEST UNTUK getAllReferensi
  describe('getAllReferensi', () => {
    test('harus mengembalikan semua referensi dengan filter', async () => {
      mockReq.query = { search: 'test', tahun: '2025' };
      const mockData = [{ judul: 'Test Referensi' }];
      ReferensiTA.findAll.mockResolvedValue(mockData);

      await ReferensiController.getAllReferensi(mockReq, mockRes, mockNext);

      expect(ReferensiTA.findAll).toHaveBeenCalledWith({
        search: 'test',
        tahun: '2025',
        topik: undefined,
      });

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockData,
      });
    });
  });

  // TEST UNTUK getReferensiById
  describe('getReferensiById', () => {
    test('harus mengembalikan 404 jika referensi tidak ditemukan', async () => {
      mockReq.params.nim = '404';
      ReferensiTA.findById.mockResolvedValue(null);

      await ReferensiController.getReferensiById(mockReq, mockRes, mockNext);

      expect(ReferensiTA.findById).toHaveBeenCalledWith('404');
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Referensi tidak ditemukan',
      });
    });
  });

  // TEST UNTUK createReferensi
  describe('createReferensi', () => {
    test('harus return 400 jika data body tidak lengkap', async () => {
      await ReferensiController.createReferensi(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'NIM, nama mahasiswa, judul, topik, dan tahun harus diisi',
      }));
    });
    
    test('harus return 400 jika tidak ada file di-upload', async () => {
      mockReq.body = { nim_mahasiswa: '123', nama_mahasiswa: 'Test', judul: 'Test', topik: 'Test', tahun: '2025' };
      
      await ReferensiController.createReferensi(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'File PDF harus diupload',
      });
    });
    
    test('harus return 400 jika NIM sudah ada', async () => {
      mockReq.body = { nim_mahasiswa: '123', nama_mahasiswa: 'Test', judul: 'Test', topik: 'Test', tahun: '2025' };
      mockReq.file = { originalname: 'test.pdf', buffer: Buffer.from('test'), mimetype: 'application/pdf' };
      
      // Simulasikan NIM sudah ada
      ReferensiTA.findById.mockResolvedValue({ nim_mahasiswa: '123' });
      
      await ReferensiController.createReferensi(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'NIM mahasiswa sudah ada dalam referensi',
      });
    });

    test('harus berhasil membuat referensi baru (upload success)', async () => {
      mockReq.body = { nim_mahasiswa: '123', nama_mahasiswa: 'Test', judul: 'Test', topik: 'Test', tahun: '2025' };
      mockReq.file = { originalname: 'test.pdf', buffer: Buffer.from('test'), mimetype: 'application/pdf' };
      const mockPublicUrl = 'http://supabase.com/bimta/documents/file.pdf';
      const mockNewReferensi = { referensi_id: 1, ...mockReq.body, doc_url: mockPublicUrl };

      // Cek NIM (tidak ada)
      ReferensiTA.findById.mockResolvedValue(null);
      
      // Mock Supabase Upload (sukses)
      mockSupabaseUpload.mockResolvedValue({ data: {}, error: null });
      mockSupabaseGetPublicUrl.mockReturnValue({ data: { publicUrl: mockPublicUrl } });
      
      // Mock Model Create (sukses)
      ReferensiTA.create.mockResolvedValue(mockNewReferensi);

      await ReferensiController.createReferensi(mockReq, mockRes, mockNext);

      // Cek pemanggilan Supabase
      expect(supabase.storage.from).toHaveBeenCalledWith('bimta');
      expect(mockSupabaseUpload).toHaveBeenCalled();
      expect(mockSupabaseGetPublicUrl).toHaveBeenCalled();

      // Cek pemanggilan Model Create
      expect(ReferensiTA.create).toHaveBeenCalledWith(expect.objectContaining({
        nim_mahasiswa: '123',
        doc_url: mockPublicUrl,
        tahun: 2025, 
      }));

      // Cek respons
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Referensi berhasil ditambahkan',
        data: mockNewReferensi,
      });
    });

    test('harus memanggil next(error) jika upload Supabase gagal', async () => {
      mockReq.body = { nim_mahasiswa: '123', nama_mahasiswa: 'Test', judul: 'Test', topik: 'Test', tahun: '2025' };
      mockReq.file = { originalname: 'test.pdf', buffer: Buffer.from('test'), mimetype: 'application/pdf' };
      const mockError = new Error('Upload gagal: Supabase error');
      
      // Cek NIM (tidak ada)
      ReferensiTA.findById.mockResolvedValue(null);
      
      // Mock Supabase Upload (gagal)
      mockSupabaseUpload.mockResolvedValue({ data: null, error: { message: 'Supabase error' } });
      
      await ReferensiController.createReferensi(mockReq, mockRes, mockNext);

      // Cek bahwa error dilempar dan ditangkap oleh next()
      expect(mockNext).toHaveBeenCalledWith(mockError);
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  // TEST UNTUK updateReferensi 
  describe('updateReferensi', () => {
    test('harus berhasil update data TANPA file baru', async () => {
      mockReq.params.nim = '123';
      mockReq.body = { nama_mahasiswa: 'Nama Baru' };
      const mockOldData = { nim_mahasiswa: '123', nama_mahasiswa: 'Nama Lama', doc_url: 'http://example.com/storage/v1/object/public/bimta/documents/old.pdf', tahun: 2024 };
      const mockUpdatedData = { ...mockOldData, nama_mahasiswa: 'Nama Baru' };

      // Temukan data lama
      ReferensiTA.findById.mockResolvedValue(mockOldData);
      
      // Mock Model Update
      ReferensiTA.update.mockResolvedValue(mockUpdatedData);

      await ReferensiController.updateReferensi(mockReq, mockRes, mockNext);

      // Cek (tidak boleh ada interaksi Supabase)
      expect(mockSupabaseUpload).not.toHaveBeenCalled();
      expect(mockSupabaseRemove).not.toHaveBeenCalled();

      // Cek Model Update dipanggil dengan data yang benar (doc_url lama)
      expect(ReferensiTA.update).toHaveBeenCalledWith('123', {
        nama_mahasiswa: 'Nama Baru',
        judul: undefined, 
        topik: undefined, 
        tahun: 2024,
        doc_url: 'http://example.com/storage/v1/object/public/bimta/documents/old.pdf',
      });
      
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ data: mockUpdatedData }));
    });
    
    test('harus berhasil update data DENGAN file baru', async () => {
      mockReq.params.nim = '123';
      mockReq.body = { nama_mahasiswa: 'Nama Baru' };
      mockReq.file = { originalname: 'new.pdf', buffer: Buffer.from('new'), mimetype: 'application/pdf' };
      const mockOldData = { nim_mahasiswa: '123', nama_mahasiswa: 'Nama Lama', doc_url: 'http://example.com/storage/v1/object/public/bimta/documents/old.pdf', tahun: 2024 };
      const newUrl = 'http://supabase.com/bimta/documents/new.pdf';

      // Temukan data lama
      ReferensiTA.findById.mockResolvedValue(mockOldData);

      // Mock Supabase Upload (sukses)
      mockSupabaseUpload.mockResolvedValue({ data: {}, error: null });
      mockSupabaseGetPublicUrl.mockReturnValue({ data: { publicUrl: newUrl } });
      
      // Mock Supabase Delete (sukses)
      mockSupabaseRemove.mockResolvedValue({ error: null });
      
      // Mock Model Update
      ReferensiTA.update.mockResolvedValue({ ...mockOldData, nama_mahasiswa: 'Nama Baru', doc_url: newUrl });

      await ReferensiController.updateReferensi(mockReq, mockRes, mockNext);

      // Cek: Upload file baru
      expect(supabase.storage.from).toHaveBeenCalledWith('bimta');
      expect(mockSupabaseUpload).toHaveBeenCalled();
      
      // Cek: Hapus file lama (ekstrak path dari URL)
      expect(mockSupabaseRemove).toHaveBeenCalledWith(['documents/old.pdf']);

      // Cek Model Update dipanggil dengan URL baru
      expect(ReferensiTA.update).toHaveBeenCalledWith('123', expect.objectContaining({
        doc_url: newUrl,
      }));

      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
  });

  // TEST UNTUK deleteReferensi 
  describe('deleteReferensi', () => {
    test('harus berhasil menghapus referensi dan file di Supabase', async () => {
      mockReq.params.nim = '123';
      // BENAR:
const mockData = { nim_mahasiswa: '123', doc_url: 'http://example.com/storage/v1/object/public/bimta/documents/file-to-delete.pdf' };
      
      // Temukan data
      ReferensiTA.findById.mockResolvedValue(mockData);
      
      // Mock Supabase Delete
      mockSupabaseRemove.mockResolvedValue({ error: null });
      
      // Mock Model Delete
      ReferensiTA.delete.mockResolvedValue(true);

      await ReferensiController.deleteReferensi(mockReq, mockRes, mockNext);

      // Cek Supabase Remove
      expect(supabase.storage.from).toHaveBeenCalledWith('bimta');
      expect(mockSupabaseRemove).toHaveBeenCalledWith(['documents/file-to-delete.pdf']);
      
      // Cek Model Delete
      expect(ReferensiTA.delete).toHaveBeenCalledWith('123');
      
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Referensi berhasil dihapus',
      });
    });
  });
});