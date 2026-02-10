# TASKS — ERP SaaS Backend

## Arquitetura Adotada

**DDD + Clean Architecture (pragmática)** — foco em organização sem complexidade desnecessária.

### Estrutura de pastas por módulo

```sh
src/
├── shared/                          # Código compartilhado entre módulos
│   ├── prisma/
│   │   └── prisma.service.ts        # (já existe, mover para cá)
│   └── exceptions/
│       └── domain.exception.ts      # Exceção base de domínio
│
├── modules/
│   └── organization/
│       ├── domain/
│       │   ├── entities/
│       │   │   └── organization.entity.ts      # Entidade de domínio (validações, regras)
│       │   └── repositories/
│       │       └── organization.repository.ts  # Interface (port) do repositório
│       │
│       ├── application/
│       │   ├── use-cases/
│       │   │   ├── create-organization.use-case.ts
│       │   │   ├── update-organization.use-case.ts
│       │   │   ├── find-organization.use-case.ts
│       │   │   ├── list-organizations.use-case.ts
│       │   │   └── deactivate-organization.use-case.ts
│       │   └── dtos/
│       │       ├── create-organization.dto.ts
│       │       └── update-organization.dto.ts
│       │
│       ├── infra/
│       │   └── repositories/
│       │       └── prisma-organization.repository.ts  # Implementação Prisma
│       │
│       ├── presentation/
│       │   └── organization.controller.ts
│       │
│       └── organization.module.ts
│
├── app.module.ts
└── main.ts
```

### Convenções

- **Entidades de domínio** são classes simples com validação no construtor (sem decorators do Prisma)
- **Repositórios** usam interface (abstract class) no domínio, implementação na infra
- **Use Cases** são classes com um único método `execute()`
- **DTOs** usam `class-validator` para validação de entrada na camada de apresentação
- **Path aliases** configurados no `tsconfig.json`: `@shared/*`, `@modules/*`, `@generated/*` — usar nos imports
- **Módulo NestJS** faz a composição (DI) de todas as camadas

---

## Módulo: Organization

### TASK-001: Criar estrutura base shared

- **Status:** concluída
- **Descrição:**
  - Criar pasta `src/shared/prisma/` e mover `prisma.service.ts` para lá
  - Criar `src/shared/prisma/prisma.module.ts` como módulo global (`@Global()`)
  - Criar `src/shared/exceptions/domain.exception.ts` com classe base para erros de domínio
  - Atualizar imports no `app.module.ts`
- **Extras realizados:**
  - Instalado `class-validator` e `class-transformer`, configurado `ValidationPipe` global no `main.ts`
  - Instalado `uuid` para geração de UUID v7 na camada de domínio
  - Atualizado `schema.prisma`: removido `dbgenerated("uuid_generate_v4()")` de todos os models e extensão `uuid-ossp`
  - Configurado path aliases no `tsconfig.json`: `@shared/*`, `@modules/*`, `@generated/*`
  - Criado `src/shared/validators/cnpj.validator.ts` com função `isValidCnpj()` reutilizável

### TASK-002: Criar entidade de domínio Organization

- **Status:** concluída
- **Descrição:**
  - Criar `src/modules/organization/domain/entities/organization.entity.ts`
  - Propriedades: `id`, `name`, `slug`, `document`, `isActive`, `createdAt`, `updatedAt`
  - Validações no construtor/factory:
    - `name` obrigatório, mínimo 2 caracteres
    - `slug` obrigatório, formato válido (lowercase, hifens)
    - `document` opcional, validar formato CNPJ se informado
  - Método estático `create()` para nova organização
  - Método `update()` para atualização parcial
  - Método `deactivate()` para desativação

### TASK-003: Criar interface do repositório Organization

- **Status:** concluída
- **Descrição:**
  - Criar `src/modules/organization/domain/repositories/organization.repository.ts`
  - Definir abstract class `OrganizationRepository` com métodos:
    - `findById(id: string): Promise<Organization | null>`
    - `findBySlug(slug: string): Promise<Organization | null>`
    - `findByDocument(document: string): Promise<Organization | null>`
    - `findAll(params?: { page: number; limit: number }): Promise<{ data: Organization[]; total: number }>`
    - `create(organization: Organization): Promise<Organization>`
    - `update(organization: Organization): Promise<Organization>`
    - `delete(id: string): Promise<void>`

### TASK-004: Criar DTOs de entrada

- **Status:** concluída
- **Descrição:**
  - Instalar `class-validator` e `class-transformer`
  - Criar `src/modules/organization/application/dtos/create-organization.dto.ts`
    - Campos: `name`, `slug`, `document?`
  - Criar `src/modules/organization/application/dtos/update-organization.dto.ts`
    - Usa `PartialType(CreateOrganizationDto)` do `@nestjs/mapped-types`
  - Configurar `ValidationPipe` global no `main.ts` (já feito na TASK-001)

### TASK-005: Criar Use Cases

- **Status:** concluída
- **Descrição:**
  - **CreateOrganizationUseCase**
    - Recebe DTO, valida slug único, document único (se informado)
    - Cria entidade de domínio e persiste via repositório
  - **UpdateOrganizationUseCase**
    - Busca organização por ID, aplica alterações, valida unicidade de slug/document
  - **FindOrganizationUseCase**
    - Busca por ID, retorna ou lança exceção
  - **ListOrganizationsUseCase**
    - Lista paginada de organizações
  - **DeactivateOrganizationUseCase**
    - Busca por ID, chama `deactivate()` na entidade, persiste

### TASK-006: Criar implementação Prisma do repositório

- **Status:** concluída
- **Descrição:**
  - Criar `src/modules/organization/infra/repositories/prisma-organization.repository.ts`
  - Implementa `OrganizationRepository` usando `PrismaService`
  - Mapeia entre modelo Prisma e entidade de domínio (métodos privados `toDomain` / `toPrisma`)

### TASK-007: Criar controller Organization

