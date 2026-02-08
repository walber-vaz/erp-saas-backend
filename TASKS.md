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

- **Status:** pendente
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

- **Status:** pendente
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

## Próximos Módulos (após Organization)

Seguir o mesmo padrão DDD para cada módulo:

| Ordem | Módulo | Depende de |
| ------- | -------- | ------------ |
| 1 | **Organization** (atual) | shared base |
| 2 | **Auth** (User + JWT + RefreshToken) | Organization |
| 3 | **Role & Permission** (RBAC) | Organization, Auth |
| 4 | **Module Management** (OrganizationModule) | Organization, RBAC |
| 5 | **Finance** | RBAC, Module Management |
| 6 | **Inventory** | RBAC, Module Management |
| ... | demais módulos | RBAC, Module Management |
