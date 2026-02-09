export const UserErrorMessages = {
  ORGANIZATION_ID_REQUIRED: 'ID da organização é obrigatório',
  ORGANIZATION_ID_INVALID: 'ID da organização deve ser um UUID válido',
  NAME_REQUIRED: 'Nome é obrigatório',
  NAME_MIN_LENGTH: 'Nome deve ter no mínimo 2 caracteres',
  EMAIL_REQUIRED: 'Email é obrigatório',
  EMAIL_INVALID: 'Email deve ter um formato válido',
  PASSWORD_HASH_REQUIRED: 'Hash da senha é obrigatório',
  ALREADY_INACTIVE: 'Usuário já está inativo',
  NOT_FOUND: 'Usuário não encontrado',
  EMAIL_TAKEN: 'Email já está em uso nesta organização',
} as const;
