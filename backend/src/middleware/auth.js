const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendError } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Verify JWT and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, 401, 'Token expired. Please log in again.');
      }
      return sendError(res, 401, 'Invalid token. Please log in again.');
    }

    const user = await User.findById(decoded.id).select('+isActive');

    if (!user) {
      return sendError(res, 401, 'User not found. Token invalid.');
    }

    if (!user.isActive) {
      return sendError(res, 403, 'Account deactivated. Contact support.');
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return sendError(res, 500, 'Authentication error.');
  }
};

/**
 * Role-based access control middleware factory
 * @param {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Access forbidden. Requires one of: [${roles.join(', ')}] role.`
      );
    }
    next();
  };
};

/**
 * Optional auth — attaches user if token exists, continues regardless
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    }
  } catch (_) {
    // Silently ignore invalid tokens for optional auth
  }
  next();
};

module.exports = { authenticate, authorize, optionalAuth };