- **Status:** concluída
- **Descrição:**
  - Criar `src/modules/organization/presentation/organization.controller.ts`
  - Endpoints:
    - `POST   /organizations`      → CreateOrganizationUseCase
    - `GET    /organizations`      → ListOrganizationsUseCase
    - `GET    /organizations/:id`  → FindOrganizationUseCase
    - `PATCH  /organizations/:id`  → UpdateOrganizationUseCase
    - `DELETE /organizations/:id`  → DeactivateOrganizationUseCase (soft delete)
  - Usar prefixo de API versionado: `/api/v1/organizations`

### TASK-008: Criar módulo NestJS Organization

- **Status:** concluída
- **Descrição:**
  - Criar `src/modules/organization/organization.module.ts`
  - Registrar providers:
    - Use cases como providers
    - `OrganizationRepository` com `useClass: PrismaOrganizationRepository`
  - Registrar controller
  - Importar no `AppModule`

### TASK-009: Criar testes unitários

- **Status:** concluída
- **Descrição:**
  - Testar entidade `Organization` (validações, métodos)
  - Testar cada use case com repositório mockado
  - Usar Vitest (já configurado no projeto)
  - Estrutura de testes espelhando src:

    ```sh
    src/modules/organization/
    ├── domain/entities/__tests__/organization.entity.spec.ts
    └── application/use-cases/__tests__/
        ├── create-organization.use-case.spec.ts
        ├── update-organization.use-case.spec.ts
        └── ...
    ```

### TASK-010: Criar testes e2e do controller

- **Status:** concluída
- **Descrição:**
  - Criar testes e2e para os endpoints de Organization
  - Testar fluxo completo: criar → listar → buscar → atualizar → desativar
  - Usar `supertest` com módulo de teste do NestJS

---

## Ordem de Execução

```text
TASK-001 (shared base)
    ↓
TASK-002 (entidade) → TASK-003 (repositório interface)
    ↓
TASK-004 (DTOs + ValidationPipe)
    ↓
TASK-005 (use cases)
    ↓
TASK-006 (repositório Prisma)
    ↓
TASK-007 (controller) → TASK-008 (módulo NestJS)
    ↓
TASK-009 (testes unitários) → TASK-010 (testes e2e)
```

---

## Módulo: Auth (User + JWT + RefreshToken)

### TASK-011: Criar entidade de domínio User

- **Status:** concluída
- **Descrição:**
  - Criar `src/modules/auth/domain/entities/user.entity.ts`
  - Propriedades: `id`, `organizationId`, `name`, `email`, `passwordHash`, `isActive`, `lastLoginAt`, `createdAt`, `updatedAt`
  - Validações no construtor/factory:
    - `organizationId` obrigatório, formato UUID
    - `name` obrigatório, mínimo 2 caracteres
    - `email` obrigatório, formato válido
    - `passwordHash` obrigatório
    - Email único por organização (validado no use case)
  - Método estático `create()` para novo usuário
  - Método `update()` para atualização parcial (name, email)
  - Método `deactivate()` para desativação
  - Método `updatePassword()` para alterar senha
  - Método `recordLogin()` para atualizar lastLoginAt

### TASK-012: Criar entidade de domínio RefreshToken

- **Status:** concluída
- **Descrição:**
  - Criar `src/modules/auth/domain/entities/refresh-token.entity.ts`
  - Propriedades: `id`, `userId`, `token`, `family`, `isRevoked`, `expiresAt`, `createdAt`
  - Validações no construtor/factory:
    - `userId` obrigatório, formato UUID
    - `token` obrigatório, string única
    - `family` obrigatório (UUID) — agrupa tokens da mesma sessão para rotation
    - `expiresAt` obrigatório, data futura
  - Método estático `create()` para novo refresh token
  - Método `revoke()` para marcar token como revogado
  - Método `isValid()` — verifica se não está revogado e não expirou

### TASK-013: Criar interfaces dos repositórios User e RefreshToken

- **Status:** concluída
- **Descrição:**
  - Criar `src/modules/auth/domain/repositories/user.repository.ts`
    - `findById(id: string): Promise<User | null>`
    - `findByEmail(organizationId: string, email: string): Promise<User | null>`
    - `findByOrganization(organizationId: string, params?: { page: number; limit: number }): Promise<{ data: User[]; total: number }>`
    - `create(user: User): Promise<User>`
    - `update(user: User): Promise<User>`
    - `delete(id: string): Promise<void>`
  - Criar `src/modules/auth/domain/repositories/refresh-token.repository.ts`
    - `findById(id: string): Promise<RefreshToken | null>`
    - `findByToken(token: string): Promise<RefreshToken | null>`
    - `findByFamily(family: string): Promise<RefreshToken[]>`
    - `findByUserId(userId: string): Promise<RefreshToken[]>`
    - `create(refreshToken: RefreshToken): Promise<RefreshToken>`
    - `update(refreshToken: RefreshToken): Promise<RefreshToken>`
    - `revokeAllByFamily(family: string): Promise<void>`
    - `revokeAllByUserId(userId: string): Promise<void>`
    - `deleteExpired(): Promise<void>`

### TASK-014: Criar DTOs de autenticação

- **Status:** concluída
- **Descrição:**
  - Criar `src/modules/auth/application/dtos/register-user.dto.ts`
    - Campos: `organizationId`, `name`, `email`, `password`
    - Validações com `class-validator`
  - Criar `src/modules/auth/application/dtos/login.dto.ts`
    - Campos: `organizationId`, `email`, `password`
  - Criar `src/modules/auth/application/dtos/refresh-token.dto.ts`
    - Campo: `refreshToken`
  - Criar `src/modules/auth/application/dtos/update-user.dto.ts`
    - Usa `PartialType` com campos: `name`, `email`
  - Criar `src/modules/auth/application/dtos/change-password.dto.ts`
    - Campos: `currentPassword`, `newPassword`

### TASK-015: Criar serviços de hash e JWT

