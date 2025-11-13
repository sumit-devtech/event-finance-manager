import { IsString, IsOptional, IsDateString, IsEnum } from "class-validator";

export enum EventStatus {
  Planning = "Planning",
  Active = "Active",
  Completed = "Completed",
  Cancelled = "Cancelled",
}

export class CreateEventDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  client?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;
}

