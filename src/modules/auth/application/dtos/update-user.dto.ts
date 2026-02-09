import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'Nome deve ser um texto' })
  @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
  @MaxLength(255, { message: 'Nome deve ter no máximo 255 caracteres' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  email?: string;
}
