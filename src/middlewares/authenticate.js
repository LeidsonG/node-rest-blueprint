const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { UnauthorizedError } = require('../errors/AppError');

function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Token ausente ou mal formatado'));
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    return next(new UnauthorizedError('Token ausente'));
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = { sub: payload.sub, email: payload.email };
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Token expirado'));
    }
    return next(new UnauthorizedError('Token inválido'));
  }
}

module.exports = authenticate;
