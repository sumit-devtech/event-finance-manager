import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "./config/config.module";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthController } from "./health/health.controller";

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}

