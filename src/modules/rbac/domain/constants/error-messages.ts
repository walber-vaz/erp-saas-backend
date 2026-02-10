export const PermissionErrorMessages = {
  MODULE_ID_REQUIRED: 'ID do módulo é obrigatório',
  MODULE_ID_INVALID: 'ID do módulo deve ser um UUID válido',
  MODULE_NOT_FOUND: 'Módulo não encontrado',
  CODE_REQUIRED: 'Code da permissão é obrigatório',
  RESOURCE_REQUIRED: 'Resource da permissão é obrigatório',
  ACTION_REQUIRED: 'Action da permissão é obrigatória',
  CODE_INVALID_FORMAT:
    'Code da permissão deve estar no formato MODULE_RESOURCE_ACTION',
  CODE_ALREADY_IN_USE: 'Permissão com este código já existe',
  NOT_FOUND: 'Permissão não encontrada',
} as const;

export const RoleErrorMessages = {
  ORGANIZATION_ID_INVALID: 'ID da organização deve ser um UUID válido',
  NAME_REQUIRED: 'Nome do role é obrigatório',
  CODE_REQUIRED: 'Code do role é obrigatório',
  CODE_INVALID_FORMAT: 'Code do role deve estar em uppercase com underscore',
  IS_SYSTEM_IMMUTABLE: 'Roles de sistema não podem ser alterados',
  NOT_FOUND: 'Role não encontrado',
  CODE_ALREADY_IN_USE: 'Code do role já está em uso',
} as const;

export const RolePermissionErrorMessages = {
  ROLE_ID_REQUIRED: 'ID do role é obrigatório',
  ROLE_ID_INVALID: 'ID do role deve ser um UUID válido',
  PERMISSION_ID_REQUIRED: 'ID da permissão é obrigatório',
  PERMISSION_ID_INVALID: 'ID da permissão deve ser um UUID válido',
  CONDITIONS_INVALID: 'Condições da permissão são inválidas',
} as const;

export const UserRoleErrorMessages = {
  USER_ID_REQUIRED: 'ID do usuário é obrigatório',
  USER_ID_INVALID: 'ID do usuário deve ser um UUID válido',
  ROLE_ID_REQUIRED: 'ID do role é obrigatório',
  ROLE_ID_INVALID: 'ID do role deve ser um UUID válido',
  ASSIGNED_BY_REQUIRED: 'AssignedBy é obrigatório',
  ASSIGNED_BY_INVALID: 'AssignedBy deve ser um UUID válido',
  EXPIRES_AT_INVALID: 'Data de expiração é inválida',
  USER_NOT_FOUND: 'Usuário não encontrado',
  ROLE_NOT_FOUND: 'Role não encontrado',
  ORGANIZATION_MISMATCH:
    'Usuário e role devem pertencer à mesma organização ou o role deve ser de sistema',
} as const;

export const RoleInheritanceErrorMessages = {
  PARENT_ROLE_ID_REQUIRED: 'ID do role pai é obrigatório',
  PARENT_ROLE_ID_INVALID: 'ID do role pai deve ser um UUID válido',
  CHILD_ROLE_ID_REQUIRED: 'ID do role filho é obrigatório',
  CHILD_ROLE_ID_INVALID: 'ID do role filho deve ser um UUID válido',
  CANNOT_INHERIT_SELF: 'Um role não pode herdar de si mesmo',
  CYCLE_DETECTED: 'Ciclo de herança detectado',
} as const;

export const PermissionDtoErrorMessages = {
  MODULE_ID_REQUIRED: 'ID do módulo é obrigatório',
  MODULE_ID_INVALID: 'ID do módulo deve ser um UUID válido',
  RESOURCE_REQUIRED: 'Resource da permissão é obrigatório',
  ACTION_REQUIRED: 'Action da permissão é obrigatória',
  DESCRIPTION_MUST_BE_STRING: 'Descrição da permissão deve ser uma string',
  RESOURCE_MUST_BE_STRING: 'Resource da permissão deve ser uma string',
  ACTION_MUST_BE_STRING: 'Action da permissão deve ser uma string',
} as const;

export const RoleDtoErrorMessages = {
  ORGANIZATION_ID_INVALID: 'ID da organização deve ser um UUID válido',
  NAME_REQUIRED: 'Nome do role é obrigatório',
  CODE_REQUIRED: 'Code do role é obrigatório',
  CODE_INVALID_FORMAT: 'Code do role deve estar em uppercase com underscore',
  DESCRIPTION_MUST_BE_STRING: 'Descrição do role deve ser uma string',
  NAME_MUST_BE_STRING: 'Nome do role deve ser uma string',
  CODE_MUST_BE_STRING: 'Code do role deve ser uma string',
} as const;

export const AssignRolePermissionDtoErrorMessages = {
  ROLE_ID_REQUIRED: 'ID do role é obrigatório',
  ROLE_ID_INVALID: 'ID do role deve ser um UUID válido',
  PERMISSION_ID_REQUIRED: 'ID da permissão é obrigatório',
  PERMISSION_ID_INVALID: 'ID da permissão deve ser um UUID válido',
  CONDITIONS_MUST_BE_OBJECT: 'Condições da permissão devem ser um objeto',
} as const;

export const AssignUserRoleDtoErrorMessages = {
  USER_ID_REQUIRED: 'ID do usuário é obrigatório',
  USER_ID_INVALID: 'ID do usuário deve ser um UUID válido',
  ROLE_ID_REQUIRED: 'ID do role é obrigatório',
  ROLE_ID_INVALID: 'ID do role deve ser um UUID válido',
  ASSIGNED_BY_REQUIRED: 'AssignedBy é obrigatório',
  ASSIGNED_BY_INVALID: 'AssignedBy deve ser um UUID válido',
  EXPIRES_AT_INVALID_DATE: 'Data de expiração deve ser uma data válida',
} as const;

export const CreateRoleInheritanceDtoErrorMessages = {
  PARENT_ROLE_ID_REQUIRED: 'ID do role pai é obrigatório',
  PARENT_ROLE_ID_INVALID: 'ID do role pai deve ser um UUID válido',
  CHILD_ROLE_ID_REQUIRED: 'ID do role filho é obrigatório',
  CHILD_ROLE_ID_INVALID: 'ID do role filho deve ser um UUID válido',
} as const;