- **Status:** concluída
- **Descrição:**
  - Instalar `bcrypt` e `@nestjs/jwt`
  - Criar `src/modules/auth/application/services/hash.service.ts`
    - `hash(password: string): Promise<string>` — usa bcrypt com salt 10
    - `compare(password: string, hash: string): Promise<boolean>`
  - Criar `src/modules/auth/application/services/token.service.ts` (anteriormente jwt.service.ts)
    - `generateAccessToken(payload: { userId: string; organizationId: string }): string` — expira em 15min
    - `generateRefreshToken(): string` — string aleatória segura
    - `verifyAccessToken(token: string): { userId: string; organizationId: string }`
  - Configurar variáveis de ambiente:
    - `JWT_SECRET`, `JWT_EXPIRES_IN` (default: 15m)
    - `REFRESH_TOKEN_EXPIRES_IN` (default: 7d)

### TASK-016: Criar Use Cases de autenticação

- **Status:** concluída
- **Descrição:**
  - **RegisterUserUseCase**
    - Valida se email é único na organização
    - Cria entidade User com senha hasheada
    - Persiste via repositório
    - Retorna User (sem passwordHash exposto)
  - **LoginUseCase**
    - Busca usuário por organizationId + email
    - Valida senha com HashService
    - Verifica se usuário está ativo
    - Gera accessToken e refreshToken
    - Salva RefreshToken no banco (com family UUID)
    - Atualiza lastLoginAt do usuário
    - Retorna: `{ accessToken, refreshToken, user }`
  - **RefreshTokenUseCase**
    - Valida se refreshToken existe e é válido
    - Verifica se não foi revogado
    - Verifica se não expirou
    - Revoga token antigo
    - Gera novo par accessToken + refreshToken (mesma family)
    - Detecta reuso de token revogado → revoga toda a family (token rotation attack)
    - Retorna: `{ accessToken, refreshToken }`
  - **LogoutUseCase**
    - Recebe refreshToken
    - Revoga o token específico
  - **RevokeAllTokensUseCase**
    - Recebe userId
    - Revoga todos os refreshTokens do usuário (logout de todos os dispositivos)

### TASK-017: Criar Use Cases de gestão de usuários

- **Status:** concluída
- **Descrição:**
  - **FindUserUseCase**
    - Busca usuário por ID
    - Lança exceção se não encontrado
    - Retorna User (sem passwordHash)
  - **ListUsersUseCase**
    - Lista usuários de uma organização (paginado)
    - Filtros: `isActive`
  - **UpdateUserUseCase**
    - Busca usuário por ID
    - Valida se novo email é único (se alterado)
    - Atualiza entidade
    - Persiste
  - **ChangePasswordUseCase**
    - Busca usuário
    - Valida senha atual
    - Atualiza com nova senha hasheada
    - Revoga todos os refreshTokens (força re-login)
  - **DeactivateUserUseCase**
    - Busca usuário, chama `deactivate()`, persiste
    - Revoga todos os refreshTokens do usuário

### TASK-018: Criar implementações Prisma dos repositórios

- **Status:** concluída
- **Descrição:**
  - Criar `src/modules/auth/infra/repositories/prisma-user.repository.ts`
    - Implementa `UserRepository` usando `PrismaService`
    - Mapeia entre modelo Prisma e entidade de domínio (métodos privados `toDomain` / `toPrisma`)
  - Criar `src/modules/auth/infra/repositories/prisma-refresh-token.repository.ts`
    - Implementa `RefreshTokenRepository` usando `PrismaService`
    - Mapeia entre modelo Prisma e entidade de domínio

### TASK-019: Criar Guards e Decorators de autenticação

- **Status:** concluída
- **Descrição:**
  - Criar `src/modules/auth/presentation/guards/jwt-auth.guard.ts`
    - Valida JWT do header `Authorization: Bearer <token>`
    - Extrai `userId` e `organizationId` do payload
    - Anexa ao request: `req.user = { userId, organizationId }`
  - Criar `src/modules/auth/presentation/decorators/current-user.decorator.ts`
    - Decorator `@CurrentUser()` para extrair `req.user` em controllers
  - Criar `src/modules/auth/presentation/decorators/public.decorator.ts`
    - Decorator `@Public()` para rotas que não precisam autenticação (ex: login, register)
  - Configurar estratégia Passport JWT:
    - Criar `src/modules/auth/infra/strategies/jwt.strategy.ts`
    - Valida token, extrai payload, retorna objeto user

### TASK-020: Criar controller Auth

- **Status:** concluída
- **Descrição:**
  - Criar `src/modules/auth/presentation/auth.controller.ts`
  - Endpoints:
    - `POST   /auth/register`      → RegisterUserUseCase (rota pública)
    - `POST   /auth/login`         → LoginUseCase (rota pública)
    - `POST   /auth/refresh`       → RefreshTokenUseCase (rota pública)
    - `POST   /auth/logout`        → LogoutUseCase (autenticada)
    - `POST   /auth/logout-all`    → RevokeAllTokensUseCase (autenticada)
    - `GET    /auth/me`            → FindUserUseCase (autenticada, retorna usuário logado)
    - `PATCH  /auth/me`            → UpdateUserUseCase (autenticada)
    - `PATCH  /auth/me/password`   → ChangePasswordUseCase (autenticada)
  - Usar prefixo de API versionado: `/api/v1/auth`

### TASK-021: Criar controller User (gestão de usuários)

- **Status:** concluída
- **Descrição:**
  - Criar `src/modules/auth/presentation/user.controller.ts`
  - Endpoints (todos autenticados, futuramente protegidos por RBAC):
    - `GET    /users`              → ListUsersUseCase (filtrado por organizationId do token)
    - `GET    /users/:id`          → FindUserUseCase
    - `PATCH  /users/:id`          → UpdateUserUseCase
    - `DELETE /users/:id`          → DeactivateUserUseCase
  - Usar prefixo de API versionado: `/api/v1/users`
  - Validar que o usuário só pode gerenciar usuários da mesma organização

### TASK-022: Criar módulo NestJS Auth

