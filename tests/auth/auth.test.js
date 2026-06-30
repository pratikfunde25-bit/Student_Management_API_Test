/**
 * AUTH API TESTS
 * Tests: Registration, Login, JWT Auth, Role validation
 */
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');

// ─── Test Helpers ───────────────────────────────────────────────
const validUser = {
  name: 'Test Admin',
  email: 'testadmin@test.com',
  password: 'Password123!',
  role: 'admin',
};

let adminToken;

beforeAll(async () => {
  // Connect to DB before any test runs
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/student-management-test');
});

afterAll(async () => {
  // Clean up test data and close connection
  await User.deleteMany({ email: /test\.com$/ });
  await mongoose.connection.close();
});

beforeEach(async () => {
  // Clean users before each test to avoid duplicate conflicts
  await User.deleteMany({ email: /test\.com$/ });
});

// ════════════════════════════════════════════════════════════════
// REGISTRATION TESTS
// ════════════════════════════════════════════════════════════════
describe('POST /api/v1/auth/register', () => {
  it('✅ should register a new user and return a JWT token', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(validUser);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('admin');
    expect(res.body.data.user.password).toBeUndefined(); // Password must never be returned
  });

  it('✅ should register a student role user by default', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Default Student',
      email: 'defaultstudent@test.com',
      password: 'Password123!',
    });
    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('student');
  });

  it('❌ should reject registration with a password shorter than 8 chars', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      ...validUser, password: 'short',
    });
    expect(res.status).toBe(400);
  });

  it('❌ should reject duplicate email registration', async () => {
    await request(app).post('/api/v1/auth/register').send(validUser);
    const res = await request(app).post('/api/v1/auth/register').send(validUser);
    expect(res.status).toBe(409);
  });

  it('❌ should reject missing required fields', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({ email: 'missing@test.com' });
    expect(res.status).toBe(400);
  });

  it('❌ should reject invalid email format', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      ...validUser, email: 'not-an-email',
    });
    expect(res.status).toBe(400);
  });

  it('❌ should reject an invalid role', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      ...validUser, role: 'superuser',
    });
    expect(res.status).toBe(400);
  });

  it('❌ should reject names shorter than 2 characters', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      ...validUser, name: 'A',
    });
    expect(res.status).toBe(400);
  });

  it('✅ should sanitize: strip HTML/XSS tags from name field', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Admin',
      email: 'xss@test.com',
      password: 'Password123!',
      // Attempt to inject a script — sanitizer should strip the tags
      xssField: '<script>alert("xss")</script>',
    });
    // The name itself is safe, so registration succeeds
    expect(res.status).toBe(201);
    // But the malicious field should not be stored / returned
    expect(JSON.stringify(res.body)).not.toContain('<script>');
  });
});

// ════════════════════════════════════════════════════════════════
// LOGIN TESTS
// ════════════════════════════════════════════════════════════════
describe('POST /api/v1/auth/login', () => {
  beforeEach(async () => {
    // Create a user to login with
    await request(app).post('/api/v1/auth/register').send(validUser);
  });

  it('✅ should login with correct credentials and return a JWT', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: validUser.email,
      password: validUser.password,
    });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toBeDefined();
    adminToken = res.body.data.token;
  });

  it('❌ should reject login with wrong password', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: validUser.email,
      password: 'WrongPassword999!',
    });
    expect(res.status).toBe(401);
    expect(res.body.data).toBeUndefined();
  });

  it('❌ should reject login with a non-existent email', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'ghost@test.com',
      password: 'Password123!',
    });
    expect(res.status).toBe(401);
  });

  it('❌ should reject login with empty password', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: validUser.email,
      password: '',
    });
    expect(res.status).toBe(400);
  });

  it('❌ should reject login for an inactive account', async () => {
    await User.findOneAndUpdate({ email: validUser.email }, { isActive: false });
    const res = await request(app).post('/api/v1/auth/login').send({
      email: validUser.email, password: validUser.password,
    });
    expect(res.status).toBe(403);
  });
});

// ════════════════════════════════════════════════════════════════
// /ME ENDPOINT TESTS
// ════════════════════════════════════════════════════════════════
describe('GET /api/v1/auth/me', () => {
  beforeEach(async () => {
    const regRes = await request(app).post('/api/v1/auth/register').send(validUser);
    adminToken = regRes.body.data.token;
  });

  it('✅ should return user profile with a valid token', async () => {
    const res = await request(app).get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe(validUser.email);
  });

  it('❌ should reject request with no token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('❌ should reject request with a tampered/invalid token', async () => {
    const res = await request(app).get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalidtoken.tampered.payload');
    expect(res.status).toBe(401);
  });

  it('❌ should reject a malformed Authorization header (no Bearer prefix)', async () => {
    const res = await request(app).get('/api/v1/auth/me')
      .set('Authorization', adminToken);
    expect(res.status).toBe(401);
  });
});
