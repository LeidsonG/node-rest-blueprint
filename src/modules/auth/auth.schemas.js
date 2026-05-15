const { z } = require('zod');

const registerSchema = z
  .object({
    name: z
      .string({ required_error: 'name é obrigatório' })
      .trim()
      .min(2, 'name deve ter no mínimo 2 caracteres')
      .max(120, 'name deve ter no máximo 120 caracteres'),
    email: z
      .string({ required_error: 'email é obrigatório' })
      .trim()
      .toLowerCase()
      .email('email inválido')
      .max(180),
    password: z
      .string({ required_error: 'password é obrigatório' })
      .min(8, 'password deve ter no mínimo 8 caracteres')
      .max(72, 'password deve ter no máximo 72 caracteres'),
  })
  .strict();

const loginSchema = z
  .object({
    email: z
      .string({ required_error: 'email é obrigatório' })
      .trim()
      .toLowerCase()
      .email('email inválido'),
    password: z
      .string({ required_error: 'password é obrigatório' })
      .min(1, 'password é obrigatório'),
  })
  .strict();

module.exports = { registerSchema, loginSchema };
