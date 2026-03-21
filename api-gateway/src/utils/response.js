/**
 * Send a successful JSON response.
 */
const sendSuccess = (res, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
  });
};

/**
 * Send an error JSON response.
 */
const sendError = (res, message = "Internal server error", statusCode = 500, details = null) => {
  const body = { success: false, error: { message } };
  if (details) body.error.details = details;
  return res.status(statusCode).json(body);
};

module.exports = { sendSuccess, sendError };
