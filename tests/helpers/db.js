const prisma = require('../../src/prisma/client');

async function resetDatabase() {
  // Trunca em ordem segura: Post primeiro (FK -> User).
  await prisma.$transaction([
    prisma.post.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

async function disconnect() {
  await prisma.$disconnect();
}

module.exports = { prisma, resetDatabase, disconnect };
