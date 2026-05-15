const usersService = require('./users.service');

async function getMe(req, res, next) {
  try {
    const user = await usersService.getById(req.user.sub);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    const user = await usersService.updateById(req.user.sub, req.body);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
}

async function deleteMe(req, res, next) {
  try {
    await usersService.deleteById(req.user.sub);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = { getMe, updateMe, deleteMe };
