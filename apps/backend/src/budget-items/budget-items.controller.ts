import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { BudgetItemsService } from "./budget-items.service";
import { CreateBudgetItemDto } from "./dto/create-budget-item.dto";
import { UpdateBudgetItemDto } from "./dto/update-budget-item.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../auth/types/user-role.enum";
import { fileUploadConfig } from "../events/config/file-upload.config";

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

@Controller()
@UseGuards(JwtAuthGuard)
export class BudgetItemsController {
  constructor(private readonly budgetItemsService: BudgetItemsService) {}

  @Get("events/:eventId/budget-items")
  @Roles(UserRole.Admin, UserRole.EventManager, UserRole.Finance, UserRole.Viewer)
  @UseGuards(RolesGuard)
  findAllByEvent(@Param("eventId") eventId: string, @Request() req) {
    return this.budgetItemsService.findAllByEvent(eventId, req.user.id, req.user.role);
  }

  @Get("budget-items/:id")
  @Roles(UserRole.Admin, UserRole.EventManager, UserRole.Finance, UserRole.Viewer)
  @UseGuards(RolesGuard)
  findOne(@Param("id") id: string, @Request() req) {
    return this.budgetItemsService.findOne(id, req.user.id, req.user.role);
  }

  @Post("events/:eventId/budget-items")
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.Admin, UserRole.EventManager, UserRole.Finance)
  @UseGuards(RolesGuard)
  create(
    @Param("eventId") eventId: string,
    @Body() createBudgetItemDto: CreateBudgetItemDto,
    @Request() req,
  ) {
    return this.budgetItemsService.create(eventId, createBudgetItemDto, req.user.id);
  }

  @Put("budget-items/:id")
  @Roles(UserRole.Admin, UserRole.EventManager, UserRole.Finance)
  @UseGuards(RolesGuard)
  update(
    @Param("id") id: string,
    @Body() updateBudgetItemDto: UpdateBudgetItemDto,
    @Request() req,
  ) {
    return this.budgetItemsService.update(id, updateBudgetItemDto, req.user.id, req.user.role);
  }

  @Delete("budget-items/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.Admin, UserRole.EventManager, UserRole.Finance)
  @UseGuards(RolesGuard)
  async remove(@Param("id") id: string, @Request() req) {
    await this.budgetItemsService.remove(id, req.user.id, req.user.role);
  }

  @Get("events/:eventId/budget-items/totals")
  @Roles(UserRole.Admin, UserRole.EventManager, UserRole.Finance, UserRole.Viewer)
  @UseGuards(RolesGuard)
  getBudgetTotals(@Param("eventId") eventId: string) {
    return this.budgetItemsService.getBudgetTotals(eventId);
  }

  @Get("events/:eventId/budget-items/variance")
  @Roles(UserRole.Admin, UserRole.EventManager, UserRole.Finance, UserRole.Viewer)
  @UseGuards(RolesGuard)
  getVariance(@Param("eventId") eventId: string) {
    return this.budgetItemsService.getVariance(eventId);
  }

  @Get("events/:eventId/budget-items/category-totals")
  @Roles(UserRole.Admin, UserRole.EventManager, UserRole.Finance, UserRole.Viewer)
  @UseGuards(RolesGuard)
  getCategoryTotals(@Param("eventId") eventId: string) {
    return this.budgetItemsService.getCategoryTotals(eventId);
  }

  @Post("budget-items/:id/files")
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor("file", fileUploadConfig))
  @Roles(UserRole.Admin, UserRole.EventManager, UserRole.Finance)
  @UseGuards(RolesGuard)
  uploadFile(
    @Param("id") budgetItemId: string,
    @UploadedFile() file: MulterFile | undefined,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }
    return this.budgetItemsService.uploadFile(budgetItemId, file, req.user.id);
  }

  @Delete("budget-items/:id/files/:fileId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.Admin, UserRole.EventManager, UserRole.Finance)
  @UseGuards(RolesGuard)
  async deleteFile(
    @Param("id") budgetItemId: string,
    @Param("fileId") fileId: string,
    @Request() req,
  ) {
    await this.budgetItemsService.deleteFile(budgetItemId, fileId, req.user.id);
  }
}

