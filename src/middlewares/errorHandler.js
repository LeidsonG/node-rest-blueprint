const { ZodError } = require('zod');
const { Prisma } = require('@prisma/client');
const { AppError } = require('../errors/AppError');
const env = require('../config/env');

function notFoundHandler(req, res, next) {
  res.status(404).json({
    error: 'NotFound',
    message: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
  });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Dados inválidos',
      details: err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  if (err instanceof AppError) {
    const body = {
      error: err.name,
      message: err.message,
    };
    if (err.details !== undefined) body.details = err.details;
    return res.status(err.statusCode).json(body);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: 'ConflictError',
        message: 'Recurso já existe',
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        error: 'NotFoundError',
        message: 'Recurso não encontrado',
      });
    }
  }

  if (env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error('[errorHandler]', err);
  }

  const body = {
    error: 'InternalServerError',
    message: 'Erro interno do servidor',
  };

  if (env.NODE_ENV !== 'production') {
    body.debug = { message: err.message, stack: err.stack };
  }

  return res.status(500).json(body);
}

module.exports = { errorHandler, notFoundHandler };
