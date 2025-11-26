import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;
}

