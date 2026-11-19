const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

class UserService {
  /**
   * Get all staff members for complaint assignment
   */
  async getAllStaff() {
    const [rows] = await pool.query(
      `SELECT id, name, email, department, phone, created_at,
        (SELECT COUNT(*) FROM complaints WHERE assigned_staff_id = users.id AND status != 'RESOLVED') AS active_assigned_count
       FROM users 
       WHERE role = 'STAFF'
       ORDER BY name ASC`
    );
    return rows;
  }

  /**
   * Get all users (Admin view)
   */
  async getAllUsers(roleFilter = null) {
    let sql = `SELECT id, name, email, role, phone, department, created_at FROM users`;
    const params = [];

    if (roleFilter) {
      sql += ` WHERE role = ?`;
      params.push(roleFilter);
    }

    sql += ` ORDER BY created_at DESC`;

    const [rows] = await pool.query(sql, params);
    return rows;
  }

  /**
   * Create staff member by Admin
   */
  async createStaff({ name, email, password, phone, department }) {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      const error = new Error('A user with this email already exists.');
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, role, phone, department)
       VALUES (?, ?, ?, 'STAFF', ?, ?)`,
      [name, email, hashedPassword, phone || null, department || null]
    );

    const [created] = await pool.query(
      'SELECT id, name, email, role, phone, department, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    return created[0];
  }
}

module.exports = new UserService();
