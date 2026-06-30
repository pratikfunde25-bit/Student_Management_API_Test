const jwt = require('jsonwebtoken');
const env = require('../config/env');

const signToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
};

const verifyToken = (token) => jwt.verify(token, env.jwtSecret);

module.exports = { signToken, verifyToken };
