import { IsString, IsNotEmpty, IsIn } from "class-validator";

export class GenerateReportDto {
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(["budget-vs-actual", "vendor-summary", "stakeholder-summary"])
  reportType: "budget-vs-actual" | "vendor-summary" | "stakeholder-summary";
}

