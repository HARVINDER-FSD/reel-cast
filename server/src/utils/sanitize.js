/**
 * Data Sanitization Utilities
 * Clean and sanitize user input to prevent injection attacks
 */

/**
 * Remove sensitive fields from user object before sending to client
 */
export const sanitizeUser = (user) => {
  const userObj = user.toObject ? user.toObject() : user;
  
  // Remove sensitive fields
  delete userObj.password;
  delete userObj.refreshToken;
  delete userObj.__v;
  delete userObj.loginAttempts;
  delete userObj.lockUntil;
  
  return userObj;
};

/**
 * Sanitize phone number to hide middle digits
 */
export const maskPhone = (phone) => {
  if (!phone || phone.length < 10) return '***';
  return phone.replace(/(\d{2})\d{5}(\d{3})/, '$1*****$2');
};

/**
 * Sanitize email to hide username
 */
export const maskEmail = (email) => {
  if (!email) return '***';
  const [username, domain] = email.split('@');
  if (username.length <= 3) return `${username[0]}***@${domain}`;
  return `${username.substring(0, 3)}***@${domain}`;
};

/**
 * Remove contact details from object
 */
export const hideContactDetails = (obj) => {
  const sanitized = { ...obj };
  
  if (sanitized.phone) {
    sanitized.phone = maskPhone(sanitized.phone);
  }
  
  if (sanitized.email) {
    sanitized.email = maskEmail(sanitized.email);
  }
  
  return sanitized;
};

/**
 * Sanitize MongoDB query operators
 * Prevent NoSQL injection through query params
 */
export const sanitizeQueryOperators = (query) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(query)) {
    // Remove $ operators from keys
    const cleanKey = key.replace(/^\$/, '');
    
    if (typeof value === 'object' && value !== null) {
      sanitized[cleanKey] = sanitizeQueryOperators(value);
    } else {
      sanitized[cleanKey] = value;
    }
  }
  
  return sanitized;
};

export default {
  sanitizeUser,
  maskPhone,
  maskEmail,
  hideContactDetails,
  sanitizeQueryOperators,
};
