import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ExpensesService } from "./expenses.service";
import { CreateExpenseDto } from "./dto/create-expense.dto";
import { UpdateExpenseDto } from "./dto/update-expense.dto";
import { ApproveExpenseDto } from "./dto/approve-expense.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../auth/types/user-role.enum";
import { ExpenseStatus } from "@event-finance-manager/database";
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

@Controller("expenses")
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.Admin, UserRole.EventManager, UserRole.Finance)
  @UseGuards(RolesGuard)
  create(@Body() createExpenseDto: CreateExpenseDto, @Request() req) {
    return this.expensesService.create(
      createExpenseDto,
      req.user.id,
      req.user.organizationId,
    );
  }

  @Get()
  @Roles(UserRole.Admin, UserRole.EventManager, UserRole.Finance, UserRole.Viewer)
  @UseGuards(RolesGuard)
  findAll(
    @Query("eventId") eventId?: string,
    @Query("status") status?: ExpenseStatus,
    @Query("category") category?: string,
    @Request() req?,
  ) {
    return this.expensesService.findAll({
      eventId,
      status,
      category,
      organizationId: req?.user?.organizationId,
    });
  }

  @Get(":id")
  @Roles(UserRole.Admin, UserRole.EventManager, UserRole.Finance, UserRole.Viewer)
  @UseGuards(RolesGuard)
  findOne(@Param("id") id: string) {
    return this.expensesService.findOne(id);
  }

  @Put(":id")
  @Roles(UserRole.Admin, UserRole.EventManager, UserRole.Finance)
  @UseGuards(RolesGuard)
  update(@Param("id") id: string, @Body() updateExpenseDto: UpdateExpenseDto, @Request() req) {
    return this.expensesService.update(id, updateExpenseDto, req.user.id);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.Admin, UserRole.EventManager, UserRole.Finance)
  @UseGuards(RolesGuard)
  async remove(@Param("id") id: string, @Request() req) {
    await this.expensesService.remove(id, req.user.id);
  }

  @Post(":id/approve")
  @Roles(UserRole.Admin, UserRole.EventManager)
  @UseGuards(RolesGuard)
  approveOrReject(
    @Param("id") id: string,
    @Body() approveExpenseDto: ApproveExpenseDto,
    @Request() req,
  ) {
    return this.expensesService.approveOrReject(
      id,
      approveExpenseDto,
      req.user.id,
      req.user.role,
    );
  }

  @Post(":id/files")
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor("file", fileUploadConfig))
  @Roles(UserRole.Admin, UserRole.EventManager, UserRole.Finance)
  @UseGuards(RolesGuard)
  uploadFile(
    @Param("id") expenseId: string,
    @UploadedFile() file: MulterFile | undefined,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }
    return this.expensesService.uploadFile(expenseId, file, req.user.id);
  }

  @Delete(":id/files/:fileId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.Admin, UserRole.EventManager, UserRole.Finance)
  @UseGuards(RolesGuard)
  async deleteFile(
    @Param("id") expenseId: string,
    @Param("fileId") fileId: string,
    @Request() req,
  ) {
    await this.expensesService.deleteFile(expenseId, fileId, req.user.id);
  }
}

@Controller("events")
@UseGuards(JwtAuthGuard)
export class EventExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get(":eventId/expenses")
  @Roles(UserRole.Admin, UserRole.EventManager, UserRole.Finance, UserRole.Viewer)
  @UseGuards(RolesGuard)
  findByEvent(@Param("eventId") eventId: string) {
    return this.expensesService.findByEvent(eventId);
  }
}

