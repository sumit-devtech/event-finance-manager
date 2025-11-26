import { IsEmail, IsString, IsNotEmpty, IsOptional, IsIn } from "class-validator";

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(["admin", "manager", "finance", "viewer"])
  role: string;

  @IsString()
  @IsOptional()
  organizationId?: string;
}

