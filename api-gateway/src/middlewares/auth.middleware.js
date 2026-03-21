const httpClient = require('../utils/httpClient');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;

module.exports = async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header missing' });
    }

    const response = await httpClient.get(
      `${AUTH_SERVICE_URL}/auth/profile`,
      {
        headers: {
          Authorization: authHeader
        }
      }
    );

    // Attach user info for downstream services
    // req.user = response.data.user;
    next();

  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
