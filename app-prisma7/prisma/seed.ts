import { randomUUID } from "node:crypto";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

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
