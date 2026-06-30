const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
    email: z.string().email().toLowerCase(),
    password: z.string().min(8).max(128),
    role: z.enum(['admin', 'teacher', 'student']).default('student'),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email().toLowerCase(),
    password: z.string().min(1),
  }),
});

module.exports = { registerSchema, loginSchema };
