import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class AssignUserDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsOptional()
  role?: string;
}

