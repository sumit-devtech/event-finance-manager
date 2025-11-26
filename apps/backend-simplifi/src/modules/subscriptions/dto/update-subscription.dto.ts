import { IsString, IsOptional, IsIn, IsDateString } from "class-validator";

export class UpdateSubscriptionDto {
  @IsString()
  @IsOptional()
  @IsIn(["basic", "professional", "enterprise"])
  planName?: string;

  @IsString()
  @IsOptional()
  @IsIn(["monthly", "yearly"])
  billingCycle?: string;

  @IsString()
  @IsOptional()
  @IsIn(["active", "cancelled", "expired"])
  status?: string;

  @IsDateString()
  @IsOptional()
  currentPeriodStart?: string;

  @IsDateString()
  @IsOptional()
  currentPeriodEnd?: string;
}

