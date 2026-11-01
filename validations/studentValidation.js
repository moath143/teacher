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
 * Validation rules for creating or updating a student
 */
const studentValidationRules = [
  check('fullName')
    .trim()
    .notEmpty()
    .withMessage('Student full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Student name must be between 2 and 100 characters'),
  check('stage')
    .trim()
    .notEmpty()
    .withMessage('Educational stage is required'),
  check('enrollmentDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .toDate()
    .withMessage('Invalid enrollment date format (ISO 8601 expected)'),
  check('educationType')
    .trim()
    .notEmpty()
    .withMessage('Education type is required')
    .isIn(['Lessons', 'Full Course'])
    .withMessage('Education type must be either Lessons or Full Course'),
  check('phone')
    .optional({ checkFalsy: true })
    .trim(),
  check('notes')
    .optional({ checkFalsy: true })
    .trim(),
  validate,
];

module.exports = {
  studentValidationRules,
};
