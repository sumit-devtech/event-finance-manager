import { IsEnum, IsNotEmpty } from "class-validator";
import { EventStatus } from "./create-event.dto";

export class UpdateStatusDto {
  @IsEnum(EventStatus)
  @IsNotEmpty()
  status: EventStatus;
}

