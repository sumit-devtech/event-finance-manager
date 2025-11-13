import { Injectable, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as fs from "fs";
import * as path from "path";
import { diskStorage } from "multer";
import { extname } from "path";

export interface FileValidationOptions {
  maxSize?: number; // in bytes
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
}

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer?: Buffer;
}

@Injectable()
export class StorageService {
  private readonly baseUploadDir: string;

  constructor(private configService: ConfigService) {
    this.baseUploadDir = this.configService.get<string>("UPLOAD_DIR") || "./uploads";
    this.ensureDirectoryExists(this.baseUploadDir);
  }

  getEventUploadPath(eventId: string): string {
    const eventPath = path.join(this.baseUploadDir, "events", eventId);
    this.ensureDirectoryExists(eventPath);
    return eventPath;
  }

  getBudgetItemUploadPath(eventId: string, budgetItemId: string): string {
    const budgetPath = path.join(this.baseUploadDir, "events", eventId, "budget-items", budgetItemId);
    this.ensureDirectoryExists(budgetPath);
    return budgetPath;
  }

  getFilePath(storagePath: string, filename: string): string {
    return path.join(storagePath, filename);
  }

  async saveFile(file: MulterFile, storagePath: string): Promise<string> {
    const filename = this.generateUniqueFilename(file.originalname);
    const filePath = this.getFilePath(storagePath, filename);

    // Ensure directory exists
    this.ensureDirectoryExists(storagePath);

    // If file has a path (from diskStorage), move it; otherwise write buffer
    if (file.path) {
      // Move file from temporary location to final location
      await fs.promises.rename(file.path, filePath);
    } else if (file.buffer) {
      // Write buffer to file
      await fs.promises.writeFile(filePath, file.buffer);
    } else {
      throw new Error("File has neither path nor buffer");
    }

    return filePath;
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (error) {
      throw new Error(`Failed to delete file: ${error}`);
    }
  }

  getFileStream(filePath: string): fs.ReadStream {
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException("File not found");
    }
    return fs.createReadStream(filePath);
  }

  validateFile(file: MulterFile, options: FileValidationOptions): void {
    // Validate file size
    if (options.maxSize && file.size > options.maxSize) {
      throw new BadRequestException(
        `File size exceeds maximum allowed size of ${this.formatFileSize(options.maxSize)}`,
      );
    }

    // Validate MIME type
    if (options.allowedMimeTypes && options.allowedMimeTypes.length > 0) {
      if (!options.allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          `File type ${file.mimetype} is not allowed. Allowed types: ${options.allowedMimeTypes.join(", ")}`,
        );
      }
    }

    // Validate extension
    if (options.allowedExtensions && options.allowedExtensions.length > 0) {
      const ext = extname(file.originalname).toLowerCase().slice(1);
      if (!options.allowedExtensions.includes(ext)) {
        throw new BadRequestException(
          `File extension .${ext} is not allowed. Allowed extensions: ${options.allowedExtensions.map((e) => `.${e}`).join(", ")}`,
        );
      }
    }
  }

  createMulterConfig(storagePath: string, validationOptions?: FileValidationOptions) {
    return {
      storage: diskStorage({
        destination: (req, file, cb) => {
          this.ensureDirectoryExists(storagePath);
          cb(null, storagePath);
        },
        filename: (req, file, cb) => {
          const uniqueFilename = this.generateUniqueFilename(file.originalname);
          cb(null, uniqueFilename);
        },
      }),
      limits: {
        fileSize: validationOptions?.maxSize || 10 * 1024 * 1024, // Default 10MB
      },
      fileFilter: (req, file, cb) => {
        try {
          // Create a mock file object for validation
          const mockFile = {
            ...file,
            size: (req as any).file?.size || 0,
          } as MulterFile;

          if (validationOptions) {
            this.validateFile(mockFile, validationOptions);
          }
          cb(null, true);
        } catch (error: any) {
          cb(error, false);
        }
      },
    };
  }

  private generateUniqueFilename(originalname: string): string {
    const ext = extname(originalname);
    const name = path.basename(originalname, ext);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    return `${name}-${uniqueSuffix}${ext}`;
  }

  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  }
}

