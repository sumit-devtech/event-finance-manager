import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";

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
      "http://localhost:3333", // Allow Remix dev server if on same port
      "http://localhost:3000", // Common alternative port
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

  // Global error handling filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  const port = process.env.PORT ?? 3333;
  await app.listen(port);
  logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
}
bootstrap();

