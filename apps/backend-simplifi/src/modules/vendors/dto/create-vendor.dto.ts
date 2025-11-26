import { IsString, IsNotEmpty, IsOptional, IsEmail, IsNumber, Min, Max } from "class-validator";

export class CreateVendorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  serviceType?: string;

  @IsString()
  @IsOptional()
  contactPerson?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  gstNumber?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(5)
  rating?: number;

  @IsString()
  @IsOptional()
  organizationId?: string;
}

