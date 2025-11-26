import { Module } from "@nestjs/common";
import { RoiController } from "./roi.controller";
import { RoiService } from "./roi.service";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [RoiController],
  providers: [RoiService],
  exports: [RoiService],
})
export class RoiModule {}