- **Status:** concluída
- **Descrição:**
  - Criar `src/modules/auth/auth.module.ts`
  - Registrar providers:
    - Use cases como providers
    - Services (HashService, JwtService customizado)
    - `UserRepository` com `useClass: PrismaUserRepository`
    - `RefreshTokenRepository` com `useClass: PrismaRefreshTokenRepository`
  - Registrar controllers: AuthController, UserController
  - Importar `JwtModule.register()` com configuração
  - Importar `PassportModule`
  - Exportar HashService e JwtService para uso em outros módulos
  - Configurar guard JWT como global (via `APP_GUARD` no AppModule)
  - Importar no `AppModule`

### TASK-023: Criar testes unitários do módulo Auth

- **Status:** concluída
- **Descrição:**
  - Testar entidades `User` e `RefreshToken` (validações, métodos)
  - Testar serviços `HashService` e `JwtService`
  - Testar cada use case com repositórios mockados:
    - RegisterUserUseCase (email único, hash de senha)
    - LoginUseCase (senha incorreta, usuário inativo, geração de tokens)
    - RefreshTokenUseCase (token expirado, revogado, rotation attack)
    - ChangePasswordUseCase (senha atual incorreta, revogação de tokens)
  - Usar Vitest
  - Estrutura de testes espelhando src:

    ```sh
    src/modules/auth/
    ├── domain/entities/__tests__/
    │   ├── user.entity.spec.ts
    │   └── refresh-token.entity.spec.ts
    ├── application/services/__tests__/
    │   ├── hash.service.spec.ts
    │   └── jwt.service.spec.ts
    └── application/use-cases/__tests__/
        ├── register-user.use-case.spec.ts
        ├── login.use-case.spec.ts
        ├── refresh-token.use-case.spec.ts
        └── ...
    ```

### TASK-024: Criar testes e2e do módulo Auth

- **Status:** concluída
- **Descrição:**
  - Criar testes e2e para os endpoints de Auth e User
  - Fluxo completo:
    - Registrar usuário → Login → Acessar rota protegida → Refresh token → Logout
    - Alterar senha → Verificar revogação de tokens
    - Testar token expirado, token inválido, token revogado
  - Usar `supertest` com módulo de teste do NestJS
  - Limpar banco de dados entre testes

### TASK-025: Criar job de limpeza de tokens expirados

- **Status:** concluída
- **Descrição:**
  - Criar `src/modules/auth/application/jobs/clean-expired-tokens.job.ts`
  - Executa periodicamente (ex: diariamente) via cron ou scheduler
  - Chama `refreshTokenRepository.deleteExpired()`
  - Configurar no AuthModule usando `@nestjs/schedule` (opcional, pode ser task futura)

---

## Módulo: Role & Permission (RBAC)

### TASK-026: Criar entidade de domínio Permission

- **Status:** concluída
- **Descrição:**
  - Criar `src/modules/rbac/domain/entities/permission.entity.ts`
  - Propriedades: `id`, `moduleId`, `code`, `resource`, `action`, `description`, `createdAt`
  - Validações no construtor/factory:
    - `moduleId` obrigatório, formato UUID
    - `code` obrigatório, formato `MODULE_RESOURCE_ACTION` (ex: `FINANCE_INVOICE_CREATE`)
    - `resource` obrigatório (ex: `invoice`, `payment`)
    - `action` obrigatório (ex: `create`, `read`, `update`, `delete`, `approve`)
  - Método estático `create()` para nova permissão
  - Método `generateCode()` — gera code a partir de moduleCode, resource e action

### TASK-027: Criar entidade de domínio Role

- **Status:** concluída
- **Descrição:**
  - Criar `src/modules/rbac/domain/entities/role.entity.ts`
  - Propriedades: `id`, `organizationId`, `name`, `code`, `description`, `isSystem`, `createdAt`, `updatedAt`
  - Validações no construtor/factory:
    - `organizationId` pode ser null (roles de sistema)
    - `name` obrigatório
    - `code` obrigatório, formato uppercase com underscore (ex: `ORG_ADMIN`)
    - `isSystem` roles não podem ser editados ou deletados
  - Método estático `create()` para novo role
  - Método `update()` para atualização (valida se não é isSystem)
  - Método estático `createSystemRole()` — cria role de sistema (organizationId = null, isSystem = true)

### TASK-028: Criar entidades de domínio RolePermission, UserRole, RoleInheritance

- **Status:** concluída
- **Descrição:**
  - Criar `src/modules/rbac/domain/entities/role-permission.entity.ts`
    - Propriedades: `id`, `roleId`, `permissionId`, `conditions`, `createdAt`
    - `conditions` é um objeto JSON opcional para permissões condicionais
    - Método estático `create()`
  - Criar `src/modules/rbac/domain/entities/user-role.entity.ts`
    - Propriedades: `id`, `userId`, `roleId`, `assignedBy`, `expiresAt`, `createdAt`
    - Método estático `create()`
    - Método `isExpired()` — verifica se `expiresAt` passou
  - Criar `src/modules/rbac/domain/entities/role-inheritance.entity.ts`
    - Propriedades: `id`, `parentRoleId`, `childRoleId`
    - Método estático `create()`
    - Validação: parentRoleId !== childRoleId (não pode herdar de si mesmo)

### TASK-029: Criar interfaces dos repositórios RBAC

