import { IsString, IsOptional, IsDateString, IsEnum, IsInt, IsNumber, Min } from "class-validator";
import { Type } from "class-transformer";

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
  location?: string;
  
  @IsOptional()
  @IsString()
  venue?: string;

  @IsOptional()
  @IsString()
  client?: string; // Deprecated: kept for backward compatibility

  @IsOptional()
  @IsString()
  organizer?: string;

  @IsOptional()
  @IsString()
  eventType?: string;

  @IsOptional()
  @IsString()
  type?: string; // Alias for eventType

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  attendees?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  budget?: number;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @IsOptional()
  @IsString()
  managerId?: string; // Optional manager to assign during creation
}

