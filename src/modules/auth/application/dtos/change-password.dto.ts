import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString({ message: 'Senha atual deve ser um texto' })
  @IsNotEmpty({ message: 'Senha atual é obrigatória' })
  currentPassword: string;

  @IsString({ message: 'Nova senha deve ser um texto' })
  @IsNotEmpty({ message: 'Nova senha é obrigatória' })
  @MinLength(8, { message: 'Nova senha deve ter no mínimo 8 caracteres' })
  @MaxLength(128, { message: 'Nova senha deve ter no máximo 128 caracteres' })
  newPassword: string;
}
