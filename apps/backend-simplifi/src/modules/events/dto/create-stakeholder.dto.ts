import { IsString, IsNotEmpty, IsOptional, IsEmail } from "class-validator";

export class CreateStakeholderDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

