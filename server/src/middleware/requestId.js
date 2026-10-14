import { v4 as uuidv4 } from 'uuid';

/**
 * Request ID Middleware
 * Attach unique ID to each request for tracing and logging
 */
const requestId = (req, res, next) => {
  // Generate unique request ID
  req.id = uuidv4();
  
  // Add request ID to response headers
  res.setHeader('X-Request-ID', req.id);
  
  next();
};

export default requestId;
