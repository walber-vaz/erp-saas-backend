import { IsNotEmpty, IsObject, IsOptional, IsUUID } from 'class-validator';
import { AssignRolePermissionDtoErrorMessages } from '../../domain/constants/error-messages';

export class AssignRolePermissionDto {
  @IsUUID(undefined, {
    message: AssignRolePermissionDtoErrorMessages.ROLE_ID_INVALID,
  })
  @IsNotEmpty({
    message: AssignRolePermissionDtoErrorMessages.ROLE_ID_REQUIRED,
  })
  roleId: string;

  @IsUUID(undefined, {
    message: AssignRolePermissionDtoErrorMessages.PERMISSION_ID_INVALID,
  })
  @IsNotEmpty({
    message: AssignRolePermissionDtoErrorMessages.PERMISSION_ID_REQUIRED,
  })
  permissionId: string;

  @IsObject({
    message: AssignRolePermissionDtoErrorMessages.CONDITIONS_MUST_BE_OBJECT,
  })
  @IsOptional()
  conditions?: Record<string, any>;
}
