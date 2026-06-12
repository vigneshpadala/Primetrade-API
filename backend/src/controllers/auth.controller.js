const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * Generate signed JWT access token
 */
const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
};

/**
 * POST /auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 409, 'User with this email already exists');
    }

    // Prevent self-promotion to admin without existing admin token
    const assignedRole = role === 'admin' && req.user?.role !== 'admin' ? 'user' : (role || 'user');

    const user = await User.create({ name, email, password, role: assignedRole });

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token
    await User.findByIdAndUpdate(user._id, { $push: { refreshTokens: refreshToken } });

    logger.info(`New user registered: ${email} with role: ${assignedRole}`);

    return sendSuccess(res, 201, 'Registration successful', {
      user: user.toSafeObject(),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +refreshTokens');
    if (!user) {
      return sendError(res, 401, 'Invalid email or password');
    }

    if (!user.isActive) {
      return sendError(res, 403, 'Account deactivated. Contact support.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password');
    }

    const accessToken = generateAccessToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshTokens.push(refreshToken);
    user.lastLogin = new Date();
    await user.save();

    logger.info(`User logged in: ${email}`);

    return sendSuccess(res, 200, 'Login successful', {
      user: user.toSafeObject(),
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /auth/refresh
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return sendError(res, 400, 'Refresh token is required');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return sendError(res, 401, 'Invalid or expired refresh token');
    }

    const user = await User.findById(decoded.id).select('+refreshTokens');
    if (!user || !user.refreshTokens.includes(token)) {
      return sendError(res, 401, 'Refresh token not recognized');
    }

    const newAccessToken = generateAccessToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    // Rotate refresh token
    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    return sendSuccess(res, 200, 'Token refreshed', {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /auth/logout
 */
const logout = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (token) {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { refreshTokens: token },
      });
    }

    logger.info(`User logged out: ${req.user.email}`);
    return sendSuccess(res, 200, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /auth/me
 */
const getMe = async (req, res) => {
  return sendSuccess(res, 200, 'User profile fetched', req.user.toSafeObject());
};

/**
 * GET /auth/users — Admin only
 */
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(),
    ]);

    return sendSuccess(res, 200, 'Users fetched', users.map((u) => u.toSafeObject()), {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /auth/users/:id/role — Admin only
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) return sendError(res, 404, 'User not found');

    logger.info(`Admin ${req.user.email} changed role of ${user.email} to ${role}`);
    return sendSuccess(res, 200, 'User role updated', user.toSafeObject());
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refreshToken, logout, getMe, getAllUsers, updateUserRole };
