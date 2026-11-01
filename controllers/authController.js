const Teacher = require('../models/Teacher');
const generateToken = require('../utils/generateToken');

/**
 * @desc    Authenticate teacher & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginTeacher = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find teacher by email and explicitly include password field
    const teacher = await Teacher.findOne({ email: email.toLowerCase() }).select('+password');

    if (!teacher) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials',
      });
    }

    // Check if password matches
    const isMatch = await teacher.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials',
      });
    }

    const token = generateToken(teacher._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      teacher: {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        subject: teacher.subject,
        currency: teacher.currency,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Register a teacher (Useful for initial setup)
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerTeacher = async (req, res, next) => {
  try {
    const { name, email, password, subject, currency } = req.body;

    const teacherExists = await Teacher.findOne({ email: email.toLowerCase() });

    if (teacherExists) {
      return res.status(400).json({
        success: false,
        message: 'Teacher with this email already exists',
      });
    }

    const teacher = await Teacher.create({
      name,
      email: email.toLowerCase(),
      password,
      subject: subject || 'General Tutoring',
      currency: currency || 'USD',
    });

    const token = generateToken(teacher._id);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      teacher: {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        subject: teacher.subject,
        currency: teacher.currency,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated teacher profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.teacher._id);

    res.status(200).json({
      success: true,
      teacher: {
        _id: teacher._id,
        name: teacher.name,
        email: teacher.email,
        subject: teacher.subject,
        currency: teacher.currency,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout teacher / invalidate session on client
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logoutTeacher = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginTeacher,
  registerTeacher,
  getMe,
  logoutTeacher,
};
