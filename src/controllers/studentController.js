const studentService = require('../services/studentService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * List all students with pagination, sorting, and filtering
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const listStudents = asyncHandler(async (req, res) => {
  const result = await studentService.listStudents(req.query);
  res.status(200).json({ success: true, data: result });
});

/**
 * Get a single student by their ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getStudent = asyncHandler(async (req, res) => {
  const student = await studentService.getStudentById(req.params.id);
  res.status(200).json({ success: true, data: { student } });
});

/**
 * Create a new student (Requires Admin/Teacher role)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createStudent = asyncHandler(async (req, res) => {
  const student = await studentService.createStudent(req.body, req.user._id);
  res.status(201).json({ success: true, data: { student } });
});

/**
 * Update an existing student
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateStudent = asyncHandler(async (req, res) => {
  const student = await studentService.updateStudent(req.params.id, req.body, req.user._id);
  res.status(200).json({ success: true, data: { student } });
});

/**
 * Delete a student (Requires Admin role)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteStudent = asyncHandler(async (req, res) => {
  await studentService.deleteStudent(req.params.id);
  res.status(204).send();
});

/**
 * Get aggregated statistics for students
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getStats = asyncHandler(async (req, res) => {
  const stats = await studentService.getStudentStats();
  res.status(200).json({ success: true, data: { stats } });
});

module.exports = {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  getStats,
};
