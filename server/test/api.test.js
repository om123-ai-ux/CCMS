process.env.JWT_SECRET = 'test-secret-with-at-least-thirty-two-characters';

jest.mock('../src/config/db', () => ({
  pool: {
    query: jest.fn(),
    getConnection: jest.fn()
  }
}));

const bcrypt = require('bcryptjs');
const request = require('supertest');
const { pool } = require('../src/config/db');
const app = require('../src/app');

let state;

function findUser(id) {
  return state.users.find((user) => user.id === Number(id));
}

function complaintView(complaint) {
  const student = findUser(complaint.student_id);
  const staff = complaint.assigned_staff_id
    ? findUser(complaint.assigned_staff_id)
    : null;

  return {
    id: complaint.id,
    title: complaint.title,
    description: complaint.description,
    category: complaint.category,
    status: complaint.status,
    attachment_url: complaint.attachment_url,
    created_at: complaint.created_at,
    updated_at: complaint.updated_at,
    student_id: student.id,
    student_name: student.name,
    student_email: student.email,
    student_department: student.department,
    student_phone: student.phone,
    staff_id: staff ? staff.id : null,
    staff_name: staff ? staff.name : null,
    staff_email: staff ? staff.email : null,
    staff_department: staff ? staff.department : null
  };
}

function historyView(complaintId) {
  return state.history
    .filter((entry) => entry.complaint_id === Number(complaintId))
    .map((entry) => {
      const user = findUser(entry.changed_by);
      return {
        id: entry.id,
        previous_status: entry.previous_status,
        status: entry.status,
        new_status: entry.status,
        remarks: entry.remarks,
        created_at: entry.created_at,
        user_id: user.id,
        user_name: user.name,
        user_role: user.role
      };
    });
}

function dbRows(rows) {
  return [rows, []];
}

function mockPoolQuery(sql, params = []) {
  if (sql.includes('SELECT id FROM users WHERE email = ?')) {
    return dbRows(state.users.filter((user) => user.email === params[0]).map(({ id }) => ({ id })));
  }

  if (sql.includes('SELECT id, name, email, password, role, phone, department, created_at FROM users')) {
    const user = state.users.find((entry) => entry.email === params[0]);
    return dbRows(user ? [{ ...user }] : []);
  }

  if (sql.includes('INSERT INTO users')) {
    const [name, email, password, phone, department] = params;
    const user = {
      id: state.nextUserId++,
      name,
      email,
      password,
      role: 'STUDENT',
      phone,
      department,
      created_at: new Date(),
      updated_at: new Date()
    };
    state.users.push(user);
    return dbRows({ insertId: user.id });
  }

  if (sql.includes('SELECT id, name, email, role, phone, department, created_at, updated_at FROM users')) {
    const user = findUser(params[0]);
    if (!user) return dbRows([]);
    const { password, ...safeUser } = user;
    return dbRows([safeUser]);
  }

  if (sql.includes('FROM complaints c') && sql.includes('WHERE c.id = ?')) {
    const complaint = state.complaints.find((entry) => entry.id === Number(params[0]));
    return dbRows(complaint ? [complaintView(complaint)] : []);
  }

  if (sql.includes('FROM complaint_history h')) {
    return dbRows(historyView(params[0]));
  }

  if (sql.includes('FROM complaints c')) {
    let complaints = state.complaints;
    if (sql.includes('c.student_id = ?')) {
      complaints = complaints.filter((entry) => entry.student_id === Number(params[0]));
    }
    return dbRows(complaints.map(complaintView));
  }

  throw new Error(`Unexpected pool query: ${sql}`);
}

