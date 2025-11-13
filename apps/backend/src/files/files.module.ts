import { Module } from "@nestjs/common";
import { FilesService } from "./files.service";
import { FilesController } from "./files.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { StorageService } from "./storage.service";
import { ConfigModule } from "../config/config.module";

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [FilesController],
  providers: [FilesService, StorageService],
  exports: [FilesService, StorageService],
})
export class FilesModule {}

