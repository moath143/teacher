const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  exportStudentPDF,
} = require('../controllers/studentController');
const { studentValidationRules } = require('../validations/studentValidation');
const { protect } = require('../middleware/authMiddleware');

// All student routes require JWT authentication
router.use(protect);

/**
 * @route   GET /api/students
 * @desc    Get all students with search & filter & metrics
 * @access  Private
 */
/**
 * @route   POST /api/students
 * @desc    Create a new student
 * @access  Private
 */
router
  .route('/')
  .get(getStudents)
  .post(studentValidationRules, createStudent);

/**
 * @route   GET /api/students/:id
 * @desc    Get single student details with lesson history & financial summary
 * @access  Private
 */
/**
 * @route   PUT /api/students/:id
 * @desc    Update student details
 * @access  Private
 */
/**
 * @route   DELETE /api/students/:id
 * @desc    Delete student and related records
 * @access  Private
 */
router
  .route('/:id')
  .get(getStudentById)
  .put(studentValidationRules, updateStudent)
  .delete(deleteStudent);

/**
 * @route   GET /api/students/:id/pdf
 * @desc    Export student report PDF
 * @access  Private
 */
router.get('/:id/pdf', exportStudentPDF);

module.exports = router;
