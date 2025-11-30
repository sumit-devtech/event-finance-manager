import { Module } from "@nestjs/common";
import { StrategicGoalsService } from "./strategic-goals.service";
import { StrategicGoalsController } from "./strategic-goals.controller";
import { PrismaModule } from "../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [StrategicGoalsController],
  providers: [StrategicGoalsService],
  exports: [StrategicGoalsService],
})
export class StrategicGoalsModule {}

