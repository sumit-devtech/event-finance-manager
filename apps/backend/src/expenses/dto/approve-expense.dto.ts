import { IsString, IsOptional, IsEnum, IsNotEmpty } from "class-validator";

export enum ExpenseAction {
  Approve = "approve",
  Reject = "reject",
}

export class ApproveExpenseDto {
  @IsEnum(ExpenseAction)
  @IsNotEmpty()
  action: ExpenseAction;

  @IsString()
  @IsOptional()
  comments?: string;
}

