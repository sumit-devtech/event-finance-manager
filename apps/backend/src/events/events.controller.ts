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
import { EventsService } from "./events.service";
import { CreateEventDto, EventStatus } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { AssignUserDto } from "./dto/assign-user.dto";
import { UpdateStatusDto } from "./dto/update-status.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../auth/types/user-role.enum";
import { EventAssignmentGuard } from "./guards/event-assignment.guard";
import { fileUploadConfig } from "./config/file-upload.config";

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

@Controller("events")
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.Admin, UserRole.EventManager)
  @UseGuards(RolesGuard)
  create(@Body() createEventDto: CreateEventDto, @Request() req) {
    return this.eventsService.create(createEventDto, req.user.id, req.user.organizationId);
  }

  @Get()
  findAll(
    @Query("status") status?: EventStatus,
    @Query("client") client?: string,
    @Query("department") department?: string,
    @Query("startDateFrom") startDateFrom?: string,
    @Query("startDateTo") startDateTo?: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
    @Request() req?: any,
  ) {
    return this.eventsService.findAll({
      status,
      client,
      department,
      startDateFrom,
      startDateTo,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
      userId: req?.user?.id,
      userRole: req?.user?.role,
    });
  }

  @Get(":id")
  @Roles(UserRole.Admin, UserRole.EventManager, UserRole.Finance, UserRole.Viewer)
  @UseGuards(RolesGuard)
  findOne(@Param("id") id: string, @Request() req) {
    // Service will filter based on user access in the service layer
    return this.eventsService.findOne(id, false, req.user?.id, req.user?.role);
  }

  @Get(":id/manager")
  @Roles(UserRole.Admin, UserRole.EventManager, UserRole.Finance, UserRole.Viewer)
  @UseGuards(RolesGuard)
  getEventManager(@Param("id") id: string) {
    return this.eventsService.getEventManager(id);
  }

  @Put(":id")
  @UseGuards(EventAssignmentGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.EventManager)
  update(@Param("id") id: string, @Body() updateEventDto: UpdateEventDto, @Request() req) {
    return this.eventsService.update(id, updateEventDto, req.user.id);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(EventAssignmentGuard, RolesGuard)
  @Roles(UserRole.Admin) // Only Admin can delete events, not EventManager
  async remove(@Param("id") id: string, @Request() req) {
    await this.eventsService.remove(id, req.user.id);
  }

  @Put(":id/status")
  @UseGuards(EventAssignmentGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.EventManager)
  updateStatus(
    @Param("id") id: string,
    @Body() updateStatusDto: UpdateStatusDto,
    @Request() req,
  ) {
    return this.eventsService.updateStatus(id, updateStatusDto, req.user.id);
  }

  @Post(":id/assign")
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.Admin)
  @UseGuards(RolesGuard)
  assignUser(@Param("id") eventId: string, @Body() assignUserDto: AssignUserDto, @Request() req) {
    return this.eventsService.assignUser(eventId, assignUserDto, req.user.id);
  }

  @Delete(":id/assign/:userId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.Admin)
  @UseGuards(RolesGuard)
  async unassignUser(
    @Param("id") eventId: string,
    @Param("userId") userId: string,
    @Request() req,
  ) {
    await this.eventsService.unassignUser(eventId, userId, req.user.id);
  }

  @Post(":id/files")
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor("file", fileUploadConfig))
  @UseGuards(EventAssignmentGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.EventManager)
  uploadFile(
    @Param("id") eventId: string,
    @UploadedFile() file: MulterFile | undefined,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException("No file uploaded");
    }
    return this.eventsService.uploadFile(eventId, file, req.user.id);
  }

  @Delete(":id/files/:fileId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(EventAssignmentGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.EventManager)
  async deleteFile(
    @Param("id") eventId: string,
    @Param("fileId") fileId: string,
    @Request() req,
  ) {
    await this.eventsService.deleteFile(eventId, fileId, req.user.id);
  }
}
