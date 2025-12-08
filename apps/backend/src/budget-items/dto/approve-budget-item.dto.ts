import { IsString, IsOptional, IsEnum, IsNotEmpty } from "class-validator";

export enum BudgetItemAction {
  Approve = "approve",
  Reject = "reject",
}

export class ApproveBudgetItemDto {
  @IsEnum(BudgetItemAction)
  @IsNotEmpty()
  action: BudgetItemAction;

  @IsString()
  @IsOptional()
  comments?: string;
}

