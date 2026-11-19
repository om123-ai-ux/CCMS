const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { generateToken } = require('../utils/jwt');

class AuthService {
  /**
   * Register a new user
   */
  async registerUser({ name, email, password, phone = null, department = null }) {
    // Check if user already exists
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      const error = new Error('An account with this email address already exists.');
      error.statusCode = 409;
      throw error;
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, role, phone, department)
       VALUES (?, ?, ?, 'STUDENT', ?, ?)`,
      [name, email, hashedPassword, phone || null, department || null]
    );

    const userId = result.insertId;

    // Fetch created user without password
    const user = await this.getUserById(userId);

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    return { user, token };
  }

  /**
   * Authenticate user with email and password
   */
  async loginUser({ email, password }) {
    // Query user
    const [rows] = await pool.query(
      'SELECT id, name, email, password, role, phone, department, created_at FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    const user = rows[0];

    // Verify password hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error('Invalid email or password.');
      error.statusCode = 401;
      throw error;
    }

    // Exclude password from returned user object
    delete user.password;

    // Generate JWT
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    return { user, token };
  }

  /**
   * Get user by ID (never returning password)
   */
  async getUserById(id) {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, phone, department, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  }
}

module.exports = new AuthService();
