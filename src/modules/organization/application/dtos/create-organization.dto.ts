import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';
import { OrganizationErrorMessages } from '../../domain/constants/error-messages';

export class CreateOrganizationDto {
  @IsString({ message: OrganizationErrorMessages.NAME_MUST_BE_STRING })
  @IsNotEmpty({ message: OrganizationErrorMessages.NAME_REQUIRED })
  @MinLength(2, { message: OrganizationErrorMessages.NAME_MIN_LENGTH })
  @MaxLength(255, { message: OrganizationErrorMessages.NAME_MAX_LENGTH })
  name: string;

  @IsString({ message: OrganizationErrorMessages.SLUG_MUST_BE_STRING })
  @IsNotEmpty({ message: OrganizationErrorMessages.SLUG_REQUIRED })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: OrganizationErrorMessages.SLUG_INVALID_FORMAT,
  })
  slug: string;

  @IsOptional()
  @IsString({ message: OrganizationErrorMessages.DOCUMENT_MUST_BE_STRING })
  document?: string;
}
