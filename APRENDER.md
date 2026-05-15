# Aula — Aprendendo a API do zero

Este guia é uma **aula completa** desta API, escrita para quem nunca mexeu com REST API antes. Vamos do conceito (o que é uma "rota", o que é um "status code") até cada campo de cada endpoint deste projeto, com exemplos reais que você pode rodar.

> Pré-requisito: você só precisa ter rodado o **Quick start** do [README](README.md) (Docker + `npm install` + `npm run migrate` + `npm run dev`). Se a API responde em `http://localhost:3000/health`, está pronto.

## Sumário

- [Parte 1 — Os conceitos básicos](#parte-1--os-conceitos-básicos)
  - [O que é uma REST API](#o-que-é-uma-rest-api)
  - [Anatomia de uma requisição HTTP](#anatomia-de-uma-requisição-http)
  - [Os métodos HTTP (GET, POST, PUT, DELETE)](#os-métodos-http)
  - [Status codes — a "resposta curta" da API](#status-codes)
  - [JSON — o formato que tudo fala](#json--o-formato-que-tudo-fala)
  - [Headers — informações extras da requisição](#headers)
- [Parte 2 — Como testar (ferramentas)](#parte-2--como-testar)
  - [Swagger UI (o mais fácil)](#swagger-ui)
  - [curl (no terminal)](#curl)
  - [Postman / Insomnia](#postman--insomnia)
- [Parte 3 — Autenticação: como a API sabe quem é você](#parte-3--autenticação)
  - [Por que precisa de JWT](#por-que-precisa-de-jwt)
  - [O fluxo completo](#o-fluxo-completo-de-auth)
- [Parte 4 — Todos os endpoints, campo a campo](#parte-4--todos-os-endpoints)
  - [Auth](#auth)
  - [Users](#users)
  - [Posts](#posts)
- [Parte 5 — Erros: o que cada um significa](#parte-5--erros)
- [Parte 6 — Rate limit: por que sou "bloqueado"](#parte-6--rate-limit)
- [Parte 7 — Como o backend está organizado por dentro](#parte-7--organização-do-backend)
- [Parte 8 — Glossário rápido](#parte-8--glossário-rápido)
- [Parte 9 — Para aprender mais](#parte-9--para-aprender-mais)

---

## Parte 1 — Os conceitos básicos

### O que é uma REST API

Uma **API** (Application Programming Interface) é um "atendente" que recebe pedidos e devolve respostas. Quando um app do celular mostra a sua lista de posts, ele está, por baixo dos panos, perguntando a uma API: "me dá os posts publicados". A API consulta o banco de dados e devolve a lista.

**REST** é um conjunto de convenções sobre **como** esses pedidos devem ser feitos:

- Cada "coisa" (recurso) tem uma URL própria: `/users`, `/posts`, `/posts/abc-123`.
- O "verbo" da operação (criar, ler, atualizar, deletar) vem do **método HTTP** (`GET`, `POST`, `PUT`, `DELETE`).
- A "linguagem" usada para enviar e receber dados é geralmente **JSON**.

Em uma frase: **REST API = um servidor HTTP que segue convenções padronizadas para CRUD de recursos**.

### Anatomia de uma requisição HTTP

Toda requisição tem 4 partes:

```
POST /auth/login HTTP/1.1                  ← método + rota
Host: localhost:3000                       ← onde o servidor está
Content-Type: application/json             ← headers (informações extras)
Authorization: Bearer eyJhbGciOi...

{                                          ← body (corpo, opcional)
  "email": "voce@ex.com",
  "password": "senha12345"
}
```

A resposta tem a mesma estrutura, mas com **status code** no lugar do método:

```
HTTP/1.1 200 OK                            ← status code (200 = sucesso)
Content-Type: application/json

{                                          ← body de resposta
  "token": "eyJhbGciOi...",
  "user": { "id": "...", "name": "..." }
}
```

### Os métodos HTTP

| Método | Significado | Tem body? | Exemplo nesta API |
|---|---|---|---|
| `GET` | Ler / buscar | Não | `GET /posts` → lista posts |
| `POST` | Criar | Sim | `POST /auth/register` → cria conta |
| `PUT` | Atualizar (substituir / editar) | Sim | `PUT /posts/:id` → edita post |
| `DELETE` | Deletar | Não | `DELETE /posts/:id` → remove post |

> Existe também `PATCH` (atualização parcial), mas este projeto usa `PUT` para atualizar campos parciais — é uma escolha comum em APIs pequenas.

### Status codes

São códigos numéricos de 3 dígitos que resumem o que aconteceu. Os principais que você verá:

| Código | Família | O que significa |
|---|---|---|
| **200** | Sucesso | OK, request processado, segue a resposta |
| **201** | Sucesso | Criado (geralmente em `POST`) |
| **204** | Sucesso | OK, mas sem body (usado em `DELETE`) |
| **400** | Erro do cliente | Você mandou dados inválidos (Bad Request) |
| **401** | Erro do cliente | Você não está autenticado (Unauthorized) |
| **403** | Erro do cliente | Você está autenticado, mas não pode fazer isso (Forbidden) |
| **404** | Erro do cliente | O recurso não existe (Not Found) |
| **409** | Erro do cliente | Conflito (ex.: email já cadastrado) |
| **429** | Erro do cliente | Muitas requisições, fui bloqueado (Rate limit) |
| **500** | Erro do servidor | Bug no servidor, não foi culpa sua |

**Regra mental rápida:** começa com `2` → deu certo. `4` → você errou. `5` → o servidor errou.

### JSON — o formato que tudo fala

JSON é só um jeito de escrever dados em texto. Suporta:

```json
{
  "string": "texto entre aspas",
  "numero": 42,
  "booleano": true,
  "nada": null,
  "lista": [1, 2, 3],
  "objeto_aninhado": { "chave": "valor" }
}
```

Detalhes importantes:
- **Sempre aspas duplas** (não use aspas simples)
- **Sem vírgula** no último item de uma lista ou objeto
- A API sempre envia e espera receber JSON com o header `Content-Type: application/json`

### Headers

Headers são "metadados" da requisição. Os que aparecem nesta API:

| Header | Para quê | Exemplo |
|---|---|---|
| `Content-Type` | Diz o formato do body | `application/json` |
| `Authorization` | Carrega seu token JWT | `Bearer eyJhbGciOi...` |
| `RateLimit-*` | (Resposta) sobrou quantas chamadas no rate limit | `RateLimit-Remaining: 4` |

---

## Parte 2 — Como testar

### Swagger UI

A forma mais fácil de explorar a API. Com o servidor rodando, abra:

**http://localhost:3000/api-docs**

Cada endpoint vira um botão. Você clica, preenche o body, clica em **Execute** e vê a resposta real, com status code, headers e body. Para endpoints protegidos, clica no botão **Authorize** no topo, cola o token (sem o "Bearer ") e a UI passa a mandar o header sozinha.

### curl

`curl` é um cliente HTTP de linha de comando. Vem instalado no Windows 10+, macOS e Linux. A sintaxe básica:

```bash
curl -X MÉTODO URL \
  -H "Header: valor" \
  -d 'body em JSON'
```

Exemplo de chamada simples:

```bash
curl http://localhost:3000/health
# {"status":"ok","timestamp":"..."}
```

Flags úteis:

| Flag | O que faz |
|---|---|
| `-X POST` | Define o método (default é `GET`) |
| `-H "Header: valor"` | Adiciona um header |
| `-d '{...}'` | Manda body |
| `-i` | Mostra também os headers da resposta |
| `-s` | Modo silencioso (sem barra de progresso) |
| `-w "\n%{http_code}\n"` | Mostra o status code no final |

### Postman / Insomnia

São aplicativos de desktop com UI gráfica para fazer requests. Mais confortável que curl para uso contínuo. Você cria uma "coleção", configura a base URL (`http://localhost:3000`), guarda o token em variável de ambiente e vai testando. O Swagger UI deste projeto também serve para isso, mas Postman/Insomnia permitem salvar requests organizadamente.

---

## Parte 3 — Autenticação

### Por que precisa de JWT

Imagine que a API tem milhões de usuários. Quando você manda um `GET /users/me`, como o servidor sabe quem é "você"? Precisa de algum "crachá".

A solução tradicional é **JWT (JSON Web Token)**. Funciona assim:

1. Você manda `email + senha` no login.
2. Servidor confere e devolve um **token** (uma string longa tipo `eyJhbGciOi...`).
3. Esse token é como um crachá assinado pelo servidor. Você guarda ele.
4. Em toda requisição protegida, você manda o header `Authorization: Bearer <token>`.
5. O servidor confere a assinatura, lê quem você é, e processa.

O token tem **validade** (neste projeto: 7 dias, configurável em `JWT_EXPIRES_IN`). Depois disso, você precisa fazer login de novo.

### O fluxo completo de auth

```
┌──────────┐                              ┌──────────┐
│  Você    │                              │   API    │
└────┬─────┘                              └────┬─────┘
     │ POST /auth/register                     │
     │ { name, email, password }               │
     ├────────────────────────────────────────►│
     │                                         │ Salva no banco
     │                                         │ (senha vai com hash bcrypt)
     │ 201 { user: { id, name, email } }       │
     │◄────────────────────────────────────────┤
     │                                         │
     │ POST /auth/login                        │
     │ { email, password }                     │
     ├────────────────────────────────────────►│
     │                                         │ Confere bcrypt
     │ 200 { token, user }                     │ Gera JWT
     │◄────────────────────────────────────────┤
     │                                         │
     │ GET /users/me                           │
     │ Authorization: Bearer <token>           │
     ├────────────────────────────────────────►│
     │                                         │ Valida JWT
     │ 200 { user }                            │ Busca user
     │◄────────────────────────────────────────┤
```

---

## Parte 4 — Todos os endpoints

Em cada endpoint abaixo você verá: o que faz, se precisa de autenticação, os campos aceitos com regras de validação, o que volta em caso de sucesso, e os erros possíveis.

### Auth

#### `POST /auth/register` — Criar conta

**Pra que serve:** Cadastra um novo usuário no sistema. A senha é "hasheada" com bcrypt antes de salvar (significa: viramos em algo embaralhado que não pode ser revertido, então mesmo quem invadir o banco não vê a senha original).

**Autenticação:** Não precisa (rota pública).

**Body (JSON):**

| Campo | Tipo | Obrigatório | Regras |
|---|---|---|---|
| `name` | string | Sim | 2 a 120 caracteres |
| `email` | string | Sim | Formato de email, até 180 caracteres. Normalizado para minúsculas. |
| `password` | string | Sim | 8 a 72 caracteres (limite do bcrypt) |

> **`.strict()`**: o schema rejeita qualquer campo extra. Se você mandar `{ "name": "x", "email": "y", "password": "z", "admin": true }`, ele recusa.

**Resposta `201 Created`:**

```json
{
  "user": {
    "id": "uuid-aqui",
    "name": "Leidson",
    "email": "leidson@test.com",
    "createdAt": "2026-05-15T18:00:00.000Z",
    "updatedAt": "2026-05-15T18:00:00.000Z"
  }
}
```

> O campo `password` **nunca** aparece na resposta. Isso é uma regra do projeto inteiro.

**Erros:**
- `400 ValidationError` — algum campo está faltando ou inválido
- `409 ConflictError` — email já cadastrado
- `429 TooManyRequests` — muitas tentativas (ver [rate limit](#parte-6--rate-limit))

**Exemplo:**

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Leidson",
    "email": "leidson@test.com",
    "password": "senha12345"
  }'
```

#### `POST /auth/login` — Logar e receber token

**Pra que serve:** Verifica suas credenciais e devolve um JWT que você usará em todas as chamadas protegidas.

**Autenticação:** Não precisa.

**Body:**

| Campo | Tipo | Obrigatório | Regras |
|---|---|---|---|
| `email` | string | Sim | Formato de email |
| `password` | string | Sim | Mínimo 1 caractere |

**Resposta `200 OK`:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid-aqui",
    "name": "Leidson",
    "email": "leidson@test.com",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Erros:**
- `400 ValidationError` — campos faltando
- `401 UnauthorizedError` — credenciais inválidas (**mesma mensagem** se o email não existe OU se a senha está errada — isso é proposital, evita "vazar" se um email está cadastrado)
- `429 TooManyRequests` — muitas tentativas

**Detalhe de segurança que vale conhecer:** Mesmo quando o email não existe, o servidor faz um `bcrypt.compare` "fake". Isso impede um atacante de medir o **tempo da resposta** para deduzir se um email está ou não no banco (chamado *timing attack*).

**Exemplo:**

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "leidson@test.com",
    "password": "senha12345"
  }'
```

Guarde o `token` que voltou. Você vai usar em todos os exemplos protegidos.

---

### Users

Todas as rotas de `/users/me` exigem autenticação. Há `router.use(authenticate)` no topo do arquivo de rotas.

#### `GET /users/me` — Ver meu perfil

**Pra que serve:** Devolve os dados do usuário cujo token foi enviado. Útil para um app mostrar "olá, fulano".

**Autenticação:** Sim — `Authorization: Bearer <token>`.

**Body:** Nenhum.

**Resposta `200 OK`:**

```json
{
  "user": {
    "id": "uuid",
    "name": "Leidson",
    "email": "leidson@test.com",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Erros:**
- `401 UnauthorizedError` — token ausente, inválido ou expirado

**Exemplo:**

```bash
curl http://localhost:3000/users/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

#### `PUT /users/me` — Atualizar nome/email

**Pra que serve:** Edita o `name` e/ou `email` da conta. Você só pode editar a **sua própria** conta — a API usa o `sub` do token, ignorando qualquer ID que você passe.

**Autenticação:** Sim.

**Body:**

| Campo | Tipo | Obrigatório | Regras |
|---|---|---|---|
| `name` | string | Opcional | 2 a 120 caracteres |
| `email` | string | Opcional | Formato email, até 180 |

> Pelo menos um dos dois precisa estar presente (`.refine(...)` no schema).

**Resposta `200 OK`:** o usuário atualizado (mesma estrutura do `GET /users/me`).

**Erros:**
- `400 ValidationError` — campos inválidos ou body vazio
- `401 UnauthorizedError` — sem auth
- `409 ConflictError` — o email novo já está em uso por outra conta

**Exemplo (mudar só o nome):**

```bash
curl -X PUT http://localhost:3000/users/me \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Leidson F. Gonçalves" }'
```

#### `DELETE /users/me` — Apagar minha conta

**Pra que serve:** Remove a conta autenticada e, por cascade no banco, **todos os posts** dela.

**Autenticação:** Sim.

**Body:** Nenhum.

**Resposta `204 No Content`:** sem body. Status 204 é "deu certo, mas não há nada pra retornar".

**Erros:**
- `401 UnauthorizedError`

**Cuidado:** depois do delete, seu token continua tecnicamente válido (porque JWT é stateless — o servidor não tem como invalidar), mas qualquer rota que busca o usuário no banco vai falhar com `404` ou `401`.

**Exemplo:**

```bash
curl -X DELETE http://localhost:3000/users/me \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

### Posts

#### `GET /posts` — Listar posts publicados (paginado)

**Pra que serve:** Lista posts onde `published = true`. Posts em rascunho (`published: false`) **não aparecem aqui** — nem para o autor. (O autor precisa de um endpoint específico de "meus rascunhos", que este projeto ainda não tem.)

**Autenticação:** Não precisa (público).

**Query params:**

| Param | Tipo | Default | Regras |
|---|---|---|---|
| `page` | inteiro | `1` | mínimo 1 |
| `limit` | inteiro | `10` | 1 a 100 |
| `search` | string | — | 1 a 180 caracteres, busca no `title` ignorando maiúsculas |

**Resposta `200 OK`:**

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Meu primeiro post",
      "content": "...",
      "published": true,
      "authorId": "uuid",
      "createdAt": "...",
      "updatedAt": "...",
      "author": { "id": "uuid", "name": "Leidson" }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 47,
    "totalPages": 5
  }
}
```

**Como interpretar `pagination`:**
- `total` = número total de posts publicados no banco (com o filtro `search` aplicado)
- `totalPages` = quantas páginas existem com o `limit` atual
- Se `page > totalPages`, a API devolve `data: []` — não erra, só vem vazio

**Exemplos:**

```bash
# Página 2 com 5 por página
curl 'http://localhost:3000/posts?page=2&limit=5'

# Buscar por palavra no título
curl 'http://localhost:3000/posts?search=javascript'
```

#### `GET /posts/:id` — Detalhe de um post

**Pra que serve:** Pega os dados completos de um único post publicado.

**Autenticação:** Não precisa.

**Path param:** `id` — deve ser um UUID válido.

**Resposta `200 OK`:**

```json
{
  "post": {
    "id": "uuid",
    "title": "...",
    "content": "...",
    "published": true,
    "authorId": "uuid",
    "createdAt": "...",
    "updatedAt": "...",
    "author": { "id": "uuid", "name": "Leidson" }
  }
}
```

**Erros:**
- `400 ValidationError` — id não é UUID válido
- `404 NotFoundError` — post não existe OU existe mas `published = false` (proposital, não vaza existência de rascunhos)

**Exemplo:**

```bash
curl http://localhost:3000/posts/abc12345-...
```

#### `POST /posts` — Criar um post

**Pra que serve:** Cria um novo post. O autor é **sempre** o usuário do token — você não pode forjar `authorId` mesmo se mandar no body, porque o schema `.strict()` rejeita campos extras.

**Autenticação:** Sim.

**Body:**

| Campo | Tipo | Obrigatório | Regras |
|---|---|---|---|
| `title` | string | Sim | 3 a 180 caracteres |
| `content` | string | Opcional | até 50.000 caracteres |
| `published` | boolean | Opcional | default `false` (rascunho) |

**Resposta `201 Created`:** o post criado, com o objeto `author` incluído.

**Erros:**
- `400 ValidationError`
- `401 UnauthorizedError`

**Exemplo (rascunho):**

```bash
curl -X POST http://localhost:3000/posts \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Meu primeiro post",
    "content": "Olá mundo!"
  }'
```

**Exemplo (publicado):**

```bash
curl -X POST http://localhost:3000/posts \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Post público",
    "content": "Aparece em GET /posts",
    "published": true
  }'
```

#### `PUT /posts/:id` — Atualizar um post

**Pra que serve:** Edita campos do post. **Só o autor** pode editar.

**Autenticação:** Sim.

**Path param:** `id` (UUID).

**Body** (pelo menos um campo):

| Campo | Tipo | Regras |
|---|---|---|
| `title` | string | 3 a 180 |
| `content` | string ou `null` | até 50.000. `null` apaga o content. |
| `published` | boolean | true/false (publica ou volta pra rascunho) |

**Resposta `200 OK`:** o post atualizado.

**Erros:**
- `400 ValidationError` — id inválido, body vazio ou campos inválidos
- `401 UnauthorizedError` — sem token
- `403 ForbiddenError` — você não é o autor (`assertOwnership` no service)
- `404 NotFoundError` — post não existe

**Exemplo (publicar um rascunho):**

```bash
curl -X PUT http://localhost:3000/posts/abc-123 \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "published": true }'
```

#### `DELETE /posts/:id` — Deletar um post

**Pra que serve:** Remove um post. Só o autor pode.

**Autenticação:** Sim.

**Path param:** `id` (UUID).

**Resposta `204 No Content`:** sem body.

**Erros:**
- `400 ValidationError` — id inválido
- `401 UnauthorizedError`
- `403 ForbiddenError` — não é o autor
- `404 NotFoundError`

**Exemplo:**

```bash
curl -X DELETE http://localhost:3000/posts/abc-123 \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## Parte 5 — Erros

Toda resposta de erro tem este formato:

```json
{
  "error": "TipoDoErro",
  "message": "Mensagem em pt-BR",
  "details": [ /* opcional, presente em ValidationError */ ]
}
```

### Como o errorHandler funciona

Quando algo dá errado em qualquer camada, o erro "borbulha" até o middleware [errorHandler.js](src/middlewares/errorHandler.js), que decide:

| Tipo do erro | Resposta |
|---|---|
| `ZodError` (validação Zod) | `400` + lista de `details` |
| `AppError` (e subclasses do projeto) | `statusCode` da classe + mensagem |
| `Prisma P2002` (unique constraint) | `409 ConflictError` |
| `Prisma P2025` (registro não encontrado) | `404 NotFoundError` |
| Qualquer outra coisa | `500 InternalServerError` |

> Em `production`, erros 500 não expõem stack trace. Em `development`/`test`, vem um `debug` com a mensagem e stack para facilitar.

### Exemplo de `ValidationError`

Mandando body inválido em `POST /auth/register`:

```json
{
  "error": "ValidationError",
  "message": "Dados inválidos",
  "details": [
    { "path": "body.email", "message": "email inválido" },
    { "path": "body.password", "message": "password deve ter no mínimo 8 caracteres" }
  ]
}
```

O `details` te diz **qual campo** falhou e **por quê**.

---

## Parte 6 — Rate limit

A API tem um rate limiter aplicado nas rotas de autenticação (`POST /auth/register` e `POST /auth/login`). Configuração em `.env`:

```ini
AUTH_RATE_LIMIT_WINDOW_MS=900000   # 15 minutos
AUTH_RATE_LIMIT_MAX=5              # até 5 requests por janela
```

Isso significa: **mais de 5 tentativas em 15 minutos do mesmo IP → bloqueado** com:

```json
{
  "error": "TooManyRequests",
  "message": "Muitas tentativas. Tente novamente mais tarde."
}
```

(status `429`).

A resposta também traz headers úteis (padrão `draft-7`):

```
RateLimit-Limit: 5
RateLimit-Remaining: 3
RateLimit-Reset: 845
```

`RateLimit-Reset` é o número de segundos até a janela "zerar". Você pode usar para mostrar ao usuário quando ele pode tentar de novo.

**Para que serve:** impedir ataques de força bruta no login.

> Se durante o desenvolvimento você ficar bloqueado, basta reiniciar o servidor (o limite é em memória neste projeto). Em produção, o ideal é usar Redis para compartilhar entre múltiplas instâncias.

---

## Parte 7 — Organização do backend

A pasta `src/` segue um padrão chamado **arquitetura em camadas modular**:

```
src/
  app.js              ← cria a aplicação Express (sem subir servidor)
  server.js           ← chama app.js e faz app.listen (entrypoint)
  config/
    env.js            ← lê .env, valida com Zod, exporta vars tipadas
  docs/swagger.js     ← spec OpenAPI 3 (usado pelo Swagger UI)
  errors/AppError.js  ← classes de erro (NotFoundError, ForbiddenError…)
  middlewares/
    authenticate.js   ← lê e valida o JWT
    validate.js       ← roda Zod no body/params/query
    rateLimiters.js   ← express-rate-limit configurado
    errorHandler.js   ← captura todo erro e devolve JSON padronizado
  modules/
    auth/
      auth.routes.js     ← define POST /auth/register e /auth/login
      auth.controller.js ← funções que recebem (req, res, next)
      auth.service.js    ← lógica de negócio, fala com Prisma
      auth.schemas.js    ← schemas Zod para validar input
    users/  ← mesma estrutura, para /users/me
    posts/  ← mesma estrutura, para /posts
  prisma/client.js    ← exporta uma instância única do PrismaClient
```

### Como uma requisição flui

Tomando `POST /posts` como exemplo:

```
1. app.js cai na rota /posts → posts.routes.js
2. authenticate middleware → confere Bearer token, popula req.user
3. validate middleware → roda createPostSchema no body
4. posts.controller.create → extrai req.user.sub e req.body
5. posts.service.create → chama prisma.post.create
6. Devolve 201 com o post + author
```

Se qualquer passo lança erro → cai no `errorHandler` (Parte 5).

**Por que dividir assim:**
- **routes**: só descreve o que existe, sem lógica
- **controller**: cola entre HTTP e regra de negócio (ele "fala HTTP")
- **service**: a regra de negócio em si (ela não sabe que existe HTTP)
- **schema**: tudo que valida input

Isso permite trocar de framework (Express → Fastify) mexendo só no controller/routes, ou testar o service sem subir servidor.

---

## Parte 8 — Glossário rápido

| Termo | O que é |
|---|---|
| **REST** | Padrão de design de APIs HTTP em torno de "recursos" |
| **Endpoint** | Uma combinação `método + rota` (ex: `POST /auth/login`) |
| **Resource** | "Coisa" que a API expõe (`User`, `Post`) |
| **JWT** | JSON Web Token — string assinada que prova quem você é |
| **Bearer token** | Esquema de autenticação onde o token vai no header `Authorization` |
| **Middleware** | Função que roda antes do handler final, podendo bloquear ou enriquecer a request |
| **Hash (bcrypt)** | "Embaralhar" senha de forma irreversível antes de salvar |
| **Salt rounds** | Quantidade de iterações do bcrypt (quanto mais, mais lento e mais seguro) |
| **ORM (Prisma)** | Biblioteca que vira queries SQL em chamadas de função tipo `prisma.user.findUnique` |
| **Migration** | Arquivo que descreve mudanças no schema do banco, versionado no git |
| **CORS** | Política do navegador que decide quais sites podem chamar a API |
| **Rate limit** | Limite de quantas requisições por janela de tempo |
| **OpenAPI / Swagger** | Especificação que descreve a API. Swagger UI é a página interativa gerada a partir dela |
| **UUID** | Identificador longo e único (`abc12345-1234-...`) — substituto seguro pra IDs sequenciais |
| **Cascade delete** | Quando deletar `User` deleta todos os `Post` dele (configurado no schema do Prisma) |

---

## Parte 9 — Para aprender mais

Quando se sentir confortável com este projeto, são bons caminhos:

- **HTTP em profundidade:** [MDN HTTP Overview](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview)
- **REST em detalhes:** [restfulapi.net](https://restfulapi.net/)
- **JWT — entender o que tem dentro do token:** [jwt.io](https://jwt.io/) (cola seu token lá pra ver os claims; nunca cole tokens reais de produção)
- **Express:** [docs oficiais](https://expressjs.com/)
- **Prisma:** [docs oficiais](https://www.prisma.io/docs)
- **Zod:** [docs oficiais](https://zod.dev/) — referência completa de schemas
- **OpenAPI:** [spec v3](https://swagger.io/specification/)

### Próximas funcionalidades que dá pra implementar como exercício

1. **Refresh token** — para o login durar mais sem precisar guardar senha
2. **Endpoint `GET /me/posts`** — listar todos os seus posts (rascunho + publicado)
3. **Tags em posts** — adicionar um model `Tag` e relação N:N
4. **Reset de senha por email** — fluxo com token de uso único
5. **Soft delete** — em vez de remover do banco, marcar `deletedAt` e filtrar nas queries
6. **Upload de avatar** — endpoint de upload + integração com S3 ou similar
7. **Cache de leitura** — usar Redis em `GET /posts` para reduzir queries

Cada um desses te força a aprender um pedaço novo (jobs assíncronos, storage, cache, relações complexas). É assim que se vira backend.
