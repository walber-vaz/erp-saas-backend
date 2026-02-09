import { IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class LoginDto {
  @IsUUID('all', { message: 'ID da organização deve ser um UUID válido' })
  @IsNotEmpty({ message: 'ID da organização é obrigatório' })
  organizationId: string;

  @IsEmail({}, { message: 'Email deve ter um formato válido' })
  @IsNotEmpty({ message: 'Email é obrigatório' })
  email: string;

  @IsString({ message: 'Senha deve ser um texto' })
  @IsNotEmpty({ message: 'Senha é obrigatória' })
  password: string;
}
