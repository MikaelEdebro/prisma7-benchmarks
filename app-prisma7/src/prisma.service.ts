import { Injectable } from "@nestjs/common";
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const pool = new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
      max: 10,
    });
    super({ adapter: pool });
  }
}
