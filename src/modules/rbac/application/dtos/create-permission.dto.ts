import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { PermissionDtoErrorMessages } from '../../domain/constants/error-messages';

export class CreatePermissionDto {
  @IsUUID(undefined, { message: PermissionDtoErrorMessages.MODULE_ID_INVALID })
  @IsNotEmpty({ message: PermissionDtoErrorMessages.MODULE_ID_REQUIRED })
  moduleId: string;

  @IsString({ message: PermissionDtoErrorMessages.RESOURCE_MUST_BE_STRING })
  @IsNotEmpty({ message: PermissionDtoErrorMessages.RESOURCE_REQUIRED })
  resource: string;

  @IsString({ message: PermissionDtoErrorMessages.ACTION_MUST_BE_STRING })
  @IsNotEmpty({ message: PermissionDtoErrorMessages.ACTION_REQUIRED })
  action: string;

  @IsString({ message: PermissionDtoErrorMessages.DESCRIPTION_MUST_BE_STRING })
  @IsOptional()
  description?: string;
}
