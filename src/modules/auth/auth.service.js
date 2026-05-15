const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../prisma/client');
const env = require('../../config/env');
const {
  ConflictError,
  UnauthorizedError,
} = require('../../errors/AppError');

const GENERIC_AUTH_MESSAGE = 'Credenciais inválidas';

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN },
  );
}

function toPublicUser(user) {
  const { password, ...rest } = user;
  return rest;
}

async function register({ name, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ConflictError('Email já cadastrado');
  }

  const hash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { name, email, password: hash },
  });

  return toPublicUser(user);
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });

  // Mesma mensagem para email inexistente e senha errada (não vazar qual falhou).
  if (!user) {
    // Evita timing attack rodando um hash dummy mesmo quando o user não existe.
    await bcrypt.compare(password, '$2a$10$invalidsaltforfakehashattackmitigation');
    throw new UnauthorizedError(GENERIC_AUTH_MESSAGE);
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw new UnauthorizedError(GENERIC_AUTH_MESSAGE);
  }

  return {
    token: signToken(user),
    user: toPublicUser(user),
  };
}

module.exports = { register, login, toPublicUser };
