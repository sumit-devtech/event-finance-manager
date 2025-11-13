import { IsEnum, IsNotEmpty } from "class-validator";
import { UserRole } from "../../auth/types/user-role.enum";

export class AssignRoleDto {
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}

