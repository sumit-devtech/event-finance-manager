import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, Min } from "class-validator";
import { Type } from "class-transformer";
import { BudgetItemCategory } from "@event-finance-manager/database";

export class CreateBudgetItemDto {
  @IsEnum(BudgetItemCategory)
  @IsNotEmpty()
  category: BudgetItemCategory;

  @IsString()
  @IsNotEmpty()
  description: string;

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

