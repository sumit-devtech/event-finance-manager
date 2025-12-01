import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  Res,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { Response } from "express";
import { FilesService } from "./files.service";
import { StorageService } from "./storage.service";
import { UploadFileDto } from "./dto/upload-file.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../auth/types/user-role.enum";

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

@Controller("files")
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly storageService: StorageService,
  ) {}

  @Post("upload")
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: (req, file, cb) => {
          // Temporary directory, will be moved to final location
          const tempDir = "./uploads/temp";
          if (!require("fs").existsSync(tempDir)) {
            require("fs").mkdirSync(tempDir, { recursive: true });
          }
          cb(null, tempDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = require("path").extname(file.originalname);
          cb(null, `temp-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  @Roles(UserRole.Admin, UserRole.EventManager, UserRole.Finance)
  @UseGuards(RolesGuard)
  async uploadFile(
    @UploadedFile() file: MulterFile | undefined,
    @Query() uploadDto: UploadFileDto,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }

    return this.filesService.uploadFile(file, uploadDto, req.user.id);
  }

  @Get(":id")
  @Roles(UserRole.Admin, UserRole.EventManager, UserRole.Finance, UserRole.Viewer)
  @UseGuards(RolesGuard)
  async downloadFile(@Param("id") id: string, @Res() res: Response) {
    const result = await this.filesService.downloadFile(id);

    const fileType = result.file.mimeType || "application/octet-stream";
    const fileName = result.file.filename || "file";

    res.setHeader("Content-Type", fileType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`,
    );

    result.stream.pipe(res);
  }

  @Get("list")
  @Roles(UserRole.Admin, UserRole.EventManager, UserRole.Finance, UserRole.Viewer)
  @UseGuards(RolesGuard)
  listFiles(
    @Query("eventId") eventId?: string,
    @Query("budgetItemId") budgetItemId?: string,
  ) {
    return this.filesService.listFiles({ eventId, budgetItemId });
  }

  @Get(":id/metadata")
  @Roles(UserRole.Admin, UserRole.EventManager, UserRole.Finance, UserRole.Viewer)
  @UseGuards(RolesGuard)
  async getFileMetadata(@Param("id") id: string) {
    return this.filesService.getFileMetadata(id);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @Roles(UserRole.Admin, UserRole.EventManager, UserRole.Finance)
  @UseGuards(RolesGuard)
  async deleteFile(@Param("id") id: string, @Request() req) {
    return this.filesService.deleteFile(id, req.user.id);
  }
}

