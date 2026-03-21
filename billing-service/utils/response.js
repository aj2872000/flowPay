const sendSuccess = (res, data = {}, statusCode = 200) =>
  res.status(statusCode).json({ success: true, data });

const sendError = (res, message = "Internal server error", statusCode = 500, details = null) => {
  const body = { success: false, error: { message } };
  if (details) body.error.details = details;
  return res.status(statusCode).json(body);
};

module.exports = { sendSuccess, sendError };
