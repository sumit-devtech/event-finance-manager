import { IsString, IsOptional, IsBoolean } from "class-validator";

export class UpdateBudgetVersionDto {
  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isFinal?: boolean;
}

