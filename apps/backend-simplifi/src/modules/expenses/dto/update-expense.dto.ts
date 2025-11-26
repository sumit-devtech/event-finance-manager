import { IsString, IsOptional, IsNumber, Min } from "class-validator";

export class UpdateExpenseDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  amount?: number;

  @IsString()
  @IsOptional()
  vendorId?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  status?: string;
}

