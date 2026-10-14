/**
 * Async Handler Wrapper
 * Eliminates try-catch blocks in async route handlers
 */

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
