import { IsEnum, IsNotEmpty } from "class-validator";
import { EventStatus } from "@event-finance-manager/database";

export class UpdateStatusDto {
  @IsEnum(EventStatus)
  @IsNotEmpty()
  status: EventStatus;
}

