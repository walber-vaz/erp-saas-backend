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

export const RefreshTokenErrorMessages = {
  USER_ID_REQUIRED: 'ID do usuário é obrigatório',
  USER_ID_INVALID: 'ID do usuário deve ser um UUID válido',
  TOKEN_REQUIRED: 'Token é obrigatório',
  FAMILY_REQUIRED: 'Family é obrigatório',
  FAMILY_INVALID: 'Family deve ser um UUID válido',
  EXPIRES_AT_REQUIRED: 'Data de expiração é obrigatória',
  EXPIRES_AT_MUST_BE_FUTURE: 'Data de expiração deve ser uma data futura',
  ALREADY_REVOKED: 'Token já está revogado',
} as const;
