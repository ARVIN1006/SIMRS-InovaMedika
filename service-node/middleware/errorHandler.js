/**
 * Centralized Error Handling Middleware
 * Ensures all API errors return a consistent JSON schema
 */
function errorHandler(err, req, res, next) {
  console.error('[API ERROR]', err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Terjadi kesalahan internal pada server.';

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || null,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    data: null,
  });
}

module.exports = errorHandler;
