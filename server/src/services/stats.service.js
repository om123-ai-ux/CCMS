const { pool } = require('../config/db');

class StatsService {
  /**
   * Get overall system complaint metrics (Admin)
   */
  async getAdminStats() {
    // Status counts
    const [statusRows] = await pool.query(`
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'ASSIGNED' THEN 1 ELSE 0 END) AS assigned,
        SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) AS in_progress,
        SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) AS resolved
      FROM complaints
    `);

    // Category breakdown
    const [categoryRows] = await pool.query(`
      SELECT category, COUNT(*) AS count
      FROM complaints
      GROUP BY category
      ORDER BY count DESC
    `);

    // User counts
    const [userRows] = await pool.query(`
      SELECT 
        COUNT(*) AS total_users,
        SUM(CASE WHEN role = 'STUDENT' THEN 1 ELSE 0 END) AS total_students,
        SUM(CASE WHEN role = 'STAFF' THEN 1 ELSE 0 END) AS total_staff,
        SUM(CASE WHEN role = 'ADMIN' THEN 1 ELSE 0 END) AS total_admins
      FROM users
    `);

    return {
      complaints: {
        total: statusRows[0].total || 0,
        pending: Number(statusRows[0].pending) || 0,
        assigned: Number(statusRows[0].assigned) || 0,
        in_progress: Number(statusRows[0].in_progress) || 0,
        resolved: Number(statusRows[0].resolved) || 0
      },
      categories: categoryRows,
      users: {
        total: userRows[0].total_users || 0,
        students: Number(userRows[0].total_students) || 0,
        staff: Number(userRows[0].total_staff) || 0,
        admins: Number(userRows[0].total_admins) || 0
      }
    };
  }

  /**
   * Get student specific complaint counts
   */
  async getStudentStats(studentId) {
    const [rows] = await pool.query(`
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'ASSIGNED' THEN 1 ELSE 0 END) AS assigned,
        SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) AS in_progress,
        SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) AS resolved
      FROM complaints
      WHERE student_id = ?
    `, [studentId]);

    return {
      total: rows[0].total || 0,
      pending: Number(rows[0].pending) || 0,
      assigned: Number(rows[0].assigned) || 0,
      in_progress: Number(rows[0].in_progress) || 0,
      resolved: Number(rows[0].resolved) || 0
    };
  }

  /**
   * Get staff specific complaint counts
   */
  async getStaffStats(staffId) {
    const [rows] = await pool.query(`
      SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'ASSIGNED' THEN 1 ELSE 0 END) AS assigned,
        SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) AS in_progress,
        SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) AS resolved
      FROM complaints
      WHERE assigned_staff_id = ?
    `, [staffId]);

    return {
      total: rows[0].total || 0,
      assigned: Number(rows[0].assigned) || 0,
      in_progress: Number(rows[0].in_progress) || 0,
      resolved: Number(rows[0].resolved) || 0
    };
  }
}

module.exports = new StatsService();
