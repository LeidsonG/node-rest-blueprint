const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');
const pkg = require('../../package.json');

const definition = {
  openapi: '3.0.3',
  info: {
    title: 'Node REST Blueprint',
    version: pkg.version,
    description:
      'Blueprint open source de REST API em Node.js + Express + Prisma com autenticação JWT, posts e usuários. ' +
      'Use o botão Authorize para enviar o token Bearer.',
    license: { name: 'MIT' },
    contact: {
      name: 'Leidson F. Gonçalves',
      email: 'leidsonpc@gmail.com',
    },
  },
  servers: [{ url: '/', description: 'Servidor atual' }],
  tags: [
    { name: 'Auth', description: 'Cadastro e login' },
    { name: 'Users', description: 'Gestão do próprio usuário' },
    { name: 'Posts', description: 'CRUD de posts (leitura pública, escrita autenticada)' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      RegisterInput: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 120 },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8, maxLength: 72 },
        },
      },
      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
      UpdateMeInput: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
        },
      },
      Post: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          content: { type: 'string', nullable: true },
          published: { type: 'boolean' },
          authorId: { type: 'string', format: 'uuid' },
          author: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreatePostInput: {
        type: 'object',
        required: ['title'],
        properties: {
          title: { type: 'string', minLength: 3, maxLength: 180 },
          content: { type: 'string' },
          published: { type: 'boolean', default: false },
        },
      },
      UpdatePostInput: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 3, maxLength: 180 },
          content: { type: 'string', nullable: true },
          published: { type: 'boolean' },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page: { type: 'integer' },
          limit: { type: 'integer' },
          total: { type: 'integer' },
          totalPages: { type: 'integer' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' },
          details: {},
        },
      },
    },
    responses: {
      ValidationError: {
        description: 'Erro de validação',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      Unauthorized: {
        description: 'Não autenticado / credenciais inválidas',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      Forbidden: {
        description: 'Acesso negado',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      NotFound: {
        description: 'Recurso não encontrado',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      Conflict: {
        description: 'Conflito de recurso',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
      TooManyRequests: {
        description: 'Excedeu o rate limit',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
      },
    },
  },
};

const spec = swaggerJsdoc({
  definition,
  apis: [
    path.join(__dirname, '..', 'modules', '**', '*.routes.js'),
  ],
});

module.exports = spec;
