const express = require('express');
const router = express.Router();
const {
  loginTeacher,
  registerTeacher,
  getMe,
  logoutTeacher,
} = require('../controllers/authController');
const {
  loginValidationRules,
  registerValidationRules,
} = require('../validations/authValidation');
const { protect } = require('../middleware/authMiddleware');

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate teacher & get JWT
 * @access  Public
 */
router.post('/login', loginValidationRules, loginTeacher);

/**
 * @route   POST /api/auth/register
 * @desc    Register teacher account
 * @access  Public
 */
router.post('/register', registerValidationRules, registerTeacher);

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated teacher profile
 * @access  Private
 */
router.get('/me', protect, getMe);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout teacher
 * @access  Private
 */
router.post('/logout', protect, logoutTeacher);

module.exports = router;
