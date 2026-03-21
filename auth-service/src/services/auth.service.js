const bcrypt = require('bcryptjs');
const userModel = require('../models/user.model');
const { generateToken } = require('../utils/jwt');

const register = async (email, password) => {
  const existingUser = await userModel.findUserByEmail(email);
  if (existingUser) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await userModel.createUser(email, hashedPassword, 'USER');

  const token = generateToken({ id: user.id, role: user.role });
  return { user, token };
};

const login = async (email, password) => {
  const user = await userModel.findUserByEmail(email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken({ id: user.id, role: user.role });
  return { token };
};

module.exports = {
  register,
  login
};