- **Status:** concluída
- **Descrição:**
  - Criar `src/modules/rbac/domain/repositories/permission.repository.ts`
    - `findById(id: string): Promise<Permission | null>`
    - `findByCode(code: string): Promise<Permission | null>`
    - `findByModule(moduleId: string): Promise<Permission[]>`
    - `findAll(): Promise<Permission[]>`
    - `create(permission: Permission): Promise<Permission>`
    - `delete(id: string): Promise<void>`
  - Criar `src/modules/rbac/domain/repositories/role.repository.ts`
    - `findById(id: string): Promise<Role | null>`
    - `findByCode(organizationId: string | null, code: string): Promise<Role | null>`
    - `findByOrganization(organizationId: string | null): Promise<Role[]>`
    - `findAll(): Promise<Role[]>`
    - `create(role: Role): Promise<Role>`
    - `update(role: Role): Promise<Role>`
    - `delete(id: string): Promise<void>`
  - Criar `src/modules/rbac/domain/repositories/role-permission.repository.ts`
    - `findByRoleId(roleId: string): Promise<RolePermission[]>`
    - `create(rolePermission: RolePermission): Promise<RolePermission>`
    - `delete(roleId: string, permissionId: string): Promise<void>`
    - `deleteAllByRoleId(roleId: string): Promise<void>`
  - Criar `src/modules/rbac/domain/repositories/user-role.repository.ts`
    - `findByUserId(userId: string): Promise<UserRole[]>`
    - `findByRoleId(roleId: string): Promise<UserRole[]>`
    - `create(userRole: UserRole): Promise<UserRole>`
    - `delete(userId: string, roleId: string): Promise<void>`
    - `deleteAllByUserId(userId: string): Promise<void>`
  - Criar `src/modules/rbac/domain/repositories/role-inheritance.repository.ts`
    - `findByParentId(parentRoleId: string): Promise<RoleInheritance[]>`
    - `findByChildId(childRoleId: string): Promise<RoleInheritance[]>`
    - `create(roleInheritance: RoleInheritance): Promise<RoleInheritance>`
    - `delete(parentRoleId: string, childRoleId: string): Promise<void>`

### TASK-030: Criar DTOs do módulo RBAC

- **Status:** concluída
- **Descrição:**
  - Criar `src/modules/rbac/application/dtos/create-permission.dto.ts`
    - Campos: `moduleId`, `resource`, `action`, `description?`
  - Criar `src/modules/rbac/application/dtos/create-role.dto.ts`
    - Campos: `organizationId?`, `name`, `code`, `description?`
  - Criar `src/modules/rbac/application/dtos/update-role.dto.ts`
    - Usa `PartialType` com campos: `name`, `description`
  - Criar `src/modules/rbac/application/dtos/assign-role-permission.dto.ts`
    - Campos: `roleId`, `permissionId`, `conditions?`
  - Criar `src/modules/rbac/application/dtos/assign-user-role.dto.ts`
    - Campos: `userId`, `roleId`, `assignedBy`, `expiresAt?`
  - Criar `src/modules/rbac/application/dtos/create-role-inheritance.dto.ts`
    - Campos: `parentRoleId`, `childRoleId`

### TASK-031: Criar Use Cases de Permission

- **Status:** concluída
- **Descrição:**
  - **CreatePermissionUseCase**
    - Gera code automaticamente a partir de moduleId, resource e action
    - Valida se code é único
    - Cria entidade e persiste
  - **FindPermissionUseCase**
    - Busca por ID
  - **ListPermissionsUseCase**
    - Lista todas as permissões
    - Filtros opcionais: moduleId
  - **DeletePermissionUseCase**
    - Deleta permissão (cascata deve remover de RolePermission)

### TASK-032: Criar Use Cases de Role

- **Status:** concluída
- **Descrição:**
  - **CreateRoleUseCase**
    - Valida se code é único dentro da organização
    - Cria entidade e persiste
  - **UpdateRoleUseCase**
    - Valida se não é role de sistema (isSystem = true)
    - Atualiza name e description
  - **FindRoleUseCase**
    - Busca por ID
  - **ListRolesUseCase**
    - Lista roles de uma organização
    - Inclui roles de sistema (organizationId = null)
  - **DeleteRoleUseCase**
    - Valida se não é role de sistema
    - Deleta role (cascata deve remover UserRole, RolePermission, RoleInheritance)
  - **AssignPermissionToRoleUseCase**
    - Cria RolePermission
    - Valida se role e permission existem
    - Suporta conditions opcionais
  - **RemovePermissionFromRoleUseCase**
    - Remove RolePermission
  - **ListRolePermissionsUseCase**
    - Lista permissões de um role (com conditions)

### TASK-033: Criar Use Cases de UserRole e RoleInheritance

- **Status:** concluída
- **Descrição:**
  - **AssignRoleToUserUseCase**
    - Valida se user e role existem
    - Valida se user e role são da mesma organização (ou role é de sistema)
    - Cria UserRole
    - Suporta `expiresAt` para roles temporários
  - **RemoveRoleFromUserUseCase**
    - Remove UserRole
  - **ListUserRolesUseCase**
    - Lista roles de um usuário
    - Filtra roles expirados
  - **CreateRoleInheritanceUseCase**
    - Valida se não cria ciclo via BFS (detecta ciclos diretos e indiretos)
    - Cria RoleInheritance
  - **RemoveRoleInheritanceUseCase**
    - Remove RoleInheritance
  - **ListRoleInheritanceUseCase**
    - Lista herança de um role (pais e filhos)
  - **Testes unitários:** 18 testes cobrindo todos os 6 use cases (happy path, validações, ciclos)

### TASK-034: Criar serviço de autorização (PermissionChecker)

- **Status:** concluída
- **Descrição:**
  - Criar `src/modules/rbac/application/services/permission-checker.service.ts`
  - Métodos:
    - `userHasPermission(userId: string, permissionCode: string, context?: any): Promise<boolean>`
      - Busca roles do usuário (incluindo expirados = false)
      - Resolve herança de roles recursivamente
      - Busca permissões de todos os roles
      - Verifica se permissionCode está presente
      - Avalia conditions se existirem (passar context com dados da requisição)
    - `getUserPermissions(userId: string): Promise<Permission[]>`
      - Retorna todas as permissões efetivas do usuário (com herança resolvida)
    - `resolveRoleInheritance(roleId: string): Promise<string[]>`
      - Retorna IDs de todos os roles herdados (recursivo)
  - Implementar cache in-memory para performance (opcional, pode usar `@nestjs/cache-manager`)
  - **Testes unitários:** testar resolução de herança, verificação de permissões, avaliação de conditions

### TASK-035: Criar Guard e Decorator de autorização

