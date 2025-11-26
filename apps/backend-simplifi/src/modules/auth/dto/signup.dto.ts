import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from "class-validator";

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  organizationName: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsEmail()
  @IsNotEmpty()
  adminEmail: string;

  @IsString()
  @IsNotEmpty()
  adminFullName: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  adminPassword: string;
}

