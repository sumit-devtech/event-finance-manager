import { IsString, IsOptional, IsEnum, IsNumber, Min } from "class-validator";
import { Type } from "class-transformer";
import { BudgetItemCategory } from "../../budget-items/dto/create-budget-item.dto";

export class UpdateExpenseDto {
  @IsEnum(BudgetItemCategory)
  @IsOptional()
  category?: BudgetItemCategory;

  @IsString()
  @IsOptional()
  budgetItemId?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  amount?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  vendor?: string;

  @IsString()
  @IsOptional()
  vendorId?: string;
}

