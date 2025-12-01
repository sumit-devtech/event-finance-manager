import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, Min } from "class-validator";
import { Type } from "class-transformer";

export enum BudgetItemCategory {
  Venue = "Venue",
  Catering = "Catering",
  Marketing = "Marketing",
  Logistics = "Logistics",
  Entertainment = "Entertainment",
  StaffTravel = "StaffTravel",
  Miscellaneous = "Miscellaneous",
}

export enum BudgetItemStatus {
  Pending = "Pending",
  Approved = "Approved",
  Closed = "Closed",
}

export class CreateBudgetItemDto {
  @IsEnum(BudgetItemCategory)
  @IsNotEmpty()
  category: BudgetItemCategory;

  @IsString()
  @IsOptional()
  subcategory?: string;

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

  @IsString()
  @IsOptional()
  vendorId?: string;

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

