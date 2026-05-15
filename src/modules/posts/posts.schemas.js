const { z } = require('zod');

const uuid = z.string().uuid('id inválido');

const createPostSchema = z
  .object({
    title: z
      .string({ required_error: 'title é obrigatório' })
      .trim()
      .min(3, 'title deve ter no mínimo 3 caracteres')
      .max(180),
    content: z.string().trim().max(50_000).optional(),
    published: z.boolean().optional().default(false),
  })
  .strict();

const updatePostSchema = z
  .object({
    title: z.string().trim().min(3).max(180).optional(),
    content: z.string().trim().max(50_000).nullable().optional(),
    published: z.boolean().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Informe pelo menos um campo para atualizar',
  });

const idParamSchema = z.object({ id: uuid });

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().min(1).max(180).optional(),
});

module.exports = {
  createPostSchema,
  updatePostSchema,
  idParamSchema,
  listQuerySchema,
};
