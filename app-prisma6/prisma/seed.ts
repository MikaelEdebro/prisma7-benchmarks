import { randomUUID } from "node:crypto";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  for (let i = 0; i < 1000; i++) {
    await prisma.post.create({
      data: {
        id: randomUUID(),
        title: `Title ${i}`,
        body: `Body text ${i}`,
        createdAt: new Date(),
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