function createConnection() {
  return {
    beginTransaction: jest.fn().mockResolvedValue(),
    commit: jest.fn().mockResolvedValue(),
    rollback: jest.fn().mockResolvedValue(),
    release: jest.fn(),
    query: jest.fn(async (sql, params = []) => {
      if (sql.includes('INSERT INTO complaints')) {
        const [studentId, title, description, category, attachmentUrl] = params;
        const complaint = {
          id: state.nextComplaintId++,
          student_id: studentId,
          assigned_staff_id: null,
          title,
          description,
          category,
          status: 'PENDING',
          attachment_url: attachmentUrl,
          created_at: new Date(),
          updated_at: new Date()
        };
        state.complaints.push(complaint);
        return dbRows({ insertId: complaint.id });
      }

      if (sql.includes('SELECT id, status, assigned_staff_id FROM complaints')) {
        const complaint = state.complaints.find((entry) => entry.id === Number(params[0]));
        return dbRows(complaint ? [{
          id: complaint.id,
          status: complaint.status,
          assigned_staff_id: complaint.assigned_staff_id
        }] : []);
      }

      if (sql.includes('SELECT id, name, role FROM users')) {
        const staff = findUser(params[0]);
        return dbRows(staff && staff.role === params[1] ? [staff] : []);
      }

      if (sql.includes('UPDATE complaints SET assigned_staff_id')) {
        const [staffId, status, complaintId] = params;
        const complaint = state.complaints.find((entry) => entry.id === Number(complaintId));
        complaint.assigned_staff_id = Number(staffId);
        complaint.status = status;
        return dbRows({ affectedRows: 1 });
      }

      if (sql.includes('UPDATE complaints SET status')) {
        const [status, complaintId] = params;
        const complaint = state.complaints.find((entry) => entry.id === Number(complaintId));
        complaint.status = status;
        return dbRows({ affectedRows: 1 });
      }

      if (sql.includes('INSERT INTO complaint_history')) {
        const [complaintId, changedBy, previousStatus, status, remarks] = params.length === 3
          ? [params[0], params[1], null, 'PENDING', params[2]]
          : params;
        state.history.push({
          id: state.nextHistoryId++,
          complaint_id: Number(complaintId),
          changed_by: Number(changedBy),
          previous_status: previousStatus,
          status,
          remarks,
          created_at: new Date()
        });
        return dbRows({ insertId: state.nextHistoryId - 1 });
      }

      throw new Error(`Unexpected connection query: ${sql}`);
    })
  };
}

async function login(email) {
  const response = await request(app)
    .post('/api/auth/login')
    .send({ email, password: 'password123' });
  expect(response.status).toBe(200);
  return response.body.data.token;
}

