import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString, Min } from "class-validator";

export class CreateContractDto {
  @IsString()
  @IsNotEmpty()
  vendorId: string;

  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  amount?: number;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  terms?: string;

  @IsString()
  @IsOptional()
  contractFileUrl?: string;
}

