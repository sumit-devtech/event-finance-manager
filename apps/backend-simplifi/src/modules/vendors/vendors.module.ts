import { Module } from "@nestjs/common";
import { VendorsController } from "./vendors.controller";
import { VendorsService } from "./vendors.service";
import { ContractsController } from "./contracts/contracts.controller";
import { ContractsService } from "./contracts/contracts.service";
import { PrismaModule } from "../../prisma/prisma.module";
import { ActivityLogsModule } from "../activity-logs/activity-logs.module";

@Module({
  imports: [PrismaModule, ActivityLogsModule],
  controllers: [VendorsController, ContractsController],
  providers: [VendorsService, ContractsService],
  exports: [VendorsService, ContractsService],
})
export class VendorsModule {}