beforeEach(async () => {
  const password = await bcrypt.hash('password123', 4);
  state = {
    nextUserId: 5,
    nextComplaintId: 1,
    nextHistoryId: 1,
    users: [
      { id: 1, name: 'Student One', email: 'student@campus.edu', password, role: 'STUDENT', phone: null, department: 'Engineering', created_at: new Date(), updated_at: new Date() },
      { id: 2, name: 'Campus Admin', email: 'admin@campus.edu', password, role: 'ADMIN', phone: null, department: 'Administration', created_at: new Date(), updated_at: new Date() },
      { id: 3, name: 'Staff One', email: 'staff@campus.edu', password, role: 'STAFF', phone: null, department: 'Maintenance', created_at: new Date(), updated_at: new Date() },
      { id: 4, name: 'Staff Two', email: 'staff2@campus.edu', password, role: 'STAFF', phone: null, department: 'Electrical', created_at: new Date(), updated_at: new Date() }
    ],
    complaints: [],
    history: []
  };

  pool.query.mockImplementation(mockPoolQuery);
  pool.getConnection.mockImplementation(createConnection);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('CCMS API', () => {
  test('registration creates only students, login returns a token, and /me requires that token', async () => {
    const escalation = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Bad Actor', email: 'admin2@campus.edu', password: 'password123', role: 'ADMIN' });
    expect(escalation.status).toBe(400);

    const registration = await request(app)
      .post('/api/auth/register')
      .send({ name: 'New Student', email: 'new@campus.edu', password: 'password123', role: 'STUDENT' });
    expect(registration.status).toBe(201);
    expect(registration.body.data.user.role).toBe('STUDENT');
    expect(registration.body.data.user.password).toBeUndefined();

    const unauthenticated = await request(app).get('/api/auth/me');
    expect(unauthenticated.status).toBe(401);

    const token = await login('new@campus.edu');
    const profile = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(profile.status).toBe(200);
    expect(profile.body.data.email).toBe('new@campus.edu');
    expect(profile.body.data.password).toBeUndefined();
  });

  test('unknown API paths return 404 rather than the SPA fallback', async () => {
    const response = await request(app).get('/api/not-a-route');
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });

  test('students can create and list only their own complaints', async () => {
    state.complaints.push({
      id: state.nextComplaintId++,
      student_id: 2,
      assigned_staff_id: null,
      title: 'Private complaint',
      description: 'Belongs to a different student.',
      category: 'Hostel',
      status: 'PENDING',
      attachment_url: null,
      created_at: new Date(),
      updated_at: new Date()
    });
    const token = await login('student@campus.edu');
    const created = await request(app)
      .post('/api/complaints')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Broken classroom projector',
        description: 'The projector in room 101 is not working.',
        category: 'IT and Wi-Fi'
      });

    expect(created.status).toBe(201);
    expect(created.body.data.status).toBe('PENDING');
    expect(created.body.data.history[0]).toMatchObject({
      previous_status: null,
      new_status: 'PENDING',
      user_id: 1
    });

    const list = await request(app)
      .get('/api/complaints')
      .set('Authorization', `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);
    expect(list.body.data[0].student_id).toBe(1);

    const privateComplaint = await request(app)
      .get('/api/complaints/1')
      .set('Authorization', `Bearer ${token}`);
    expect(privateComplaint.status).toBe(403);
  });

  test('admins assign complaints, assigned staff update status, and history records both statuses', async () => {
    state.complaints.push({
      id: state.nextComplaintId++,
      student_id: 1,
      assigned_staff_id: null,
      title: 'Damaged electrical outlet',
      description: 'The outlet in the library is damaged.',
      category: 'Electrical',
      status: 'PENDING',
      attachment_url: null,
      created_at: new Date(),
      updated_at: new Date()
    });
    state.history.push({
      id: state.nextHistoryId++,
      complaint_id: 1,
      changed_by: 1,
      previous_status: null,
      status: 'PENDING',
      remarks: 'Complaint submitted by student.',
      created_at: new Date()
    });

    const adminToken = await login('admin@campus.edu');
    const studentToken = await login('student@campus.edu');
    const forbiddenAssignment = await request(app)
      .put('/api/complaints/1/assign')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ staffId: 3 });
    expect(forbiddenAssignment.status).toBe(403);

    const assignment = await request(app)
      .put('/api/complaints/1/assign')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ staffId: 3, remarks: 'Assign to maintenance.' });
    expect(assignment.status).toBe(200);
    expect(assignment.body.data.status).toBe('ASSIGNED');
    expect(assignment.body.data.history[1]).toMatchObject({
      previous_status: 'PENDING',
      new_status: 'ASSIGNED',
      user_id: 2
    });

    const staffToken = await login('staff@campus.edu');
    const assignedComplaints = await request(app)
      .get('/api/complaints')
      .set('Authorization', `Bearer ${staffToken}`);
    expect(assignedComplaints.status).toBe(200);
    expect(assignedComplaints.body.data).toHaveLength(1);

    const update = await request(app)
      .put('/api/complaints/1/status')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ status: 'IN_PROGRESS', remarks: 'Repair started.' });
    expect(update.status).toBe(200);
    expect(update.body.data.status).toBe('IN_PROGRESS');
    expect(update.body.data.history[2]).toMatchObject({
      previous_status: 'ASSIGNED',
      new_status: 'IN_PROGRESS',
      user_id: 3
    });

    const otherStaffToken = await login('staff2@campus.edu');
    const forbiddenUpdate = await request(app)
      .put('/api/complaints/1/status')
      .set('Authorization', `Bearer ${otherStaffToken}`)
      .send({ status: 'RESOLVED' });
    expect(forbiddenUpdate.status).toBe(403);

    const history = await request(app)
      .get('/api/complaints/1/history')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(history.status).toBe(200);
    expect(history.body.data).toHaveLength(3);
  });
});
