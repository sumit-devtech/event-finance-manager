import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { CreateBudgetLineItemDto } from "./create-budget-line-item.dto";

export class CreateBudgetVersionDto {
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsNumber()
  @IsNotEmpty()
  versionNumber: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBudgetLineItemDto)
  items: CreateBudgetLineItemDto[];
}

