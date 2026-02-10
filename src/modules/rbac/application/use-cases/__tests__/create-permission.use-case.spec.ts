import type { Mocked } from 'vitest';
import { DomainException } from '@shared/exceptions/domain.exception';
import { PermissionErrorMessages } from '@modules/rbac/domain/constants/error-messages';
import { Permission } from '@modules/rbac/domain/entities/permission.entity';
import { PermissionRepository } from '@modules/rbac/domain/repositories/permission.repository';
import { ModuleRepository } from '@modules/module-management/domain/repositories/module.repository';
import { Module } from '@modules/module-management/domain/entities/module.entity';
import { CreatePermissionUseCase } from '../create-permission.use-case';

const MODULE_ID = '550e8400-e29b-41d4-a716-446655440000';

const mockPermissionRepository: Mocked<PermissionRepository> = {
  findById: vi.fn(),
  findByCode: vi.fn(),
  findByModule: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
};

const mockModuleRepository: Mocked<ModuleRepository> = {
  findById: vi.fn(),
};

const makeModule = () =>
  Module.create({
    id: MODULE_ID,
    code: 'FINANCE',
    name: 'Finance',
  });

describe('CreatePermissionUseCase', () => {
  let useCase: CreatePermissionUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new CreatePermissionUseCase(
      mockPermissionRepository,
      mockModuleRepository,
    );
  });

  it('deve criar permissão com code gerado automaticamente', async () => {
    mockModuleRepository.findById.mockResolvedValue(makeModule());
    mockPermissionRepository.findByCode.mockResolvedValue(null);
    mockPermissionRepository.create.mockImplementation(async (p) => p);

    const result = await useCase.execute({
      moduleId: MODULE_ID,
      resource: 'invoice',
      action: 'create',
    });

    expect(result).toBeInstanceOf(Permission);
    expect(result.code).toBe('FINANCE_INVOICE_CREATE');
    expect(result.moduleId).toBe(MODULE_ID);
    expect(mockPermissionRepository.create).toHaveBeenCalledTimes(1);
  });

  it('deve lançar exceção quando módulo não encontrado', async () => {
    mockModuleRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        moduleId: MODULE_ID,
        resource: 'invoice',
        action: 'create',
      }),
    ).rejects.toThrow(
      new DomainException(PermissionErrorMessages.MODULE_NOT_FOUND),
    );

    expect(mockPermissionRepository.create).not.toHaveBeenCalled();
  });

  it('deve lançar exceção quando code já em uso', async () => {
    mockModuleRepository.findById.mockResolvedValue(makeModule());
    mockPermissionRepository.findByCode.mockResolvedValue(
      Permission.create({
        moduleId: MODULE_ID,
        code: 'FINANCE_INVOICE_CREATE',
        resource: 'invoice',
        action: 'create',
      }),
    );

    await expect(
      useCase.execute({
        moduleId: MODULE_ID,
        resource: 'invoice',
        action: 'create',
      }),
    ).rejects.toThrow(
      new DomainException(PermissionErrorMessages.CODE_ALREADY_IN_USE),
    );

    expect(mockPermissionRepository.create).not.toHaveBeenCalled();
  });
});
