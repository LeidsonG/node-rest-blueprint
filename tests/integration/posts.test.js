const request = require('supertest');
const buildApp = require('../../src/app');
const { resetDatabase, disconnect } = require('../helpers/db');

const app = buildApp();

async function registerAndLogin({ email, name = 'Test User', password = 'senha-forte-123' }) {
  await request(app).post('/auth/register').send({ name, email, password }).expect(201);
  const res = await request(app).post('/auth/login').send({ email, password }).expect(200);
  return { token: res.body.token, user: res.body.user };
}

beforeEach(async () => {
  await resetDatabase();
});

afterAll(async () => {
  await disconnect();
});

describe('GET /posts', () => {
  test('200 sem autenticacao (rota publica)', async () => {
    const res = await request(app).get('/posts');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.pagination).toMatchObject({ page: 1, limit: 10, total: 0 });
  });

  test('lista apenas posts com published=true', async () => {
    const { token } = await registerAndLogin({ email: 'autor@example.com' });

    await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Publicado', content: 'visivel', published: true })
      .expect(201);
    await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Rascunho', content: 'oculto', published: false })
      .expect(201);

    const res = await request(app).get('/posts');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Publicado');
  });
});

describe('POST /posts', () => {
  test('401 sem token', async () => {
    const res = await request(app).post('/posts').send({ title: 'Teste' });
    expect(res.status).toBe(401);
  });

  test('201 com token valido', async () => {
    const { token, user } = await registerAndLogin({ email: 'criador@example.com' });

    const res = await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Meu primeiro post', content: 'conteudo', published: true });

    expect(res.status).toBe(201);
    expect(res.body.post).toMatchObject({
      title: 'Meu primeiro post',
      authorId: user.id,
      published: true,
    });
  });
});

describe('DELETE /posts/:id', () => {
  test('403 ao tentar deletar post de outro usuario', async () => {
    const { token: tokenA } = await registerAndLogin({ email: 'a@example.com' });
    const { token: tokenB } = await registerAndLogin({ email: 'b@example.com' });

    const created = await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'Post do A', published: true })
      .expect(201);

    const res = await request(app)
      .delete(`/posts/${created.body.post.id}`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('ForbiddenError');
  });

  test('204 ao deletar o proprio post', async () => {
    const { token } = await registerAndLogin({ email: 'dono@example.com' });

    const created = await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Para deletar', published: true })
      .expect(201);

    const res = await request(app)
      .delete(`/posts/${created.body.post.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
  });
});
