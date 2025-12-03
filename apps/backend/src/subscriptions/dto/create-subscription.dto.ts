import { IsString, IsEnum, IsNotEmpty } from "class-validator";
import { BillingCycle } from "@event-finance-manager/database";

export class CreateSubscriptionDto {
  @IsString()
  @IsNotEmpty()
  planName: string;

  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;
}

