import asyncHandler from '../utils/asyncHandler.js';
import { AuthenticationError, AuthorizationError } from '../utils/AppError.js';
import { verifyAccessToken } from '../utils/generateTokens.js';
import User from '../models/User.model.js';
import logger from '../utils/logger.js';

/**
 * Authentication Middleware
 * Verify JWT token and attach user to request
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in cookies (preferred) or Authorization header
  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new AuthenticationError('No authentication token provided');
  }

  try {
    // Verify token
    const decoded = verifyAccessToken(token);

    // Check if user still exists
    const user = await User.findById(decoded.userId).select('-password -refreshToken');

    if (!user) {
      throw new AuthenticationError('User no longer exists');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AuthenticationError('Your account has been deactivated');
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    
    logger.warn('Token verification failed', { error: error.message });
    throw new AuthenticationError('Invalid or expired token');
  }
});

/**
 * Authorization Middleware - Check user roles
 * Usage: authorize('admin', 'brand')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AuthenticationError('Please authenticate first');
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Unauthorized access attempt', {
        userId: req.user._id,
        userRole: req.user.role,
        requiredRoles: roles,
        path: req.originalUrl,
      });
      
      throw new AuthorizationError(
        `Access denied. Required role: ${roles.join(' or ')}`
      );
    }

    next();
  };
};

/**
 * Super Admin Only Middleware
 * Only allows super-admin role users
 * Usage: authorizeSuperAdmin
 */
export const authorizeSuperAdmin = (req, res, next) => {
  if (!req.user) {
    throw new AuthenticationError('Please authenticate first');
  }

  // Check if user is super admin
  if (req.user.role !== 'super-admin' || !req.user.isSuperAdmin) {
    logger.warn('Super Admin access attempt by non-super-admin', {
      userId: req.user._id,
      userRole: req.user.role,
      isSuperAdmin: req.user.isSuperAdmin,
      path: req.originalUrl,
    });
    
    throw new AuthorizationError(
      'This action is restricted to Super Admin only'
    );
  }

  next();
};

/**
 * Admin or Super Admin Middleware
 * Allows both admin and super-admin roles
 * Super Admin has all permissions of Admin
 * Usage: authorizeAdminOrSuperAdmin
 */
export const authorizeAdminOrSuperAdmin = (req, res, next) => {
  if (!req.user) {
    throw new AuthenticationError('Please authenticate first');
  }

  // Allow both admin and super-admin
  const isAdmin = req.user.role === 'admin';
  const isSuperAdmin = req.user.role === 'super-admin' && req.user.isSuperAdmin;

  if (!isAdmin && !isSuperAdmin) {
    logger.warn('Admin access attempt by non-admin user', {
      userId: req.user._id,
      userRole: req.user.role,
      path: req.originalUrl,
    });
    
    throw new AuthorizationError(
      'Access denied. Admin or Super Admin role required'
    );
  }

  next();
};

/**
 * Optional authentication - attach user if token provided
 * Useful for routes that work with or without authentication
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId).select('-password -refreshToken');
      
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Silent fail for optional auth
      logger.debug('Optional auth failed', { error: error.message });
    }
  }

  next();
});

export default {
  authenticate,
  authorize,
  optionalAuth,
  authorizeSuperAdmin,
  authorizeAdminOrSuperAdmin,
};