- **Status:** concluída
- **Nota:** Registro global do `PermissionGuard` (via `APP_GUARD`) adiado para TASK-038 (criação do `RbacModule`), pois o guard depende do `PermissionCheckerService` via DI.
- **Descrição:**
  - Criar `src/modules/rbac/presentation/guards/permission.guard.ts`
    - Guard que verifica se usuário tem permissão
    - Lê metadata `@RequirePermission()` do endpoint
    - Usa PermissionCheckerService para validar
    - Se não tiver permissão, lança `ForbiddenException`
  - Criar `src/modules/rbac/presentation/decorators/require-permission.decorator.ts`
    - Decorator `@RequirePermission('PERMISSION_CODE')`
    - Define metadata `permissions` no endpoint
  - Criar `src/modules/rbac/presentation/decorators/require-module.decorator.ts` (opcional)
    - Decorator `@RequireModule('MODULE_CODE')`
    - Valida se o módulo está ativo na organização do usuário
  - Configurar PermissionGuard como global (após JwtAuthGuard)
  - **Testes unitários:** testar guard com permissão válida, sem permissão, rota pública

### TASK-036: Criar implementações Prisma dos repositórios RBAC

- **Status:** concluída
- **Descrição:**
  - Criar `src/modules/rbac/infra/repositories/prisma-permission.repository.ts`
  - Criar `src/modules/rbac/infra/repositories/prisma-role.repository.ts`
  - Criar `src/modules/rbac/infra/repositories/prisma-role-permission.repository.ts`
  - Criar `src/modules/rbac/infra/repositories/prisma-user-role.repository.ts`
  - Criar `src/modules/rbac/infra/repositories/prisma-role-inheritance.repository.ts`
  - Todas implementam suas respectivas interfaces usando `PrismaService`
  - Mapear entre modelos Prisma e entidades de domínio

### TASK-037: Criar controllers RBAC

- **Status:** concluída
- **Descrição:**
  - Criar `src/modules/rbac/presentation/permission.controller.ts`
    - `POST   /permissions`            → CreatePermissionUseCase
    - `GET    /permissions`            → ListPermissionsUseCase
    - `GET    /permissions/:id`        → FindPermissionUseCase
    - `DELETE /permissions/:id`        → DeletePermissionUseCase
  - Criar `src/modules/rbac/presentation/role.controller.ts`
    - `POST   /roles`                  → CreateRoleUseCase
    - `GET    /roles`                  → ListRolesUseCase
    - `GET    /roles/:id`              → FindRoleUseCase
    - `PATCH  /roles/:id`              → UpdateRoleUseCase
    - `DELETE /roles/:id`              → DeleteRoleUseCase
    - `POST   /roles/:id/permissions`  → AssignPermissionToRoleUseCase
    - `DELETE /roles/:id/permissions/:permissionId` → RemovePermissionFromRoleUseCase
    - `GET    /roles/:id/permissions`  → ListRolePermissionsUseCase
  - Criar `src/modules/rbac/presentation/user-role.controller.ts`
    - `POST   /users/:userId/roles`    → AssignRoleToUserUseCase
    - `DELETE /users/:userId/roles/:roleId` → RemoveRoleFromUserUseCase
    - `GET    /users/:userId/roles`    → ListUserRolesUseCase
  - Usar prefixo de API versionado: `/api/v1/...`
  - Proteger endpoints com `@RequirePermission()` (ex: `RBAC_ROLE_CREATE`)

### TASK-038: Criar módulo NestJS RBAC

- **Status:** concluída
- **Descrição:**
  - Criar `src/modules/rbac/rbac.module.ts`
  - Registrar providers:
    - Use cases como providers
    - PermissionCheckerService
    - Todos os repositórios com suas implementações Prisma
  - Registrar controllers: PermissionController, RoleController, UserRoleController
  - Exportar PermissionCheckerService para uso em outros módulos
  - Configurar PermissionGuard como global (via `APP_GUARD` no AppModule, ordem após JwtAuthGuard)
  - Importar no `AppModule`

### TASK-039: Criar seed de permissões e roles de sistema

- **Status:** concluída
- **Descrição:**
  - Criar `prisma/seeds/rbac.seed.ts`
  - Seed de roles de sistema:
    - `SUPER_ADMIN` — bypass de todas as permissões
    - `ORG_ADMIN` — todas as permissões de módulos ativos na organização
    - `MODULE_MANAGER` — gerencia um módulo específico
    - `VIEWER` — read-only
  - Seed de permissões do módulo RBAC:
    - `RBAC_ROLE_CREATE`, `RBAC_ROLE_READ`, `RBAC_ROLE_UPDATE`, `RBAC_ROLE_DELETE`
    - `RBAC_PERMISSION_CREATE`, `RBAC_PERMISSION_READ`, `RBAC_PERMISSION_DELETE`
    - `RBAC_USER_ROLE_ASSIGN`, `RBAC_USER_ROLE_REVOKE`, `RBAC_USER_ROLE_READ`
  - Atribuir permissões aos roles de sistema
  - Executar seed no setup inicial do projeto

### TASK-040: Criar testes unitários restantes do módulo RBAC

- **Status:** concluída
- **Descrição:**
  - Testar use cases de Permission (TASK-031) e Role (TASK-032) com repositórios mockados:
    - CreatePermissionUseCase, FindPermissionUseCase, ListPermissionsUseCase, DeletePermissionUseCase
    - CreateRoleUseCase, UpdateRoleUseCase, FindRoleUseCase, ListRolesUseCase, DeleteRoleUseCase
    - AssignPermissionToRoleUseCase, RemovePermissionFromRoleUseCase, ListRolePermissionsUseCase
  - **Nota:** testes de use cases de UserRole e RoleInheritance (TASK-033) já implementados
  - **Nota:** testes de entidades já existem em `domain/entities/__tests__/`
  - Usar Vitest
  - Estrutura de testes espelhando src

### TASK-041: Criar testes e2e do módulo RBAC

