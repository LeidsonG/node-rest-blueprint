const prisma = require('../../prisma/client');
const {
  NotFoundError,
  ForbiddenError,
} = require('../../errors/AppError');

const AUTHOR_SELECT = { id: true, name: true };

async function listPublished({ page, limit, search }) {
  const where = { published: true };
  if (search) {
    where.title = { contains: search, mode: 'insensitive' };
  }

  const skip = (page - 1) * limit;

  const [items, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { author: { select: AUTHOR_SELECT } },
    }),
    prisma.post.count({ where }),
  ]);

  return {
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

async function getByIdPublic(id) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: { author: { select: AUTHOR_SELECT } },
  });

  // Posts não publicados só são visíveis publicamente como 404.
  if (!post || !post.published) {
    throw new NotFoundError('Post não encontrado');
  }
  return post;
}

async function create(authorId, data) {
  return prisma.post.create({
    data: { ...data, authorId },
    include: { author: { select: AUTHOR_SELECT } },
  });
}

async function assertOwnership(postId, userId) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true },
  });
  if (!post) throw new NotFoundError('Post não encontrado');
  if (post.authorId !== userId) throw new ForbiddenError('Você não é o autor deste post');
  return post;
}

async function update(postId, userId, data) {
  await assertOwnership(postId, userId);
  return prisma.post.update({
    where: { id: postId },
    data,
    include: { author: { select: AUTHOR_SELECT } },
  });
}

async function remove(postId, userId) {
  await assertOwnership(postId, userId);
  await prisma.post.delete({ where: { id: postId } });
}

module.exports = {
  listPublished,
  getByIdPublic,
  create,
  update,
  remove,
};
