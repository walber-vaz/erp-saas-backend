import { PartialType } from '@nestjs/mapped-types';
import { CreateModuleDto } from './create-module.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateModuleDto extends PartialType(CreateModuleDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
