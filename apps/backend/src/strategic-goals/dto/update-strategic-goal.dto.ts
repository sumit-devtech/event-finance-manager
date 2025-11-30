import { IsString, IsOptional, IsNumber, IsDateString, Min } from "class-validator";
import { Type } from "class-transformer";

export class UpdateStrategicGoalDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  targetValue?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  currentValue?: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsDateString()
  @IsOptional()
  deadline?: string;

  @IsString()
  @IsOptional()
  status?: string; // not-started, in-progress, completed

  @IsString()
  @IsOptional()
  priority?: string; // low, medium, high
}

