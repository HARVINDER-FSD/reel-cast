import asyncHandler from '../utils/asyncHandler.js';
import { AuthenticationError, ConflictError, ValidationError } from '../utils/AppError.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/generateTokens.js';
import { accessTokenCookieOptions, refreshTokenCookieOptions } from '../config/jwt.js';
import { sanitizeUser } from '../utils/sanitize.js';
import User from '../models/User.model.js';
import Talent from '../models/Talent.model.js';
import InstagramPage from '../models/InstagramPage.model.js';
import Brand from '../models/Brand.model.js';
import emailService from '../utils/emailService.js';
import logger from '../utils/logger.js';

/**
 * Auth Controller
 * Handles authentication and user management
 */

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register new user (talent/igpage/brand)
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
  const { email, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ConflictError('Email already registered');
  }

  let user;

  // Create user based on role
  switch (role) {
    case 'talent':
      user = await Talent.create(req.body);
      break;

    case 'igpage':
      // Check if Instagram handle already exists
      const existingHandle = await InstagramPage.findOne({ handle: req.body.handle });
      if (existingHandle) {
        throw new ConflictError('Instagram handle already registered');
      }
      user = await InstagramPage.create(req.body);
      break;

    case 'brand':
      user = await Brand.create(req.body);
      break;

    default:
      throw new ValidationError('Invalid user role');
  }

  // Send welcome email (non-blocking)
  emailService.sendWelcomeEmail(user).catch(err =>
    logger.error('Failed to send welcome email', { userId: user._id, error: err.message })
  );

  logger.info('User registered successfully', {
    userId: user._id,
    email: user.email,
    role: user.role,
  });

  // Generate tokens
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  // Save refresh token
  user.refreshToken = refreshToken;
  await user.save();

  // Set tokens in HTTP-only cookies
  res.cookie('accessToken', accessToken, accessTokenCookieOptions);
  res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: sanitizeUser(user),
    },
  });
});

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user with password field
  const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');

  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Check if account is locked
  if (user.isLocked) {
    throw new AuthenticationError(
      `Account is locked due to multiple failed login attempts. Please try again later.`
    );
  }

  // Check if account is active
  if (!user.isActive) {
    throw new AuthenticationError('Your account has been deactivated');
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    // Increment login attempts
    await user.incLoginAttempts();
    
    logger.warn('Failed login attempt', {
      email,
      loginAttempts: user.loginAttempts + 1,
    });

    throw new AuthenticationError('Invalid email or password');
  }

  // Reset login attempts on successful login
  await user.resetLoginAttempts();

  // Generate tokens
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  // Save refresh token
  user.refreshToken = refreshToken;
  await user.save();

  logger.info('User logged in successfully', {
    userId: user._id,
    email: user.email,
    role: user.role,
  });

  // Set tokens in HTTP-only cookies
  res.cookie('accessToken', accessToken, accessTokenCookieOptions);
  res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: sanitizeUser(user),
    },
  });
});

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
  // Clear refresh token from database
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: 1 } });
    
    logger.info('User logged out', {
      userId: req.user._id,
      email: req.user.email,
    });
  }

  // Clear cookies
  res.clearCookie('accessToken', accessTokenCookieOptions);
  res.clearCookie('refreshToken', refreshTokenCookieOptions);

  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
export const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw new AuthenticationError('No refresh token provided');
  }

  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user with refresh token
    const user = await User.findById(decoded.userId).select('+refreshToken');

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    if (user.refreshToken !== refreshToken) {
      throw new AuthenticationError('Invalid refresh token');
    }

    if (!user.isActive) {
      throw new AuthenticationError('Account is deactivated');
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user._id, user.role);

    // Set new access token in cookie
    res.cookie('accessToken', newAccessToken, accessTokenCookieOptions);

    res.status(200).json({
      success: true,
      message: 'Access token refreshed',
    });
  } catch (error) {
    // Clear invalid cookies
    res.clearCookie('accessToken', accessTokenCookieOptions);
    res.clearCookie('refreshToken', refreshTokenCookieOptions);

    throw new AuthenticationError('Invalid or expired refresh token');
  }
});

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: sanitizeUser(req.user),
    },
  });
});

/**
 * @route   PUT /api/v1/auth/update-password
 * @desc    Update user password
 * @access  Private
 */
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);

  if (!isPasswordValid) {
    throw new AuthenticationError('Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  logger.info('Password updated', {
    userId: user._id,
    email: user.email,
  });

  res.status(200).json({
    success: true,
    message: 'Password updated successfully',
  });
});

export default {
  register,
  login,
  logout,
  refreshAccessToken,
  getCurrentUser,
  updatePassword,
};
