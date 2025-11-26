import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from "class-validator";

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  vendorId?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  budgetLineItemId?: string;
}

