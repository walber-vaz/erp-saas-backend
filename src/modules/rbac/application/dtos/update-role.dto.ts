import { IsOptional, IsString } from 'class-validator';
import { RoleDtoErrorMessages } from '../../domain/constants/error-messages';

export class UpdateRoleDto {
  @IsString({ message: RoleDtoErrorMessages.NAME_MUST_BE_STRING })
  @IsOptional()
  name?: string;

  @IsString({ message: RoleDtoErrorMessages.DESCRIPTION_MUST_BE_STRING })
  @IsOptional()
  description?: string;
}
