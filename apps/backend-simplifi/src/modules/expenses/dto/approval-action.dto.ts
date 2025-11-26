import { IsString, IsNotEmpty, IsOptional, IsIn } from "class-validator";

export class ApprovalActionDto {
  @IsString()
  @IsNotEmpty()
  approverId: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(["approved", "rejected"])
  action: "approved" | "rejected";

  @IsString()
  @IsOptional()
  comments?: string;
}

