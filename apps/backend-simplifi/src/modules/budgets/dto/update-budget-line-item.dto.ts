import { IsString, IsOptional, IsNumber, Min } from "class-validator";

export class UpdateBudgetLineItemDto {
  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  itemName?: string;

  @IsString()
  @IsOptional()
  vendorId?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  quantity?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  unitCost?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  estimatedCost?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  actualCost?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

