const express = require('express');
const router = express.Router();
const {
  getLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
} = require('../controllers/lessonController');
const { lessonValidationRules } = require('../validations/lessonValidation');
const { protect } = require('../middleware/authMiddleware');

// All lesson routes require JWT authentication
router.use(protect);

/**
 * @route   GET /api/lessons
 * @desc    Get all lessons with filtering, search & summary
 * @access  Private
 */
/**
 * @route   POST /api/lessons
 * @desc    Create a new lesson for a student
 * @access  Private
 */
router
  .route('/')
  .get(getLessons)
  .post(lessonValidationRules, createLesson);

/**
 * @route   GET /api/lessons/:id
 * @desc    Get single lesson
 * @access  Private
 */
/**
 * @route   PUT /api/lessons/:id
 * @desc    Update lesson
 * @access  Private
 */
/**
 * @route   DELETE /api/lessons/:id
 * @desc    Delete lesson
 * @access  Private
 */
router
  .route('/:id')
  .get(getLessonById)
  .put(lessonValidationRules, updateLesson)
  .delete(deleteLesson);

module.exports = router;
