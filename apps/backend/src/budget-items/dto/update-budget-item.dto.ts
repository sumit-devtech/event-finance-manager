import { IsString, IsOptional, IsEnum, IsNumber, Min } from "class-validator";
import { Type } from "class-transformer";
import { BudgetItemCategory } from "./create-budget-item.dto";

export class UpdateBudgetItemDto {
  @IsEnum(BudgetItemCategory)
  @IsOptional()
  category?: BudgetItemCategory;

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
}

