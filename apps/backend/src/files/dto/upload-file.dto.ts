import { IsString, IsOptional, IsEnum } from "class-validator";

export enum FileCategory {
  Event = "event",
  BudgetItem = "budget-item",
}

export class UploadFileDto {
  @IsEnum(FileCategory)
  @IsOptional()
  category?: FileCategory;

  @IsString()
  @IsOptional()
  eventId?: string;

  @IsString()
  @IsOptional()
  budgetItemId?: string;
}

