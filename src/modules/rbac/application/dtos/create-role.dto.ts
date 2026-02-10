import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import { RoleDtoErrorMessages } from '../../domain/constants/error-messages';

export class CreateRoleDto {
  @IsUUID(undefined, { message: RoleDtoErrorMessages.ORGANIZATION_ID_INVALID })
  @IsOptional()
  organizationId?: string;

  @IsString({ message: RoleDtoErrorMessages.NAME_MUST_BE_STRING })
  @IsNotEmpty({ message: RoleDtoErrorMessages.NAME_REQUIRED })
  name: string;

  @IsString({ message: RoleDtoErrorMessages.CODE_MUST_BE_STRING })
  @IsNotEmpty({ message: RoleDtoErrorMessages.CODE_REQUIRED })
  @Matches(/^[A-Z0-9_]+$/, {
    message: RoleDtoErrorMessages.CODE_INVALID_FORMAT,
  })
  code: string;

  @IsString({ message: RoleDtoErrorMessages.DESCRIPTION_MUST_BE_STRING })
  @IsOptional()
  description?: string;
}
