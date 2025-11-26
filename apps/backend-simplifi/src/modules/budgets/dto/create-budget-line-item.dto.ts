import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from "class-validator";

export class CreateBudgetLineItemDto {
  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  itemName: string;

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

  @IsString()
  @IsOptional()
  notes?: string;
}

