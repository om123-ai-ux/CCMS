const jwt = require('jsonwebtoken');
const config = require('../config/env');

const generateToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
    algorithm: 'HS256'
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, config.jwt.secret, { algorithms: ['HS256'] });
};

module.exports = {
  generateToken,
  verifyToken
};
