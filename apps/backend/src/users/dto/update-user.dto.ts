import { IsEmail, IsOptional, IsString, MinLength, IsEnum } from "class-validator";
import { UserRole } from "../../auth/types/user-role.enum";

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}

