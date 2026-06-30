const express = require('express');
const ROLES = require('../constants/roles');
const studentController = require('../controllers/studentController');
const { authorize, protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  createStudentSchema,
  idParamSchema,
  listStudentsSchema,
  updateStudentSchema,
} = require('../validators/studentValidator');

const router = express.Router();

router.use(protect);

/**
 * @swagger
 * tags:
 *   name: Students
 *   description: Student management and operations
 */

router.use(protect);

router.get('/', validate(listStudentsSchema), authorize(ROLES.ADMIN, ROLES.TEACHER), studentController.listStudents);
router.post('/', validate(createStudentSchema), authorize(ROLES.ADMIN, ROLES.TEACHER), studentController.createStudent);
router.get('/stats', authorize(ROLES.ADMIN, ROLES.TEACHER), studentController.getStats);
router.get('/:id', validate(idParamSchema), authorize(ROLES.ADMIN, ROLES.TEACHER), studentController.getStudent);
router.patch('/:id', validate(updateStudentSchema), authorize(ROLES.ADMIN, ROLES.TEACHER), studentController.updateStudent);
router.delete('/:id', validate(idParamSchema), authorize(ROLES.ADMIN), studentController.deleteStudent);

module.exports = router;
