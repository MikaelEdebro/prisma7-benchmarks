import { randomUUID } from "node:crypto";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  for (let i = 0; i < 100; i++) {
    const postId = randomUUID();
    await prisma.post.create({
      data: {
        id: postId,
        title: `Title ${i}`,
        body: `Body text ${i}`,
        createdAt: new Date(),
        comments: {
          create: Array.from({ length: 10 }, (_, j) => ({
            id: randomUUID(),
            content: `This is comment ${j} on post ${i}. Lorem ipsum dolor sit amet.`,
            authorName: `Author ${j}`,
            createdAt: new Date(),
          })),
        },
      },
    });
  }
  await prisma.$disconnect();
}

main().catch(async (e: unknown) => {
  console.error(e);
  try {
    await prisma.$disconnect();
  } catch {}
  process.exit(1);
});
