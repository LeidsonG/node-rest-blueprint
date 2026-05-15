const { z } = require('zod');

const updateMeSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'name deve ter no mínimo 2 caracteres')
      .max(120)
      .optional(),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('email inválido')
      .max(180)
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe pelo menos um campo (name ou email)',
  });

module.exports = { updateMeSchema };
