import { IsString, IsNotEmpty, IsIn } from "class-validator";

export class UpdateEventStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(["draft", "planning", "active", "completed", "cancelled"])
  status: string;
}

