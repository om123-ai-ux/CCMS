const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const config = require('../config/env');

async function initializeDatabase(forceReset = false) {
  console.log('[DB Init] Connecting to MySQL database...');

  const connection = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    multipleStatements: true
  });

  try {
    if (!forceReset) {
      try {
        const [cols] = await connection.query('DESCRIBE users');
        const colNames = cols.map((c) => c.Field);
        if (!colNames.includes('name') || !colNames.includes('password')) {
          throw new Error(
            'Existing users table is incompatible. Back up the database before explicitly resetting it with --force.'
          );
        }
      } catch (err) {
        if (err.code !== 'ER_NO_SUCH_TABLE') {
          throw err;
        }
      }
    }

    if (forceReset) {
      console.warn('[DB Init] Explicit reset requested; dropping CCMS tables.');
      await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
      await connection.query('DROP TABLE IF EXISTS complaint_history;');
      await connection.query('DROP TABLE IF EXISTS complaints;');
      await connection.query('DROP TABLE IF EXISTS users;');
      await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
    }

    console.log('[DB Init] Creating CCMS1 tables...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await connection.query(schemaSql);
    const [historyColumns] = await connection.query('SHOW COLUMNS FROM complaint_history');
    if (!historyColumns.some((column) => column.Field === 'previous_status')) {
      await connection.query(
        `ALTER TABLE complaint_history
         ADD COLUMN previous_status ENUM('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED') DEFAULT NULL
         AFTER changed_by`
      );
    }
    console.log('[DB Init] Tables created successfully.');

    // Seed default users if table is empty
    const [userCountRows] = await connection.query('SELECT COUNT(*) AS count FROM users');
    if (userCountRows[0].count === 0) {
      console.log('[DB Init] Seeding initial users...');

      const adminPassword = await bcrypt.hash('Admin@123', 10);
      const staffPassword = await bcrypt.hash('Staff@123', 10);
      const studentPassword = await bcrypt.hash('Student@123', 10);

      // Insert Admin
      const [adminResult] = await connection.query(
        `INSERT INTO users (name, email, password, role, phone, department)
         VALUES (?, ?, ?, 'ADMIN', ?, ?)`,
        ['Campus Administrator', 'admin@campus.edu', adminPassword, '9998887770', 'Administration']
      );

      // Insert Staff
      const [itStaffResult] = await connection.query(
        `INSERT INTO users (name, email, password, role, phone, department)
         VALUES (?, ?, ?, 'STAFF', ?, ?)`,
        ['Rahul Sharma (IT Support)', 'staff.it@campus.edu', staffPassword, '9876500001', 'IT and Wi-Fi']
      );

      const [elecStaffResult] = await connection.query(
        `INSERT INTO users (name, email, password, role, phone, department)
         VALUES (?, ?, ?, 'STAFF', ?, ?)`,
        ['Vikram Verma (Electrical)', 'staff.elec@campus.edu', staffPassword, '9876500002', 'Electrical']
      );

      // Insert Students
      const [student1Result] = await connection.query(
        `INSERT INTO users (name, email, password, role, phone, department)
         VALUES (?, ?, ?, 'STUDENT', ?, ?)`,
        ['Aarav Patel', 'student@campus.edu', studentPassword, '9876543210', 'Computer Science - Hostel B']
      );

      const [student2Result] = await connection.query(
        `INSERT INTO users (name, email, password, role, phone, department)
         VALUES (?, ?, ?, 'STUDENT', ?, ?)`,
        ['Ananya Rao', 'ananya@campus.edu', studentPassword, '9876543211', 'Electronics Engg - Hostel A']
      );

      console.log('[DB Init] Users seeded. Seeding sample complaints...');

      // Sample Complaint 1: Wi-Fi issue in Hostel B (In Progress)
      const [c1] = await connection.query(
        `INSERT INTO complaints (student_id, assigned_staff_id, title, description, category, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          student1Result.insertId,
          itStaffResult.insertId,
          'Wi-Fi router in Hostel B Floor 2 dropping connection',
          'Students on the 2nd floor of Hostel B are unable to access the campus Wi-Fi network since yesterday evening.',
          'IT and Wi-Fi',
          'IN_PROGRESS'
        ]
      );

      await connection.query(
        `INSERT INTO complaint_history
          (complaint_id, changed_by, previous_status, status, remarks) VALUES
         (?, ?, NULL, 'PENDING', 'Complaint submitted by student.'),
         (?, ?, 'PENDING', 'ASSIGNED', 'Assigned to IT Support by Campus Administrator.'),
         (?, ?, 'ASSIGNED', 'IN_PROGRESS', 'Technician dispatched to replace the access point firmware.')`,
        [
          c1.insertId, student1Result.insertId,
          c1.insertId, adminResult.insertId,
          c1.insertId, itStaffResult.insertId
        ]
      );

      // Sample Complaint 2: Library AC water leakage (Pending)
      const [c2] = await connection.query(
        `INSERT INTO complaints (student_id, title, description, category, status)
         VALUES (?, ?, ?, ?, 'PENDING')`,
        [
          student2Result.insertId,
          'Water leakage from AC unit in Central Library reading hall',
          'The split air conditioner near the reference section on 1st floor is leaking water on the floor desks.',
          'Electrical'
        ]
      );

      await connection.query(
        `INSERT INTO complaint_history
          (complaint_id, changed_by, previous_status, status, remarks) VALUES
         (?, ?, NULL, 'PENDING', 'Complaint submitted by student.')`,
        [c2.insertId, student2Result.insertId]
      );

      // Sample Complaint 3: Water cooler filter (Resolved)
      const [c3] = await connection.query(
        `INSERT INTO complaints (student_id, assigned_staff_id, title, description, category, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          student1Result.insertId,
          elecStaffResult.insertId,
          'Water dispenser filter replacement in Academic Block 3',
          'The drinking water dispenser is showing red indicator light for filter change.',
          'Cleaning',
          'RESOLVED'
        ]
      );

      await connection.query(
        `INSERT INTO complaint_history
          (complaint_id, changed_by, previous_status, status, remarks) VALUES
         (?, ?, NULL, 'PENDING', 'Complaint submitted by student.'),
         (?, ?, 'PENDING', 'ASSIGNED', 'Assigned to maintenance staff.'),
         (?, ?, 'ASSIGNED', 'IN_PROGRESS', 'Replacement filter ordered and installed.'),
         (?, ?, 'IN_PROGRESS', 'RESOLVED', 'Filter replaced and water quality tested clean.')`,
        [
          c3.insertId, student1Result.insertId,
          c3.insertId, adminResult.insertId,
          c3.insertId, elecStaffResult.insertId,
          c3.insertId, elecStaffResult.insertId
        ]
      );

      console.log('[DB Init] Seed data inserted successfully!');
    }

    console.log('[DB Init] Database initialization complete!');
  } catch (err) {
    console.error('[DB Init Error]:', err.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  const force = process.argv.includes('--force') || process.argv.includes('--reset');
  initializeDatabase(force);
}

module.exports = initializeDatabase;
