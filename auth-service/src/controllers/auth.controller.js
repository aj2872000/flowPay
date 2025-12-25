const authService = require('../services/auth.service');

const register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.register(email, password);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (err) {
    res.status(401).json({ message: err.message });
  }
};

const getProfile = async (req, res) => {
  res.json({
    message: 'Profile fetched successfully',
    user: req.user
  });
};

module.exports = {
  register,
  login,
  getProfile
};
