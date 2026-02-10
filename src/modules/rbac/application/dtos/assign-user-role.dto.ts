import { IsDate, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { AssignUserRoleDtoErrorMessages } from '../../domain/constants/error-messages';

export class AssignUserRoleDto {
  @IsUUID(undefined, {
    message: AssignUserRoleDtoErrorMessages.USER_ID_INVALID,
  })
  @IsNotEmpty({ message: AssignUserRoleDtoErrorMessages.USER_ID_REQUIRED })
  userId: string;

  @IsUUID(undefined, {
    message: AssignUserRoleDtoErrorMessages.ROLE_ID_INVALID,
  })
  @IsNotEmpty({ message: AssignUserRoleDtoErrorMessages.ROLE_ID_REQUIRED })
  roleId: string;

  @IsUUID(undefined, {
    message: AssignUserRoleDtoErrorMessages.ASSIGNED_BY_INVALID,
  })
  @IsNotEmpty({ message: AssignUserRoleDtoErrorMessages.ASSIGNED_BY_REQUIRED })
  assignedBy: string;

  @Type(() => Date)
  @IsDate({ message: AssignUserRoleDtoErrorMessages.EXPIRES_AT_INVALID_DATE })
  @IsOptional()
  expiresAt?: Date;
}
