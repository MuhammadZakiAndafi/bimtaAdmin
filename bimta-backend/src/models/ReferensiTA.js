const pool = require('../config/database');

class ReferensiTA {
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM referensi_ta WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.search) {
      query += ` AND (judul ILIKE $${paramCount} OR nama_mahasiswa ILIKE $${paramCount} OR nim_mahasiswa ILIKE $${paramCount} OR topik ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    if (filters.tahun) {
      query += ` AND tahun = $${paramCount}`;
      params.push(filters.tahun);
      paramCount++;
    }

    if (filters.topik) {
      query += ` AND topik ILIKE $${paramCount}`;
      params.push(`%${filters.topik}%`);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findById(nimMahasiswa) {
    const result = await pool.query(
      'SELECT * FROM referensi_ta WHERE nim_mahasiswa = $1',
      [nimMahasiswa]
    );
    return result.rows[0];
  }

  static async create(data) {
    const { nim_mahasiswa, nama_mahasiswa, judul, topik, tahun, doc_url } = data;
    
    const result = await pool.query(
      `INSERT INTO referensi_ta (nim_mahasiswa, nama_mahasiswa, judul, topik, tahun, doc_url, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [nim_mahasiswa, nama_mahasiswa, judul, topik, tahun, doc_url]
    );
    
    return result.rows[0];
  }

  static async update(nimMahasiswa, data) {
    const { nama_mahasiswa, judul, topik, tahun, doc_url } = data;
    
    const result = await pool.query(
      `UPDATE referensi_ta 
       SET nama_mahasiswa = $1, judul = $2, topik = $3, tahun = $4, doc_url = $5, updated_at = NOW()
       WHERE nim_mahasiswa = $6
       RETURNING *`,
      [nama_mahasiswa, judul, topik, tahun, doc_url, nimMahasiswa]
    );
    
    return result.rows[0];
  }

  static async delete(nimMahasiswa) {
    const result = await pool.query(
      'DELETE FROM referensi_ta WHERE nim_mahasiswa = $1 RETURNING *',
      [nimMahasiswa]
    );
    return result.rows[0];
  }

  static async count() {
    const result = await pool.query('SELECT COUNT(*) as total FROM referensi_ta');
    return parseInt(result.rows[0].total);
  }

  // Method tambahan untuk mendapatkan list tahun yang tersedia
  static async getAvailableYears() {
    const result = await pool.query(
      'SELECT DISTINCT tahun FROM referensi_ta ORDER BY tahun DESC'
    );
    return result.rows.map(row => row.tahun);
  }

  // Method tambahan untuk mendapatkan list topik yang tersedia
  static async getAvailableTopics() {
    const result = await pool.query(
      'SELECT DISTINCT topik FROM referensi_ta WHERE topik IS NOT NULL ORDER BY topik ASC'
    );
    return result.rows.map(row => row.topik);
  }
}

module.exports = ReferensiTA;