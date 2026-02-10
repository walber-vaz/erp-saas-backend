export const ModuleErrorMessages = {
  CODE_REQUIRED: 'Código do módulo é obrigatório',
  NAME_REQUIRED: 'Nome do módulo é obrigatório',
  NOT_FOUND: 'Módulo não encontrado',
  CODE_ALREADY_IN_USE: 'Código do módulo já está em uso',
} as const;

export const OrganizationModuleErrorMessages = {
  ORGANIZATION_ID_REQUIRED: 'ID da organização é obrigatório',
  ORGANIZATION_ID_INVALID: 'ID da organização deve ser um UUID válido',
  MODULE_ID_REQUIRED: 'ID do módulo é obrigatório',
  MODULE_ID_INVALID: 'ID do módulo deve ser um UUID válido',
  ALREADY_ACTIVE: 'Módulo já está ativo para esta organização',
  ALREADY_INACTIVE: 'Módulo já está inativo para esta organização',
  NOT_FOUND: 'Módulo da organização não encontrado',
  MODULE_NOT_ACTIVE_GLOBALLY: 'Módulo não está ativo globalmente',
  MODULE_NOT_CONTRACTED: 'Módulo não contratado',
} as const;
