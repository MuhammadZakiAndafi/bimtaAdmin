const { Pool } = require('pg');
require('dotenv').config({ path: '.env.test' });

class DBHelper {
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
  }

  async query(sql, params = []) {
    try {
      const result = await this.pool.query(sql, params);
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  // User helpers
  async createTestUser(userData) {
    const {
      user_id,
      nama,
      no_whatsapp,
      sandi,
      role,
      photo_url = '/uploads/photos/default-avatar.png',
      status_user = 'active',
    } = userData;

    const result = await this.query(
      `INSERT INTO users (user_id, nama, no_whatsapp, sandi, role, photo_url, status_user, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [user_id, nama, no_whatsapp, sandi, role, photo_url, status_user]
    );

    return result.rows[0];
  }

  async deleteTestUser(userId) {
    await this.query('DELETE FROM users WHERE user_id = $1', [userId]);
  }

  async getUserById(userId) {
    const result = await this.query('SELECT * FROM users WHERE user_id = $1', [userId]);
    return result.rows[0];
  }

  // Referensi helpers
  async createTestReferensi(data) {
    const { nim_mahasiswa, nama_mahasiswa, judul, topik, tahun, doc_url } = data;

    const result = await this.query(
      `INSERT INTO referensi_ta (nim_mahasiswa, nama_mahasiswa, judul, topik, tahun, doc_url, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [nim_mahasiswa, nama_mahasiswa, judul, topik, tahun, doc_url]
    );

    return result.rows[0];
  }

  async deleteTestReferensi(nimMahasiswa) {
    await this.query('DELETE FROM referensi_ta WHERE nim_mahasiswa = $1', [nimMahasiswa]);
  }

  async getReferensiById(nimMahasiswa) {
    const result = await this.query(
      'SELECT * FROM referensi_ta WHERE nim_mahasiswa = $1',
      [nimMahasiswa]
    );
    return result.rows[0];
  }

  // Bimbingan helpers
  async createTestBimbingan(data) {
    const { mahasiswa_id, dosen_id, status_bimbingan = 'ongoing', total_bimbingan = 0 } = data;

    const result = await this.query(
      `INSERT INTO bimbingan (mahasiswa_id, dosen_id, status_bimbingan, total_bimbingan, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [mahasiswa_id, dosen_id, status_bimbingan, total_bimbingan]
    );

    return result.rows[0];
  }

  async deleteTestBimbingan(bimbinganId) {
    await this.query('DELETE FROM bimbingan WHERE bimbingan_id = $1', [bimbinganId]);
  }

  // Progress helpers
  async createTestProgress(data) {
    const { bimbingan_id, subject_progress, description_progress, status_progress = 'need_revision' } = data;

    const result = await this.query(
      `INSERT INTO progress (bimbingan_id, subject_progress, description_progress, status_progress, datetime, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW(), NOW())
       RETURNING *`,
      [bimbingan_id, subject_progress, description_progress, status_progress]
    );

    return result.rows[0];
  }

  async deleteTestProgress(progressId) {
    await this.query('DELETE FROM progress WHERE progress_id = $1', [progressId]);
  }

  // Cleanup helpers
  async cleanupTestData() {
    // Delete test data created during testing
    await this.query("DELETE FROM progress WHERE bimbingan_id IN (SELECT bimbingan_id FROM bimbingan WHERE mahasiswa_id LIKE 'test_%')");
    await this.query("DELETE FROM bimbingan WHERE mahasiswa_id LIKE 'test_%'");
    await this.query("DELETE FROM referensi_ta WHERE nim_mahasiswa LIKE 'test_%'");
    await this.query("DELETE FROM users WHERE user_id LIKE 'test_%'");
  }

  async close() {
    await this.pool.end();
  }

  // Utility to check database connection
  async checkConnection() {
    try {
      const result = await this.query('SELECT NOW()');
      return { success: true, time: result.rows[0].now };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get counts for validation
  async getCounts() {
    const userCount = await this.query('SELECT COUNT(*) FROM users');
    const referensiCount = await this.query('SELECT COUNT(*) FROM referensi_ta');
    const bimbinganCount = await this.query('SELECT COUNT(*) FROM bimbingan');
    const progressCount = await this.query('SELECT COUNT(*) FROM progress');

    return {
      users: parseInt(userCount.rows[0].count),
      referensi: parseInt(referensiCount.rows[0].count),
      bimbingan: parseInt(bimbinganCount.rows[0].count),
      progress: parseInt(progressCount.rows[0].count),
    };
  }
}

module.exports = DBHelper;