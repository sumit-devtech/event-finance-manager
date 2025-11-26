import { IsString, IsNotEmpty, IsIn, IsOptional, IsDateString } from "class-validator";

export class CreateSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(["basic", "professional", "enterprise"])
  planName: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(["monthly", "yearly"])
  billingCycle: string;

  @IsDateString()
  @IsOptional()
  currentPeriodStart?: string;

  @IsDateString()
  @IsOptional()
  currentPeriodEnd?: string;
}

