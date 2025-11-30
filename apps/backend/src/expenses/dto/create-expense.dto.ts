import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, Min } from "class-validator";
import { Type } from "class-transformer";
import { BudgetItemCategory } from "../../budget-items/dto/create-budget-item.dto";

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsEnum(BudgetItemCategory)
  @IsNotEmpty()
  category: BudgetItemCategory;

  @IsString()
  @IsOptional()
  budgetItemId?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount: number;

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

