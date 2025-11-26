import { IsString, IsOptional } from "class-validator";

export class UpdateOrganizationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;
}

