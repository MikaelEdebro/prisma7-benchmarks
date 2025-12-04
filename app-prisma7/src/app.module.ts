import { Module } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";

import { AppController } from "./app.controller";
import { PrismaService } from "./prisma.service";

@Module({
  imports: [],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}
