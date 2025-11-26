import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const logger = new Logger("Bootstrap");

  const app = await NestFactory.create(AppModule, {
    logger: ["error", "warn", "log", "debug", "verbose"],
  });

  // Set global API prefix
  app.setGlobalPrefix("api");

  // Enable CORS
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://localhost:3334", // Different port for simplifi backend
      "http://localhost:3000",
    ],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = process.env.PORT ?? 3334; // Different default port
  await app.listen(port);
  logger.log(`🚀 Simplifi Backend is running on: http://localhost:${port}/api`);
}
bootstrap();

