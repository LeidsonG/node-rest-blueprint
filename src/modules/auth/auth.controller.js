const authService = require('./auth.service');

async function register(req, res, next) {
  try {
    const user = await authService.register(req.body);
    return res.status(201).json({ user });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}

module.exports = { register, login };
