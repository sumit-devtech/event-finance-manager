import { IsString, IsOptional, IsDateString, IsEnum } from "class-validator";
import { EventStatus } from "./create-event.dto";

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  location?: string; // Note: simlifidb uses 'location' instead of 'client'
  
  @IsOptional()
  @IsString()
  client?: string; // Deprecated: kept for backward compatibility, maps to 'location'

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

