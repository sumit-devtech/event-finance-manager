import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { StorageService, FileValidationOptions } from "./storage.service";
import { UploadFileDto, FileCategory } from "./dto/upload-file.dto";

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

@Injectable()
export class FilesService {
  private readonly defaultValidationOptions: FileValidationOptions = {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      // Images
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      // Documents
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      // Text
      "text/plain",
      "text/csv",
      // Archives
      "application/zip",
      "application/x-zip-compressed",
    ],
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async uploadFile(
    file: MulterFile,
    uploadDto: UploadFileDto,
    userId: string,
  ) {
    // Validate file
    this.storageService.validateFile(file, this.defaultValidationOptions);

    // Determine storage path based on category
    let storagePath: string;
    let eventId: string | null = null;
    let budgetItemId: string | null = null;

    if (uploadDto.category === FileCategory.BudgetItem) {
      if (!uploadDto.eventId || !uploadDto.budgetItemId) {
        throw new BadRequestException("eventId and budgetItemId are required for budget-item files");
      }

      // Verify budget item exists and belongs to event
      const budgetItem = await this.prisma.client.budgetItem.findFirst({
        where: {
          id: uploadDto.budgetItemId,
          eventId: uploadDto.eventId,
        },
      });

      if (!budgetItem) {
        throw new NotFoundException("Budget item not found or does not belong to the specified event");
      }

      storagePath = this.storageService.getBudgetItemUploadPath(
        uploadDto.eventId,
        uploadDto.budgetItemId,
      );
      eventId = uploadDto.eventId;
      budgetItemId = uploadDto.budgetItemId;
    } else {
      // Default to event category
      if (!uploadDto.eventId) {
        throw new BadRequestException("eventId is required");
      }

      // Verify event exists
      const event = await this.prisma.client.event.findUnique({
        where: { id: uploadDto.eventId },
      });

      if (!event) {
        throw new NotFoundException("Event not found");
      }

      storagePath = this.storageService.getEventUploadPath(uploadDto.eventId);
      eventId = uploadDto.eventId;
    }

    // Save file to storage
    const filePath = await this.storageService.saveFile(file, storagePath);

    // Store metadata in database
    const fileRecord = await this.prisma.client.file.create({
      data: {
        eventId,
        budgetItemId,
        filename: file.originalname,
        path: filePath,
        mimeType: file.mimetype,
        size: file.size,
      },
    });

    return fileRecord;
  }

  async downloadFile(id: string) {
    const file = await this.prisma.client.file.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    // Check if physical file exists
    if (!require("fs").existsSync(file.path)) {
      throw new NotFoundException("Physical file not found on disk");
    }

    const stream = this.storageService.getFileStream(file.path);

    return {
      file,
      stream,
    };
  }

  async getFileMetadata(id: string) {
    const file = await this.prisma.client.file.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        budgetItem: {
          select: {
            id: true,
            description: true,
            category: true,
          },
        },
      },
    });

    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    return file;
  }

  async deleteFile(id: string, userId: string) {
    const file = await this.prisma.client.file.findUnique({
      where: { id },
    });

    if (!file) {
      throw new NotFoundException(`File with ID ${id} not found`);
    }

    // Delete physical file
    try {
      await this.storageService.deleteFile(file.path);
    } catch (error) {
      // Log error but continue with database deletion
      console.error(`Failed to delete physical file: ${file.path}`, error);
    }

    // Delete database record
    await this.prisma.client.file.delete({
      where: { id },
    });

    return { message: "File deleted successfully" };
  }

  async listFiles(filters?: { eventId?: string; budgetItemId?: string }) {
    const where: any = {};
    if (filters?.eventId) {
      where.eventId = filters.eventId;
    }
    if (filters?.budgetItemId) {
      where.budgetItemId = filters.budgetItemId;
    }

    return this.prisma.client.file.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            name: true,
          },
        },
        budgetItem: {
          select: {
            id: true,
            description: true,
          },
        },
      },
      orderBy: {
        uploadedAt: "desc",
      },
    });
  }
}

