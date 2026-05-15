# Node REST Blueprint

[![CI](https://github.com/LeidsonG/node-rest-blueprint/actions/workflows/ci.yml/badge.svg)](https://github.com/LeidsonG/node-rest-blueprint/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)

Blueprint open source de **REST API** em Node.js, pronto para ser usado como base de projetos profissionais. Implementa autenticação JWT, CRUD de posts e gestão de usuário com as melhores práticas de segurança, validação e documentação automática.

> 📘 Primeira vez mexendo com REST API? Comece pelo **[APRENDER.md](APRENDER.md)** — uma aula completa do zero, cobrindo conceitos, autenticação JWT e cada endpoint campo a campo.
>
> Já manja? Veja **[USAGE.md](USAGE.md)** para um guia direto de uso da API (com exemplos `curl`).

## Sumário

- [Stack](#stack)
- [Funcionalidades](#funcionalidades)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Quick start](#quick-start)
- [Rodando os testes](#rodando-os-testes)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Endpoints](#endpoints)
- [Segurança](#segurança)
- [Documentação (Swagger)](#documentação-swagger)
- [Docker](#docker)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

## Stack

- **Node.js** 20+ / **Express** 4
- **PostgreSQL** 16 com **Prisma** ORM
- **JWT** (`jsonwebtoken` + `bcryptjs`)
- **Zod** para validação de entrada
- **Helmet**, **CORS** e **express-rate-limit** para segurança
- **Swagger** (swagger-jsdoc + swagger-ui-express) para documentação automática
- **Jest** + **Supertest** para testes de integração
- **Docker Compose** para o banco
- **GitHub Actions** para CI

## Funcionalidades

- Cadastro e login com JWT (bcrypt cost configurável)
- Endpoints `/users/me` para gerenciar a própria conta
- CRUD de posts com publicação (`published` boolean) e busca paginada
- Ownership checks (apenas o autor pode editar/deletar)
- Validação centralizada com mensagens claras
- ErrorHandler global com mapeamento de Zod e Prisma errors
- Rate limit nos endpoints de autenticação (anti brute-force)
- Graceful shutdown (SIGINT/SIGTERM)
- Health check em `/health`

## Estrutura do projeto

```
src/
  app.js                    # Express factory (sem subir servidor)
  server.js                 # Entrypoint com graceful shutdown
  config/
    env.js                  # Valida e expõe as env vars (Zod)
  docs/
    swagger.js              # Spec OpenAPI 3
  errors/
    AppError.js             # Classes de erro de domínio
  middlewares/
    authenticate.js         # JWT Bearer
    errorHandler.js         # Global error + notFound
    rateLimiters.js         # Rate limit para /auth
    validate.js             # Validação via Zod
  modules/
    auth/
      auth.controller.js
      auth.routes.js
      auth.schemas.js
      auth.service.js
    users/
      users.controller.js
      users.routes.js
      users.schemas.js
      users.service.js
    posts/
      posts.controller.js
      posts.routes.js
      posts.schemas.js
      posts.service.js
  prisma/
    client.js               # Singleton do PrismaClient
prisma/
  schema.prisma             # Models User e Post
tests/
  helpers/
    db.js                   # Reset entre testes
  integration/
    auth.test.js
    posts.test.js
docker/
  postgres/init/
    01-create-test-db.sql   # Cria o banco de testes automaticamente
.github/
  workflows/
    ci.yml                  # GitHub Actions
```

## Pré-requisitos

- Node.js **>= 18** (recomendado 20+)
- Docker + Docker Compose **OU** PostgreSQL 14+ rodando localmente
- npm 9+

## Quick start

```bash
# 1. Clone
git clone https://github.com/<seu-usuario>/node-rest-blueprint.git
cd node-rest-blueprint

# 2. Instale dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
cp .env.test.example .env.test
# Edite .env e troque JWT_SECRET por algo longo e aleatório

# 4. Suba o PostgreSQL
docker compose up -d

# 5. Rode as migrations (banco de dev e de testes)
npx prisma migrate dev --name init
npm run migrate:test

# 6. Suba a API em modo dev
npm run dev
```

A API estará em `http://localhost:3000` e a documentação interativa em `http://localhost:3000/api-docs`.

> **Sem Docker?** Crie manualmente os bancos `node_rest_blueprint` e `node_rest_blueprint_test` no seu PostgreSQL local e ajuste `DATABASE_URL` em `.env` e `.env.test`.

## Rodando os testes

```bash
# Roda os testes de integração contra o banco de testes
npm test

# Com coverage
npm run test:coverage

# Modo watch
npm run test:watch
```

Os testes:
- Usam o banco `node_rest_blueprint_test` (criado automaticamente pelo init script do Docker)
- Limpam as tabelas entre cada teste via `prisma.$transaction`
- Cobrem os cenários críticos de auth (registro, login, mensagens genéricas) e posts (CRUD, ownership, paginação)

## Variáveis de ambiente

Todas validadas no boot com Zod — a aplicação falha rápido se algo estiver inválido.

| Variável                    | Tipo    | Default               | Descrição                                                    |
| --------------------------- | ------- | --------------------- | ------------------------------------------------------------ |
| `NODE_ENV`                  | enum    | `development`         | `development` \| `test` \| `production`                      |
| `PORT`                      | number  | `3000`                | Porta HTTP                                                   |
| `DATABASE_URL`              | url     | _(obrigatório)_       | Connection string do PostgreSQL                              |
| `JWT_SECRET`                | string  | _(obrigatório)_       | Segredo do JWT (mín. 16 chars)                               |
| `JWT_EXPIRES_IN`            | string  | `7d`                  | Validade do token (ex: `1h`, `7d`)                           |
| `BCRYPT_SALT_ROUNDS`        | number  | `10`                  | Cost do bcrypt (4–15)                                        |
| `AUTH_RATE_LIMIT_WINDOW_MS` | number  | `900000` (15min)      | Janela do rate limit em `/auth/*`                            |
| `AUTH_RATE_LIMIT_MAX`       | number  | `5`                   | Máximo de requests por janela                                |
| `CORS_ORIGIN`               | string  | `*`                   | Origem permitida (use uma lista CSV em produção)             |

## Endpoints

| Método   | Rota              | Auth | Descrição                                          |
| -------- | ----------------- | ---- | -------------------------------------------------- |
| `GET`    | `/health`         | —    | Liveness check                                     |
| `GET`    | `/api-docs`       | —    | Swagger UI                                         |
| `GET`    | `/api-docs.json`  | —    | Spec OpenAPI 3 em JSON                             |
| `POST`   | `/auth/register`  | —    | Cria um novo usuário                               |
| `POST`   | `/auth/login`     | —    | Autentica e retorna JWT                            |
| `GET`    | `/users/me`       | JWT  | Dados do usuário autenticado                       |
| `PUT`    | `/users/me`       | JWT  | Atualiza `name` e/ou `email`                       |
| `DELETE` | `/users/me`       | JWT  | Deleta a conta (e seus posts em cascade)           |
| `GET`    | `/posts`          | —    | Lista posts publicados (paginado, com busca)       |
| `GET`    | `/posts/:id`      | —    | Detalhe de um post publicado                       |
| `POST`   | `/posts`          | JWT  | Cria um post                                       |
| `PUT`    | `/posts/:id`      | JWT  | Atualiza um post (apenas o autor)                  |
| `DELETE` | `/posts/:id`      | JWT  | Deleta um post (apenas o autor)                    |

> Veja **[USAGE.md](USAGE.md)** para exemplos completos com `curl`.

## Segurança

Decisões deliberadas:

- **Senhas** sempre hasheadas com `bcrypt` (cost configurável). Nunca retornadas em nenhuma resposta.
- **Login resistente a enumeração**: email inexistente e senha errada retornam a mesma mensagem `Credenciais inválidas` (HTTP 401).
- **Mitigação de timing attack**: `bcrypt.compare` é executado mesmo quando o usuário não existe (evita medir tempo de resposta).
- **Rate limit** nos endpoints de autenticação (defesa contra brute-force).
- **Helmet** com headers seguros por padrão (HSTS, X-Content-Type-Options, etc).
- **CORS** configurável via env.
- **Zod `.strict()`** em todos os inputs (rejeita campos extras → defesa contra mass assignment).
- **JWT Bearer** validado em todos os endpoints protegidos; expirado vs inválido distinguidos.
- **Ownership checks** em PUT/DELETE de posts (`req.user.sub === post.authorId`).
- **Posts não publicados** retornam 404 em rotas públicas (não vazam existência do recurso).
- **Trust proxy** ligado para rate limit ver o IP real atrás de proxies/load balancers.
- **Body limit** de 1MB no parser.
- **Stack trace** nunca exposta em `production`.

## Documentação (Swagger)

A spec OpenAPI 3 é gerada a partir dos JSDoc nas rotas + schemas centralizados em `src/docs/swagger.js`.

- UI interativa: `GET /api-docs`
- Spec em JSON: `GET /api-docs.json`
- Use o botão **Authorize** para colar `Bearer <token>` e testar endpoints protegidos diretamente do navegador.

## Docker

### Subir só o banco

```bash
docker compose up -d
```

Sobe PostgreSQL 16 com healthcheck e cria os bancos `node_rest_blueprint` (app) e `node_rest_blueprint_test` (testes) automaticamente.

### Build da API

```bash
docker build -t node-rest-blueprint .
docker run --rm -p 3000:3000 --env-file .env --network host node-rest-blueprint
```

O `Dockerfile` é multi-stage, roda como usuário não-root e tem `HEALTHCHECK` apontando para `/health`.

## Contribuindo

Pull requests são bem-vindos! Antes de abrir um PR:

1. Crie uma branch a partir de `main`
2. Rode `npm test` e garanta que tudo passa
3. Use **Conventional Commits** nas mensagens (`feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`)
4. Mantenha o escopo da PR pequeno e focado

## Licença

[MIT](LICENSE) © Leidson F. Gonçalves
