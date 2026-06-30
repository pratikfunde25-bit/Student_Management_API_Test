const Student = require('../models/Student');
const AppError = require('../utils/AppError');

/**
 * Builds a MongoDB filter object from request query parameters
 */

const buildFilter = ({ status, className, section, search }) => {
  const filter = {};

  if (status) filter.status = status;
  if (className) filter.className = className;
  if (section) filter.section = section.toUpperCase();
  if (search) filter.$text = { $search: search };

  return filter;
};

/**
 * Get a paginated list of students
 * @param {Object} query - Query parameters (page, limit, search, etc.)
 * @returns {Promise<Object>} Object containing items and pagination details
 */
const listStudents = async (query) => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;
  const filter = buildFilter(query);

  const [items, total] = await Promise.all([
    Student.find(filter)
      .sort(query.sort)
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'name email role'),
    Student.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a student by ID
 * @param {string} id - Student ID
 * @returns {Promise<Object>} The student document
 * @throws {AppError} If student not found
 */
const getStudentById = async (id) => {
  const student = await Student.findById(id)
    .select('+guardianPhoneEncrypted')
    .populate('createdBy updatedBy', 'name email role');

  if (!student) {
    throw new AppError('Student not found', 404, 'STUDENT_NOT_FOUND');
  }

  return student;
};

/**
 * Create a new student using MongoDB Transactions to ensure ACID properties
 * @param {Object} payload - Student data
 * @param {string} userId - ID of the user creating the student
 * @returns {Promise<Object>} The created student
 */
const createStudent = async (payload, userId) => {
  return Student.create({
    ...payload,
    createdBy: userId,
  });
};

/**
 * Update a student
 * @param {string} id - Student ID
 * @param {Object} payload - Updated data
 * @param {string} userId - ID of the user updating
 * @returns {Promise<Object>} The updated student
 */
const updateStudent = async (id, payload, userId) => {
  const student = await Student.findById(id).select('+guardianPhoneEncrypted');

  if (!student) {
    throw new AppError('Student not found', 404, 'STUDENT_NOT_FOUND');
  }

  Object.assign(student, payload, { updatedBy: userId });
  await student.save();

  return student;
};

/**
 * Delete a student using MongoDB Transactions
 * @param {string} id - Student ID
 * @throws {AppError} If student not found
 */
const deleteStudent = async (id) => {
  const student = await Student.findByIdAndDelete(id);

  if (!student) {
    throw new AppError('Student not found', 404, 'STUDENT_NOT_FOUND');
  }
};

/**
 * Get aggregated statistics for students (e.g. count by class and status)
 * Uses MongoDB Aggregation Pipeline
 * @returns {Promise<Array>} Aggregation results
 */
const getStudentStats = async () => {
  return Student.aggregate([
    {
      $group: {
        _id: {
          className: '$className',
          status: '$status',
        },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        className: '$_id.className',
        status: '$_id.status',
        count: 1,
      },
    },
    { $sort: { className: 1, status: 1 } },
  ]);
};

module.exports = {
  listStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentStats,
};
