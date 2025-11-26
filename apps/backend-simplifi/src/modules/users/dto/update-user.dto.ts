import { IsString, IsOptional, IsIn, IsBoolean } from "class-validator";

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  @IsIn(["admin", "manager", "finance", "viewer"])
  role?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

