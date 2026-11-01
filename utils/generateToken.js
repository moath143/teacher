const jwt = require('jsonwebtoken');

/**
 * Generate signed JWT token for authenticated teacher
 * @param {string} id - Teacher user ID
 * @returns {string} Signed JWT Token
 */
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_teacher_app_2025_prod_secure_random';
  const expiresIn = process.env.JWT_EXPIRE || '30d';

  return jwt.sign({ id }, secret, {
    expiresIn,
  });
};

module.exports = generateToken;
