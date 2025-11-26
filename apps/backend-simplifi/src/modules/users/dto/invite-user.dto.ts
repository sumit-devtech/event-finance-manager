import { IsEmail, IsString, IsNotEmpty, IsIn } from "class-validator";

export class InviteUserDto {
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
}

