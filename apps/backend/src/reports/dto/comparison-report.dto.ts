import { IsArray, IsNotEmpty, ArrayMinSize, IsString } from "class-validator";

export class ComparisonReportDto {
  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  eventIds: string[];
}

