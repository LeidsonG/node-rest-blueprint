const env = require('./config/env');
const buildApp = require('./app');
const prisma = require('./prisma/client');

const app = buildApp();

const server = app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[server] API ouvindo em http://localhost:${env.PORT} (env=${env.NODE_ENV})`);
});

async function shutdown(signal) {
  // eslint-disable-next-line no-console
  console.log(`\n[server] recebido ${signal}, encerrando...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  // força saida se o close demorar demais
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
