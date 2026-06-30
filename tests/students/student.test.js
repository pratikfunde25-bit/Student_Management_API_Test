/**
 * STUDENT CRUD API TESTS
 * Tests: Auth guard, RBAC, Create, Read, Update, Delete, Pagination, Validation
 */
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Student = require('../../src/models/Student');

// ─── Test helpers ────────────────────────────────────────────
const getToken = async (role = 'admin') => {
  const email = `${role}_${Date.now()}@test.com`;
  const res = await request(app).post('/api/v1/auth/register').send({
    name: `Test ${role}`,
    email,
    password: 'Password123!',
    role,
  });
  return res.body.data.token;
};

const validStudent = {
  rollNumber: 'S001',
  firstName: 'Pratik',
  lastName: 'Funde',
  className: 'MCA',
  section: 'A',
  guardianName: 'John Doe',
};

let adminToken;
let teacherToken;
let studentToken;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student-management-test');
  // Get tokens for all three roles
  adminToken = await getToken('admin');
  teacherToken = await getToken('teacher');
  studentToken = await getToken('student');
});

afterAll(async () => {
  await Student.deleteMany({});
  await User.deleteMany({ email: /test\.com$/ });
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Student.deleteMany({});
});

// ════════════════════════════════════════════════════════════════
// GET /students - LIST
// ════════════════════════════════════════════════════════════════
describe('GET /api/v1/students', () => {
  it('✅ admin can list students', async () => {
    const res = await request(app).get('/api/v1/students')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items).toBeInstanceOf(Array);
    expect(res.body.data.pagination).toBeDefined();
  });

  it('✅ teacher can list students', async () => {
    const res = await request(app).get('/api/v1/students')
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(res.status).toBe(200);
  });

  it('❌ student role is FORBIDDEN from listing', async () => {
    const res = await request(app).get('/api/v1/students')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(403);
  });

  it('❌ unauthenticated request is rejected', async () => {
    const res = await request(app).get('/api/v1/students');
    expect(res.status).toBe(401);
  });

  it('✅ pagination works correctly', async () => {
    // Create 5 students first
    for (let i = 1; i <= 5; i++) {
      await request(app).post('/api/v1/students')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...validStudent, rollNumber: `S00${i}` });
    }
    const res = await request(app).get('/api/v1/students?page=2&limit=2')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBeLessThanOrEqual(2);
    expect(Number(res.body.data.pagination.page)).toBe(2);
  });

  it('✅ filter by status works', async () => {
    await request(app).post('/api/v1/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validStudent, status: 'graduated' });
    const res = await request(app).get('/api/v1/students?status=graduated')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    res.body.data.items.forEach(s => expect(s.status).toBe('graduated'));
  });

  it('❌ rejects invalid pagination limit > 100', async () => {
    const res = await request(app).get('/api/v1/students?limit=999')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(400);
  });
});

