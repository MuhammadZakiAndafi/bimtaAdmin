const ReferensiTA = require('../models/ReferensiTA');
const supabase = require('../config/supabase');

class ReferensiController {
  // Helper function untuk upload file ke Supabase
  static async uploadToSupabase(file, folder = 'documents') {
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('bimta') // nama bucket di Supabase
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Upload gagal: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('bimta')
      .getPublicUrl(fileName);

    return publicUrl;
  }

  // Helper function untuk delete file dari Supabase
  static async deleteFromSupabase(fileUrl) {
    try {
      // Extract file path from URL
      const urlParts = fileUrl.split('/storage/v1/object/public/bimta/');
      if (urlParts.length < 2) return;
      
      const filePath = urlParts[1];

      const { error } = await supabase.storage
        .from('bimta')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting file:', error);
      }
    } catch (error) {
      console.error('Error in deleteFromSupabase:', error);
    }
  }

  // Get All Referensi
  static async getAllReferensi(req, res, next) {
    try {
      const { search, tahun, topik } = req.query;

      const filters = {};
      if (search) filters.search = search;
      if (tahun) filters.tahun = tahun;
      if (topik) filters.topik = topik;

      const referensiList = await ReferensiTA.findAll(filters);

      res.json({
        success: true,
        data: referensiList,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get Referensi by NIM
  static async getReferensiById(req, res, next) {
    try {
      const { nim } = req.params;

      const referensi = await ReferensiTA.findById(nim);

      if (!referensi) {
        return res.status(404).json({
          success: false,
          message: 'Referensi tidak ditemukan',
        });
      }

      res.json({
        success: true,
        data: referensi,
      });
    } catch (error) {
      next(error);
    }
  }

  // Create Referensi
  static async createReferensi(req, res, next) {
    try {
      const { nim_mahasiswa, nama_mahasiswa, judul, topik, tahun } = req.body;

      if (!nim_mahasiswa || !nama_mahasiswa || !judul || !topik || !tahun) {
        return res.status(400).json({
          success: false,
          message: 'NIM, nama mahasiswa, judul, topik, dan tahun harus diisi',
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'File PDF harus diupload',
        });
      }

      // Cek apakah NIM sudah ada
      const existing = await ReferensiTA.findById(nim_mahasiswa);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'NIM mahasiswa sudah ada dalam referensi',
        });
      }

      // Upload ke Supabase
      const docUrl = await ReferensiController.uploadToSupabase(req.file, 'documents');

      const data = {
        nim_mahasiswa,
        nama_mahasiswa,
        judul,
        topik,
        tahun: parseInt(tahun),
        doc_url: docUrl,
      };

      const newReferensi = await ReferensiTA.create(data);

      res.status(201).json({
        success: true,
        message: 'Referensi berhasil ditambahkan',
        data: newReferensi,
      });
    } catch (error) {
      next(error);
    }
  }

  // Update Referensi
  static async updateReferensi(req, res, next) {
    try {
      const { nim } = req.params;
      const { nama_mahasiswa, judul, topik, tahun } = req.body;

      const referensi = await ReferensiTA.findById(nim);

      if (!referensi) {
        return res.status(404).json({
          success: false,
          message: 'Referensi tidak ditemukan',
        });
      }

      let docUrl = referensi.doc_url;

      // Jika ada file baru
      if (req.file) {
        // Upload file baru ke Supabase
        docUrl = await ReferensiController.uploadToSupabase(req.file, 'documents');
        
        // Hapus file lama dari Supabase
        await ReferensiController.deleteFromSupabase(referensi.doc_url);
      }

      const data = {
        nama_mahasiswa: nama_mahasiswa || referensi.nama_mahasiswa,
        judul: judul || referensi.judul,
        topik: topik || referensi.topik,
        tahun: tahun ? parseInt(tahun) : referensi.tahun,
        doc_url: docUrl,
      };

      const updatedReferensi = await ReferensiTA.update(nim, data);

      res.json({
        success: true,
        message: 'Referensi berhasil diupdate',
        data: updatedReferensi,
      });
    } catch (error) {
      next(error);
    }
  }

  // Delete Referensi
  static async deleteReferensi(req, res, next) {
    try {
      const { nim } = req.params;

      const referensi = await ReferensiTA.findById(nim);

      if (!referensi) {
        return res.status(404).json({
          success: false,
          message: 'Referensi tidak ditemukan',
        });
      }

      // Hapus file dari Supabase
      await ReferensiController.deleteFromSupabase(referensi.doc_url);

      await ReferensiTA.delete(nim);

      res.json({
        success: true,
        message: 'Referensi berhasil dihapus',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReferensiController;