const { Router } = require('express');
const controller = require('./auth.controller');
const validate = require('../../middlewares/validate');
const { authLimiter } = require('../../middlewares/rateLimiters');
const { registerSchema, loginSchema } = require('./auth.schemas');

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Cadastra um novo usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: Usuário criado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       409: { $ref: '#/components/responses/Conflict' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 */
router.post('/register', authLimiter, validate({ body: registerSchema }), controller.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Autentica e retorna um JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token: { type: string }
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       429: { $ref: '#/components/responses/TooManyRequests' }
 */
router.post('/login', authLimiter, validate({ body: loginSchema }), controller.login);

module.exports = router;
