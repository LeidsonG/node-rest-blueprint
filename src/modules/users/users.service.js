const prisma = require('../../prisma/client');
const {
  NotFoundError,
  ConflictError,
} = require('../../errors/AppError');
const { toPublicUser } = require('../auth/auth.service');

async function getById(id) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundError('Usuário não encontrado');
  return toPublicUser(user);
}

async function updateById(id, data) {
  if (data.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing && existing.id !== id) {
      throw new ConflictError('Email já cadastrado');
    }
  }

  try {
    const updated = await prisma.user.update({
      where: { id },
      data,
    });
    return toPublicUser(updated);
  } catch (err) {
    if (err.code === 'P2025') throw new NotFoundError('Usuário não encontrado');
    throw err;
  }
}

async function deleteById(id) {
  try {
    await prisma.user.delete({ where: { id } });
  } catch (err) {
    if (err.code === 'P2025') throw new NotFoundError('Usuário não encontrado');
    throw err;
  }
}

module.exports = { getById, updateById, deleteById };
