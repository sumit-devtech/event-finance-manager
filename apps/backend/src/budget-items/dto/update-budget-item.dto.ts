import { IsString, IsOptional, IsEnum, IsNumber, Min } from "class-validator";
import { Type } from "class-transformer";
import { BudgetItemCategory, BudgetItemStatus } from "./create-budget-item.dto";

export class UpdateBudgetItemDto {
  @IsEnum(BudgetItemCategory)
  @IsOptional()
  category?: BudgetItemCategory;

  @IsString()
  @IsOptional()
  subcategory?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  estimatedCost?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  actualCost?: number;

  @IsString()
  @IsOptional()
  vendor?: string;

  @IsEnum(BudgetItemStatus)
  @IsOptional()
  status?: BudgetItemStatus;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  assignedUserId?: string;

  @IsString()
  @IsOptional()
  strategicGoalId?: string;
}

