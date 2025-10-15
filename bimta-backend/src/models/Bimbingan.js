const pool = require('../config/database');

class Bimbingan {
  static async findAll(filters = {}) {
    let query = `
      SELECT b.*, 
             d.nama as nama_dosen, 
             m.nama as nama_mahasiswa
      FROM bimbingan b
      JOIN users d ON b.dosen_id = d.user_id
      JOIN users m ON b.mahasiswa_id = m.user_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (filters.status_bimbingan) {
      query += ` AND b.status_bimbingan = $${paramCount}`;
      params.push(filters.status_bimbingan);
      paramCount++;
    }

    if (filters.dosen_id) {
      query += ` AND b.dosen_id = $${paramCount}`;
      params.push(filters.dosen_id);
      paramCount++;
    }

    if (filters.mahasiswa_id) {
      query += ` AND b.mahasiswa_id = $${paramCount}`;
      params.push(filters.mahasiswa_id);
      paramCount++;
    }

    query += ' ORDER BY b.bimbingan_id';

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findById(bimbinganId) {
    const result = await pool.query(
      `SELECT b.*, 
              d.nama as nama_dosen, 
              m.nama as nama_mahasiswa,
              m.user_id as nim
       FROM bimbingan b
       JOIN users d ON b.dosen_id = d.user_id
       JOIN users m ON b.mahasiswa_id = m.user_id
       WHERE b.bimbingan_id = $1`,
      [bimbinganId]
    );
    return result.rows[0];
  }

  static async countByStatus() {
    const result = await pool.query(`
      SELECT 
        status_bimbingan,
        COUNT(*) as total
      FROM bimbingan
      GROUP BY status_bimbingan
    `);
    return result.rows;
  }

  static async getRecentActivity(limit = 5) {
    const result = await pool.query(`
      SELECT 
        p.datetime,
        p.subject_progress as activity,
        m.nama as mahasiswa_nama,
        d.nama as dosen_nama
      FROM progress p
      JOIN bimbingan b ON p.bimbingan_id = b.bimbingan_id
      JOIN users m ON b.mahasiswa_id = m.user_id
      JOIN users d ON b.dosen_id = d.user_id
      ORDER BY p.datetime DESC
      LIMIT $1
    `, [limit]);
    return result.rows;
  }
}

module.exports = Bimbingan;