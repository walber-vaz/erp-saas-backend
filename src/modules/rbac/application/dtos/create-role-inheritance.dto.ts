import { IsNotEmpty, IsUUID } from 'class-validator';
import { CreateRoleInheritanceDtoErrorMessages } from '../../domain/constants/error-messages';

export class CreateRoleInheritanceDto {
  @IsUUID(undefined, {
    message: CreateRoleInheritanceDtoErrorMessages.PARENT_ROLE_ID_INVALID,
  })
  @IsNotEmpty({
    message: CreateRoleInheritanceDtoErrorMessages.PARENT_ROLE_ID_REQUIRED,
  })
  parentRoleId: string;

  @IsUUID(undefined, {
    message: CreateRoleInheritanceDtoErrorMessages.CHILD_ROLE_ID_INVALID,
  })
  @IsNotEmpty({
    message: CreateRoleInheritanceDtoErrorMessages.CHILD_ROLE_ID_REQUIRED,
  })
  childRoleId: string;
}
