export const OrganizationErrorMessages = {
  NAME_REQUIRED: 'Nome é obrigatório',
  NAME_MUST_BE_STRING: 'Nome deve ser um texto',
  NAME_MIN_LENGTH: 'Nome deve ter no mínimo 2 caracteres',
  NAME_MAX_LENGTH: 'Nome deve ter no máximo 255 caracteres',
  SLUG_REQUIRED: 'Slug é obrigatório',
  SLUG_MUST_BE_STRING: 'Slug deve ser um texto',
  SLUG_INVALID_FORMAT:
    'Slug deve conter apenas letras minúsculas, números e hífens',
  DOCUMENT_MUST_BE_STRING: 'Documento deve ser um texto',
  DOCUMENT_INVALID: 'Documento deve ser um CNPJ válido',
  IS_ACTIVE_MUST_BE_BOOLEAN: 'isActive deve ser verdadeiro ou falso',
  ALREADY_INACTIVE: 'Organização já está inativa',
  NOT_FOUND: 'Organização não encontrada',
  SLUG_TAKEN: 'Slug já está em uso',
  DOCUMENT_TAKEN: 'Documento já está em uso',
} as const;
