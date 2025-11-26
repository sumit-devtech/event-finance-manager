import { IsString, IsOptional, IsDateString } from "class-validator";

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  eventType?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

