import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, IsEnum } from "class-validator";
import { UserRole } from "../../auth/types/user-role.enum";

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}

