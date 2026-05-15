const postsService = require('./posts.service');

async function list(req, res, next) {
  try {
    const result = await postsService.listPublished(req.query);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

async function getById(req, res, next) {
  try {
    const post = await postsService.getByIdPublic(req.params.id);
    return res.json({ post });
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const post = await postsService.create(req.user.sub, req.body);
    return res.status(201).json({ post });
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const post = await postsService.update(req.params.id, req.user.sub, req.body);
    return res.json({ post });
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    await postsService.remove(req.params.id, req.user.sub);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, getById, create, update, remove };
