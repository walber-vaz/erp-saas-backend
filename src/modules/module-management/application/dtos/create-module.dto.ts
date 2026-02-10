import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { ModuleErrorMessages } from '../../domain/constants/error-messages';

export class CreateModuleDto {
  @IsString({ message: ModuleErrorMessages.CODE_REQUIRED })
  @IsNotEmpty({ message: ModuleErrorMessages.CODE_REQUIRED })
  @Matches(/^[A-Z0-9_]+$/, {
    message: 'Code do módulo deve estar em uppercase com underscore',
  })
  code: string;

  @IsString({ message: ModuleErrorMessages.NAME_REQUIRED })
  @IsNotEmpty({ message: ModuleErrorMessages.NAME_REQUIRED })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
