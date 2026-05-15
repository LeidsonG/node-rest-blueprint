const request = require('supertest');
const buildApp = require('../../src/app');
const { resetDatabase, disconnect } = require('../helpers/db');

const app = buildApp();

const validUser = {
  name: 'Maria Silva',
  email: 'maria@example.com',
  password: 'senha-forte-123',
};

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await disconnect();
});

describe('POST /auth/register', () => {
  test('201 + user sem password com dados validos', async () => {
    const res = await request(app).post('/auth/register').send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({
      name: validUser.name,
      email: validUser.email,
    });
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.user.id).toEqual(expect.any(String));
  });

  test('409 quando email ja esta cadastrado', async () => {
    await request(app).post('/auth/register').send(validUser).expect(201);
    const res = await request(app).post('/auth/register').send(validUser);

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('ConflictError');
  });

  test('400 quando campos obrigatorios faltam', async () => {
    const res = await request(app).post('/auth/register').send({ email: 'x@y.com' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('ValidationError');
    expect(res.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'name' }),
        expect.objectContaining({ path: 'password' }),
      ]),
    );
  });
});

describe('POST /auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/auth/register').send(validUser).expect(201);
  });

  test('200 + token com credenciais validas', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user.email).toBe(validUser.email);
    expect(res.body.user.password).toBeUndefined();
  });

  test('401 com mensagem generica quando a senha esta errada', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: validUser.email, password: 'errada-errada' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Credenciais inválidas');
  });

  test('401 com a mesma mensagem quando o email nao existe', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'nao-existe@example.com', password: 'qualquer-coisa' });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Credenciais inválidas');
  });
});
