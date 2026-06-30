const { z } = require('zod');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId');

const studentBody = z.object({
  rollNumber: z.string().min(1).max(30),
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email().optional(),
  dateOfBirth: z.coerce.date().optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  className: z.string().min(1).max(30),
  section: z.string().max(10).optional(),
  guardianName: z.string().min(2).max(80),
  guardianPhone: z.string().min(7).max(20).optional(),
  address: z
    .object({
      line1: z.string().max(120).optional(),
      city: z.string().max(60).optional(),
      state: z.string().max(60).optional(),
      postalCode: z.string().max(20).optional(),
      country: z.string().max(60).optional(),
    })
    .optional(),
  status: z.enum(['active', 'inactive', 'graduated']).optional(),
});

const createStudentSchema = z.object({
  body: studentBody,
});

const updateStudentSchema = z.object({
  params: z.object({ id: objectId }),
  body: studentBody.partial().refine((body) => Object.keys(body).length > 0, {
    message: 'At least one field is required for update',
  }),
});

const idParamSchema = z.object({
  params: z.object({ id: objectId }),
});

const listStudentsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    status: z.enum(['active', 'inactive', 'graduated']).optional(),
    className: z.string().optional(),
    section: z.string().optional(),
    search: z.string().optional(),
    sort: z.enum(['createdAt', '-createdAt', 'rollNumber', '-rollNumber', 'firstName', '-firstName']).default('-createdAt'),
  }),
});

module.exports = {
  createStudentSchema,
  updateStudentSchema,
  idParamSchema,
  listStudentsSchema,
};
