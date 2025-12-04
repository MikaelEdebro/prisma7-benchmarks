import "dotenv/config";

import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log"],
    bufferLogs: true,
    cors: true,
  });

  app.enableShutdownHooks();

  const port = 8085;
  await app.listen(port, () => {
    console.log(`🚀 Server ready at http://localhost:${port}`);
  });
}

bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
