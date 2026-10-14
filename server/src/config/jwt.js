/**
 * JWT Configuration
 * Centralized JWT settings for token generation and verification
 */

export const jwtConfig = {
  access: {
    secret: process.env.JWT_ACCESS_SECRET,
    expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
  },
  refresh: {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
};

/**
 * Cookie configuration for storing tokens
 */
export const cookieConfig = {
  httpOnly: true, // Cannot be accessed by JavaScript
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  domain: process.env.COOKIE_DOMAIN || 'localhost',
  path: '/',
};

/**
 * Access token cookie options
 */
export const accessTokenCookieOptions = {
  ...cookieConfig,
  maxAge: 15 * 60 * 1000, // 15 minutes
};

/**
 * Refresh token cookie options
 */
export const refreshTokenCookieOptions = {
  ...cookieConfig,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Validate JWT configuration on startup
export const validateJWTConfig = () => {
  if (!jwtConfig.access.secret || jwtConfig.access.secret.length < 32) {
    throw new Error('JWT_ACCESS_SECRET must be set and at least 32 characters long');
  }
  
  if (!jwtConfig.refresh.secret || jwtConfig.refresh.secret.length < 32) {
    throw new Error('JWT_REFRESH_SECRET must be set and at least 32 characters long');
  }
  
  if (jwtConfig.access.secret === jwtConfig.refresh.secret) {
    throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different');
  }
};