- **Status:** concluída
- **Descrição:**
  - Criar testes e2e para endpoints de Permission, Role, UserRole
  - Fluxo completo:
    - Criar role → Atribuir permissões → Atribuir role a usuário → Testar acesso a rota protegida
    - Testar herança de roles
    - Testar role expirado (expiresAt)
    - Testar conditions em permissões
  - Usar `supertest` com módulo de teste do NestJS
  - Limpar banco de dados entre testes

---

## Módulo: Module Management (Module + OrganizationModule)

### TASK-042: Criar entidade de domínio Module

- **Status:** pendente
- **Descrição:**
  - Criar `src/modules/module-management/domain/entities/module.entity.ts`
  - Propriedades: `id`, `code`, `name`, `description`, `icon`, `isActive`, `sortOrder`, `createdAt`, `updatedAt`
  - Validações no construtor/factory:
    - `code` obrigatório, uppercase (ex: `FINANCE`, `INVENTORY`)
    - `name` obrigatório
    - `sortOrder` default 0
  - Método estático `create()` para novo módulo
  - Método `update()` para atualização (name, description, icon, sortOrder)
  - Método `activate()` e `deactivate()` para mudar status

### TASK-043: Criar entidade de domínio OrganizationModule

- **Status:** pendente
- **Descrição:**
  - Criar `src/modules/module-management/domain/entities/organization-module.entity.ts`
  - Propriedades: `id`, `organizationId`, `moduleId`, `isActive`, `activatedAt`, `deactivatedAt`
  - Validações no construtor/factory:
    - `organizationId` obrigatório, formato UUID
    - `moduleId` obrigatório, formato UUID
  - Método estático `create()` para ativar módulo em organização
  - Método `activate()` — marca isActive = true, atualiza activatedAt, limpa deactivatedAt
  - Método `deactivate()` — marca isActive = false, atualiza deactivatedAt
  - Regra de negócio: ao desativar, verificar se não afeta usuários/roles ativos (implementar no use case)

### TASK-044: Criar interfaces dos repositórios Module e OrganizationModule

- **Status:** pendente
- **Descrição:**
  - Criar `src/modules/module-management/domain/repositories/module.repository.ts`
    - `findById(id: string): Promise<Module | null>`
    - `findByCode(code: string): Promise<Module | null>`
    - `findAll(params?: { isActive?: boolean }): Promise<Module[]>`
    - `create(module: Module): Promise<Module>`
    - `update(module: Module): Promise<Module>`
    - `delete(id: string): Promise<void>`
  - Criar `src/modules/module-management/domain/repositories/organization-module.repository.ts`
    - `findById(id: string): Promise<OrganizationModule | null>`
    - `findByOrganizationAndModule(organizationId: string, moduleId: string): Promise<OrganizationModule | null>`
    - `findByOrganization(organizationId: string, params?: { isActive?: boolean }): Promise<OrganizationModule[]>`
    - `findByModule(moduleId: string): Promise<OrganizationModule[]>`
    - `create(orgModule: OrganizationModule): Promise<OrganizationModule>`
    - `update(orgModule: OrganizationModule): Promise<OrganizationModule>`
    - `delete(id: string): Promise<void>`

### TASK-045: Criar DTOs do módulo Module Management

- **Status:** pendente
- **Descrição:**
  - Criar `src/modules/module-management/application/dtos/create-module.dto.ts`
    - Campos: `code`, `name`, `description?`, `icon?`, `sortOrder?`
  - Criar `src/modules/module-management/application/dtos/update-module.dto.ts`
    - Usa `PartialType` com campos: `name`, `description`, `icon`, `sortOrder`
  - Criar `src/modules/module-management/application/dtos/activate-module.dto.ts`
    - Campos: `organizationId`, `moduleId`

### TASK-046: Criar Use Cases de Module

- **Status:** pendente
- **Descrição:**
  - **CreateModuleUseCase**
    - Valida se code é único
    - Cria entidade e persiste
  - **UpdateModuleUseCase**
    - Busca por ID, atualiza, persiste
  - **FindModuleUseCase**
    - Busca por ID
  - **ListModulesUseCase**
    - Lista todos os módulos
    - Filtro opcional: isActive
  - **ActivateModuleUseCase** (habilita módulo globalmente)
    - Chama `activate()` na entidade
  - **DeactivateModuleUseCase** (desabilita módulo globalmente)
    - Chama `deactivate()` na entidade
    - Desativa automaticamente em todas as organizações (OrganizationModule)
  - **Testes unitários:** testar cada use case com repositórios mockados

### TASK-047: Criar Use Cases de OrganizationModule

- **Status:** pendente
- **Descrição:**
  - **ActivateModuleForOrganizationUseCase**
    - Valida se módulo existe e está ativo globalmente
    - Valida se organização existe
    - Verifica se já está ativo (se sim, retorna existente)
    - Cria OrganizationModule com isActive = true
  - **DeactivateModuleForOrganizationUseCase**
    - Busca OrganizationModule
    - Chama `deactivate()` na entidade
    - Persiste
  - **ListOrganizationModulesUseCase**
    - Lista módulos de uma organização
    - Filtro opcional: isActive
    - Retorna dados do Module junto (join)
  - **CheckModuleAccessUseCase**
    - Recebe organizationId e moduleCode
    - Verifica se o módulo está ativo na organização
    - Usado pelo guard de autorização
  - **Testes unitários:** testar cada use case com repositórios mockados

### TASK-048: Criar implementações Prisma dos repositórios

- **Status:** pendente
- **Descrição:**
  - Criar `src/modules/module-management/infra/repositories/prisma-module.repository.ts`
    - Implementa `ModuleRepository` usando `PrismaService`
    - Mapeia entre modelo Prisma e entidade de domínio
  - Criar `src/modules/module-management/infra/repositories/prisma-organization-module.repository.ts`
    - Implementa `OrganizationModuleRepository` usando `PrismaService`
    - Mapeia entre modelo Prisma e entidade de domínio

### TASK-049: Criar controllers Module Management

