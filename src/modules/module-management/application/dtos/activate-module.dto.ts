import { IsNotEmpty, IsUUID } from 'class-validator';
import { OrganizationModuleErrorMessages } from '../../domain/constants/error-messages';

export class ActivateModuleDto {
  @IsUUID(undefined, {
    message: OrganizationModuleErrorMessages.ORGANIZATION_ID_INVALID,
  })
  @IsNotEmpty({
    message: OrganizationModuleErrorMessages.ORGANIZATION_ID_REQUIRED,
  })
  organizationId: string;

  @IsUUID(undefined, {
    message: OrganizationModuleErrorMessages.MODULE_ID_INVALID,
  })
  @IsNotEmpty({ message: OrganizationModuleErrorMessages.MODULE_ID_REQUIRED })
  moduleId: string;
}
