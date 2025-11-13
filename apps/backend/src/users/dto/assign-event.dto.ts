import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class AssignEventDto {
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsString()
  @IsOptional()
  role?: string;
}

