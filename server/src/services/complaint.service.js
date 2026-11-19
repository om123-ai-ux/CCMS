const { pool } = require('../config/db');

class ComplaintService {
  /**
   * Create a new complaint (Student)
   */
  async createComplaint({ studentId, title, description, category, attachmentUrl = null }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [insertResult] = await connection.query(
        `INSERT INTO complaints (student_id, title, description, category, status, attachment_url)
         VALUES (?, ?, ?, ?, 'PENDING', ?)`,
        [studentId, title, description, category, attachmentUrl]
      );

      const complaintId = insertResult.insertId;

      // Add audit history entry
      await connection.query(
        `INSERT INTO complaint_history
          (complaint_id, changed_by, previous_status, status, remarks)
         VALUES (?, ?, NULL, 'PENDING', ?)`,
        [complaintId, studentId, 'Complaint submitted by student.']
      );

      await connection.commit();

      return this.getComplaintById(complaintId);
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  /**
   * Get complaints with optional filtering
   * @param {Object} filters - { studentId, assignedStaffId, status, category, search, limit, offset }
   */
  async getComplaints(filters = {}) {
    let sql = `
      SELECT 
        c.id, c.title, c.description, c.category, c.status, c.attachment_url,
        c.created_at, c.updated_at,
        s.id AS student_id, s.name AS student_name, s.email AS student_email, s.department AS student_department, s.phone AS student_phone,
        st.id AS staff_id, st.name AS staff_name, st.email AS staff_email, st.department AS staff_department
      FROM complaints c
      JOIN users s ON c.student_id = s.id
      LEFT JOIN users st ON c.assigned_staff_id = st.id
      WHERE 1=1
    `;

    const params = [];

    if (filters.studentId) {
      sql += ` AND c.student_id = ?`;
      params.push(filters.studentId);
    }

    if (filters.assignedStaffId) {
      sql += ` AND c.assigned_staff_id = ?`;
      params.push(filters.assignedStaffId);
    }

    if (filters.status) {
      sql += ` AND c.status = ?`;
      params.push(filters.status);
    }

    if (filters.category) {
      sql += ` AND c.category = ?`;
      params.push(filters.category);
    }

    if (filters.search) {
      sql += ` AND (c.title LIKE ? OR c.description LIKE ? OR s.name LIKE ?)`;
      const searchParam = `%${filters.search}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    sql += ` ORDER BY c.created_at DESC`;

    if (filters.limit) {
      sql += ` LIMIT ? OFFSET ?`;
      params.push(parseInt(filters.limit, 10), parseInt(filters.offset || 0, 10));
    }

    const [rows] = await pool.query(sql, params);
    return rows;
  }

  /**
   * Get single complaint by ID with full details and audit history
   */
  async getComplaintById(complaintId) {
    const [complaintRows] = await pool.query(
      `SELECT 
        c.id, c.title, c.description, c.category, c.status, c.attachment_url,
        c.created_at, c.updated_at,
        s.id AS student_id, s.name AS student_name, s.email AS student_email, s.department AS student_department, s.phone AS student_phone,
        st.id AS staff_id, st.name AS staff_name, st.email AS staff_email, st.department AS staff_department
       FROM complaints c
       JOIN users s ON c.student_id = s.id
       LEFT JOIN users st ON c.assigned_staff_id = st.id
       WHERE c.id = ?`,
      [complaintId]
    );

    if (complaintRows.length === 0) {
      return null;
    }

    const complaint = complaintRows[0];

    // Fetch history
    const [historyRows] = await pool.query(
      `SELECT 
        h.id, h.previous_status, h.status, h.status AS new_status, h.remarks, h.created_at,
        u.id AS user_id, u.name AS user_name, u.role AS user_role
       FROM complaint_history h
       JOIN users u ON h.changed_by = u.id
       WHERE h.complaint_id = ?
       ORDER BY h.created_at ASC, h.id ASC`,
      [complaintId]
    );

    complaint.history = historyRows;
    return complaint;
  }

  /**
   * Assign a complaint to a staff member (Admin)
   */
  async assignStaff(complaintId, staffId, assignedByUserId, remarks = null) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Check complaint exists
      const [complaints] = await connection.query(
        'SELECT id, status, assigned_staff_id FROM complaints WHERE id = ? FOR UPDATE',
        [complaintId]
      );
      if (complaints.length === 0) {
        const error = new Error('Complaint not found.');
        error.statusCode = 404;
        throw error;
      }

      // Check staff exists and has STAFF role
      const [staff] = await connection.query(
        'SELECT id, name, role FROM users WHERE id = ? AND role = ?',
        [staffId, 'STAFF']
      );
      if (staff.length === 0) {
        const error = new Error('Staff member not found or user is not a staff member.');
        error.statusCode = 400;
        throw error;
      }

      // If status is PENDING, transition to ASSIGNED
      const currentStatus = complaints[0].status;
      const nextStatus = currentStatus === 'PENDING' ? 'ASSIGNED' : currentStatus;

      await connection.query(
        'UPDATE complaints SET assigned_staff_id = ?, status = ? WHERE id = ?',
        [staffId, nextStatus, complaintId]
      );

      const historyRemarks = remarks 
        ? `Assigned to ${staff[0].name}. Note: ${remarks}` 
        : `Assigned to staff member ${staff[0].name}.`;

      await connection.query(
        `INSERT INTO complaint_history
          (complaint_id, changed_by, previous_status, status, remarks)
         VALUES (?, ?, ?, ?, ?)`,
        [complaintId, assignedByUserId, currentStatus, nextStatus, historyRemarks]
      );

      await connection.commit();
      return this.getComplaintById(complaintId);
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }

  /**
   * Update complaint status (Admin or Assigned Staff)
   */
  async updateStatus(complaintId, newStatus, changedByUserId, remarks = null, userRole = null) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [complaints] = await connection.query(
        'SELECT id, status, assigned_staff_id FROM complaints WHERE id = ? FOR UPDATE',
        [complaintId]
      );

      if (complaints.length === 0) {
        const error = new Error('Complaint not found.');
        error.statusCode = 404;
        throw error;
      }

      const complaint = complaints[0];

      // If STAFF, verify they are assigned to this complaint
      if (userRole === 'STAFF' && complaint.assigned_staff_id !== changedByUserId) {
        const error = new Error('Forbidden: You can only update complaints assigned to you.');
        error.statusCode = 403;
        throw error;
      }

      await connection.query(
        'UPDATE complaints SET status = ? WHERE id = ?',
        [newStatus, complaintId]
      );

      const finalRemarks = remarks || `Status changed from ${complaint.status} to ${newStatus}.`;

      await connection.query(
        `INSERT INTO complaint_history
          (complaint_id, changed_by, previous_status, status, remarks)
         VALUES (?, ?, ?, ?, ?)`,
        [complaintId, changedByUserId, complaint.status, newStatus, finalRemarks]
      );

      await connection.commit();
      return this.getComplaintById(complaintId);
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  }
}

module.exports = new ComplaintService();
