const { check, validationResult } = require('express-validator');

/**
 * Handle validation result errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * Validation rules for creating or updating a lesson
 */
const lessonValidationRules = [
  check('studentId')
    .notEmpty()
    .withMessage('Student selection is required')
    .isMongoId()
    .withMessage('Invalid Student ID format'),
  check('lessonTitle')
    .trim()
    .notEmpty()
    .withMessage('Lesson title is required')
    .isLength({ min: 2, max: 150 })
    .withMessage('Lesson title must be between 2 and 150 characters'),
  check('lessonDate')
    .notEmpty()
    .withMessage('Lesson date is required')
    .isISO8601()
    .toDate()
    .withMessage('Invalid lesson date format'),
  check('lessonTime')
    .trim()
    .notEmpty()
    .withMessage('Lesson time is required (e.g. 16:00 or 04:00 PM)'),
  check('amount')
    .notEmpty()
    .withMessage('Lesson amount is required')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a non-negative number'),
  check('notes')
    .optional({ checkFalsy: true })
    .trim(),
  validate,
];

module.exports = {
  lessonValidationRules,
};
