import morgan from 'morgan';

// Morgan logging middleware
export const requestLogger = morgan('combined');

// Global error handler
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

// Not found handler
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
};

// Validation error handler
export const validationErrorHandler = (err, req, res, next) => {
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Validation error',
      details: err.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  next(err);
};