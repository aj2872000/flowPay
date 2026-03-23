const notFound = (req, res) => {
  console.log(`[404] ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: { message: `Route not found: ${req.method} ${req.originalUrl}` },
  });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  console.error(`[ERROR] ${req.method} ${req.originalUrl} status=${statusCode}`);
  console.error(`[ERROR] message: ${err.message}`);
  console.error(`[ERROR] type: ${err.constructor?.name}`);
  console.error(`[ERROR] stack: ${err.stack}`);
  if (res.headersSent) return;
  res.status(statusCode).json({
    success: false,
    error: { message: err.message, type: err.constructor?.name },
  });
};

module.exports = { notFound, errorHandler };