- **Status:** pendente
- **Descrição:**
  - Criar `src/modules/module-management/presentation/module.controller.ts`
    - `POST   /modules`                  → CreateModuleUseCase
    - `GET    /modules`                  → ListModulesUseCase
    - `GET    /modules/:id`              → FindModuleUseCase
    - `PATCH  /modules/:id`              → UpdateModuleUseCase
    - `POST   /modules/:id/activate`     → ActivateModuleUseCase (global)
    - `POST   /modules/:id/deactivate`   → DeactivateModuleUseCase (global)
  - Criar `src/modules/module-management/presentation/organization-module.controller.ts`
    - `POST   /organizations/:orgId/modules/:moduleId/activate` → ActivateModuleForOrganizationUseCase
    - `POST   /organizations/:orgId/modules/:moduleId/deactivate` → DeactivateModuleForOrganizationUseCase
    - `GET    /organizations/:orgId/modules` → ListOrganizationModulesUseCase
  - Usar prefixo de API versionado: `/api/v1/...`
  - Proteger endpoints com `@RequirePermission()` (ex: `MODULE_MANAGEMENT_MODULE_CREATE`)

### TASK-050: Criar módulo NestJS Module Management

- **Status:** pendente
- **Descrição:**
  - Criar `src/modules/module-management/module-management.module.ts`
  - Registrar providers:
    - Use cases como providers
    - `ModuleRepository` com `useClass: PrismaModuleRepository`
    - `OrganizationModuleRepository` com `useClass: PrismaOrganizationModuleRepository`
  - Registrar controllers: ModuleController, OrganizationModuleController
  - Exportar CheckModuleAccessUseCase para uso no guard de autorização
  - Importar no `AppModule`

### TASK-051: Criar seed de módulos do sistema

- **Status:** pendente
- **Descrição:**
  - Criar `prisma/seeds/modules.seed.ts`
  - Seed de módulos básicos:
    - `FINANCE` — Financeiro
    - `INVENTORY` — Estoque
    - `SALES` — Vendas
    - `PURCHASE` — Compras
    - `HR` — Recursos Humanos
    - `FISCAL` — Fiscal
    - `CRM` — CRM
    - `BOOKING` — Reservas
  - Executar seed no setup inicial do projeto

### TASK-052: Atualizar guard de autorização para verificar módulo ativo

- **Status:** pendente
- **Descrição:**
  - Atualizar `PermissionGuard` (TASK-035) para:
    - Extrair módulo da permissão (primeira parte do code: `FINANCE_INVOICE_CREATE` → `FINANCE`)
    - Chamar `CheckModuleAccessUseCase` para verificar se módulo está ativo na organização
    - Se módulo não estiver ativo, lançar `ForbiddenException` com mensagem "Módulo não contratado"
  - Adicionar cache para evitar consultas repetidas (opcional)

### TASK-053: Criar testes unitários de entidades do módulo Module Management

- **Status:** pendente
- **Descrição:**
  - Testar entidades `Module` e `OrganizationModule` (validações, métodos)
  - **Nota:** testes de use cases são incluídos nas respectivas tasks (TASK-046, TASK-047)
  - Usar Vitest
  - Estrutura de testes espelhando src

### TASK-054: Criar testes e2e do módulo Module Management

- **Status:** pendente
- **Descrição:**
  - Criar testes e2e para endpoints de Module e OrganizationModule
  - Fluxo completo:
    - Criar módulo → Ativar para organização → Verificar acesso → Desativar → Verificar bloqueio
    - Desativar módulo globalmente → Verificar desativação em todas as organizações
  - Integrar com guard de autorização para testar bloqueio de acesso
  - Usar `supertest` com módulo de teste do NestJS
  - Limpar banco de dados entre testes

---

## Ordem de Execução Geral

```text
Organization (TASK-001 a TASK-010) — concluído
    ↓
Auth (TASK-011 a TASK-025)
    ↓
RBAC (TASK-026 a TASK-041)
    ↓
Module Management (TASK-042 a TASK-054)
```

### Dependências Críticas

- **Auth** depende de Organization (relacionamento User → Organization)
- **RBAC** depende de Auth (UserRole precisa de User) e Organization (Role → Organization)
- **Module Management** depende de Organization (OrganizationModule) e indiretamente de RBAC (permissões de gestão de módulos)

### Observações de Implementação

1. **Segurança de Senhas:**
   - Usar bcrypt com custo 10 para hash
   - Nunca retornar `passwordHash` em respostas de API
   - Implementar política de senha forte (min 8 caracteres, letras, números)

2. **JWT e Refresh Tokens:**
   - AccessToken: 15 minutos (curto)
   - RefreshToken: 7 dias
   - Implementar token rotation para segurança
   - Detectar reuso de refresh token revogado (possível ataque)

3. **RBAC:**
   - Implementar cache de permissões para performance
   - Roles de sistema não podem ser editados/deletados
   - Herança de roles deve ser acíclica
   - Suportar conditions em permissões para granularidade

4. **Module Management:**
   - Ao desativar módulo globalmente, desativar em todas as organizações
   - Validar acesso a módulo em todas as rotas protegidas
   - Seed inicial deve incluir módulos básicos do ERP

5. **Testes:**
   - Cobertura mínima de 80% em use cases críticos
   - Testes e2e devem simular fluxos completos de autenticação e autorização
   - Usar fixtures/factories para criar dados de teste consistentes

---

## Próximos Módulos (após Module Management)

Seguir o mesmo padrão DDD para cada módulo:

| Ordem | Módulo | Depende de |
| ------- | -------- | ------------ |
| 1 | **Organization** | shared base |
| 2 | **Auth** (User + JWT + RefreshToken) | Organization |
| 3 | **Role & Permission** (RBAC) | Organization, Auth |
| 4 | **Module Management** (OrganizationModule) | Organization, RBAC |
| 5 | **Finance** | RBAC, Module Management |
| 6 | **Inventory** | RBAC, Module Management |
| ... | demais módulos | RBAC, Module Management |
