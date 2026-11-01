const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');

/**
 * Protect routes by verifying JWT Bearer token
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from header "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_teacher_app_2025_prod_secure_random';
      const decoded = jwt.verify(token, secret);

      // Fetch teacher from DB without password
      const teacher = await Teacher.findById(decoded.id).select('-password');

      if (!teacher) {
        return res.status(401).json({
          success: false,
          message: 'Teacher account no longer exists',
        });
      }

      req.teacher = teacher;
      next();
    } catch (error) {
      console.error('[Auth Middleware Error]:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed or expired',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }
};

module.exports = { protect };
