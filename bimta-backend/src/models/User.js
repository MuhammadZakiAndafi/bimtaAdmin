const pool = require('../config/database');

class User {
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM users WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.role) {
      query += ` AND role = $${paramCount}`;
      params.push(filters.role);
      paramCount++;
    }

    if (filters.status_user) {
      query += ` AND status_user = $${paramCount}`;
      params.push(filters.status_user);
      paramCount++;
    }

    if (filters.search) {
      query += ` AND (nama ILIKE $${paramCount} OR user_id ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findById(userId) {
    const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
    return result.rows[0];
  }

  static async findByUserIdWithPassword(userId) {
    const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);
    return result.rows[0];
  }

  static async create(userData) {
    const {
      user_id,
      nama,
      no_whatsapp,
      sandi,
      role,
      photo_url,
      status_user,
    } = userData;

    const result = await pool.query(
      `INSERT INTO users (user_id, nama, no_whatsapp, sandi, role, photo_url, status_user, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [user_id, nama, no_whatsapp, sandi, role, photo_url, status_user]
    );

    return result.rows[0];
  }

  static async update(userId, userData) {
    const {
      nama,
      no_whatsapp,
      photo_url,
      status_user,
    } = userData;

    const result = await pool.query(
      `UPDATE users 
       SET nama = $1, no_whatsapp = $2, photo_url = $3, status_user = $4, updated_at = NOW()
       WHERE user_id = $5
       RETURNING *`,
      [nama, no_whatsapp, photo_url, status_user, userId]
    );

    return result.rows[0];
  }

  static async updatePassword(userId, hashedPassword) {
    const result = await pool.query(
      `UPDATE users SET sandi = $1, updated_at = NOW() WHERE user_id = $2 RETURNING *`,
      [hashedPassword, userId]
    );

    return result.rows[0];
  }

  static async delete(userId) {
    const result = await pool.query('DELETE FROM users WHERE user_id = $1 RETURNING *', [userId]);
    return result.rows[0];
  }

  static async countByRole() {
    const result = await pool.query(`
      SELECT 
        role,
        COUNT(*) as total
      FROM users
      GROUP BY role
    `);
    return result.rows;
  }

  static async countByStatus() {
    const result = await pool.query(`
      SELECT 
        status_user,
        COUNT(*) as total
      FROM users
      WHERE role IN ('mahasiswa', 'dosen')
      GROUP BY status_user
    `);
    return result.rows;
  }
}

module.exports = User;