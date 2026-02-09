import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsUUID,
  MinLength,
  MaxLength,
} from 'class-validator';

export class RegisterUserDto {
  @IsUUID('all', { message: 'ID da organização deve ser um UUID válido' })
  @IsNotEmpty({ message: 'ID da organização é obrigatório' })
  organizationId: string;

  @IsString({ message: 'Nome deve ser um texto' })
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MinLength(2, { message: 'Nome deve ter no mínimo 2 caracteres' })
  @MaxLength(255, { message: 'Nome deve ter no máximo 255 caracteres' })
  name: string;

  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @IsString({ message: 'Senha deve ser um texto' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres' })
  @MaxLength(128, { message: 'Senha deve ter no máximo 128 caracteres' })
  password: string;
}
