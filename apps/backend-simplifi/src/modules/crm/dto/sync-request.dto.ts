import { IsString, IsOptional, IsIn } from "class-validator";

export class SyncRequestDto {
  @IsString()
  @IsOptional()
  @IsIn(["hubspot", "salesforce"])
  crmSystem?: string;
}