// ════════════════════════════════════════════════════════════════
// POST /students - CREATE
// ════════════════════════════════════════════════════════════════
describe('POST /api/v1/students', () => {
  it('✅ admin can create a student', async () => {
    const res = await request(app).post('/api/v1/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validStudent);
    expect(res.status).toBe(201);
    expect(res.body.data.student._id).toBeDefined();
    expect(res.body.data.student.fullName).toBe('Pratik Funde');
  });

  it('✅ teacher can create a student', async () => {
    const res = await request(app).post('/api/v1/students')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ ...validStudent, rollNumber: 'T001' });
    expect(res.status).toBe(201);
  });

  it('❌ student role CANNOT create a student', async () => {
    const res = await request(app).post('/api/v1/students')
      .set('Authorization', `Bearer ${studentToken}`)
      .send(validStudent);
    expect(res.status).toBe(403);
  });

  it('❌ duplicate rollNumber is rejected', async () => {
    await request(app).post('/api/v1/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validStudent);
    const res = await request(app).post('/api/v1/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validStudent);
    expect(res.status).toBe(409);
  });

  it('❌ missing required field (firstName) is rejected', async () => {
    const { firstName, ...body } = validStudent;
    const res = await request(app).post('/api/v1/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(body);
    expect(res.status).toBe(400);
  });

  it('❌ missing required field (guardianName) is rejected', async () => {
    const { guardianName, ...body } = validStudent;
    const res = await request(app).post('/api/v1/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(body);
    expect(res.status).toBe(400);
  });

  it('❌ invalid status value is rejected', async () => {
    const res = await request(app).post('/api/v1/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validStudent, status: 'unknown' });
    expect(res.status).toBe(400);
  });

  it('❌ invalid gender value is rejected', async () => {
    const res = await request(app).post('/api/v1/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validStudent, gender: 'attack_helicopter' });
    expect(res.status).toBe(400);
  });

  it('❌ firstName shorter than 2 characters is rejected', async () => {
    const res = await request(app).post('/api/v1/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...validStudent, firstName: 'X' });
    expect(res.status).toBe(400);
  });
});

// ════════════════════════════════════════════════════════════════
// GET /students/:id - READ ONE
// ════════════════════════════════════════════════════════════════
describe('GET /api/v1/students/:id', () => {
  let studentId;

  beforeEach(async () => {
    const res = await request(app).post('/api/v1/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validStudent);
    studentId = res.body.data.student._id;
  });

  it('✅ can get a student by valid ID', async () => {
    const res = await request(app).get(`/api/v1/students/${studentId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.student._id).toBe(studentId);
  });

  it('❌ returns 404 for a non-existent ID', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/v1/students/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  it('❌ returns 400 for a malformed ID', async () => {
    const res = await request(app).get('/api/v1/students/not-a-valid-id')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(400);
  });
});

// ════════════════════════════════════════════════════════════════
// PATCH /students/:id - UPDATE
// ════════════════════════════════════════════════════════════════
describe('PATCH /api/v1/students/:id', () => {
  let studentId;

  beforeEach(async () => {
    const res = await request(app).post('/api/v1/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validStudent);
    studentId = res.body.data.student._id;
  });

  it('✅ admin can update a student', async () => {
    const res = await request(app).patch(`/api/v1/students/${studentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ firstName: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.data.student.firstName).toBe('Updated');
  });

  it('✅ teacher can update a student', async () => {
    const res = await request(app).patch(`/api/v1/students/${studentId}`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ status: 'graduated' });
    expect(res.status).toBe(200);
  });

  it('❌ student role CANNOT update', async () => {
    const res = await request(app).patch(`/api/v1/students/${studentId}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ firstName: 'Hacker' });
    expect(res.status).toBe(403);
  });

  it('❌ returns 404 when updating a non-existent student', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app).patch(`/api/v1/students/${fakeId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ firstName: 'Ghost' });
    expect(res.status).toBe(404);
  });

  it('❌ rejects empty update body', async () => {
    const res = await request(app).patch(`/api/v1/students/${studentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect(res.status).toBe(400);
  });
});

// ════════════════════════════════════════════════════════════════
// DELETE /students/:id
// ════════════════════════════════════════════════════════════════
describe('DELETE /api/v1/students/:id', () => {
  let studentId;

  beforeEach(async () => {
    const res = await request(app).post('/api/v1/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validStudent);
    studentId = res.body.data.student._id;
  });

  it('✅ admin can delete a student', async () => {
    const res = await request(app).delete(`/api/v1/students/${studentId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });

  it('❌ teacher CANNOT delete a student (RBAC enforced)', async () => {
    const res = await request(app).delete(`/api/v1/students/${studentId}`)
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(res.status).toBe(403);
  });

  it('❌ student role CANNOT delete', async () => {
    const res = await request(app).delete(`/api/v1/students/${studentId}`)
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(403);
  });

  it('❌ returns 404 on already-deleted student', async () => {
    await request(app).delete(`/api/v1/students/${studentId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    const res = await request(app).delete(`/api/v1/students/${studentId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(404);
  });

  it('❌ returns 400 for malformed ID on delete', async () => {
    const res = await request(app).delete('/api/v1/students/bad-id-here')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(400);
  });
});

// ════════════════════════════════════════════════════════════════
// GET /students/stats
// ════════════════════════════════════════════════════════════════
describe('GET /api/v1/students/stats', () => {
  it('✅ returns aggregated stats', async () => {
    await request(app).post('/api/v1/students')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validStudent);
    const res = await request(app).get('/api/v1/students/stats')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.stats).toBeInstanceOf(Array);
  });

  it('❌ student role cannot access stats', async () => {
    const res = await request(app).get('/api/v1/students/stats')
      .set('Authorization', `Bearer ${studentToken}`);
    expect(res.status).toBe(403);
  });
});
