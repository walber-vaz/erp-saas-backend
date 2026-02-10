import type { Mocked } from 'vitest';
import { Permission } from '@modules/rbac/domain/entities/permission.entity';
import { PermissionRepository } from '@modules/rbac/domain/repositories/permission.repository';
import { ListPermissionsUseCase } from '../list-permissions.use-case';

const MODULE_ID = '550e8400-e29b-41d4-a716-446655440000';

const mockPermissionRepository: Mocked<PermissionRepository> = {
  findById: vi.fn(),
  findByCode: vi.fn(),
  findByModule: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
};

const makePermission = (code: string) =>
  Permission.create({
    moduleId: MODULE_ID,
    code,
    resource: 'invoice',
    action: 'create',
  });

describe('ListPermissionsUseCase', () => {
  let useCase: ListPermissionsUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new ListPermissionsUseCase(mockPermissionRepository);
  });

  it('deve listar todas as permissões quando sem filtro', async () => {
    const permissions = [
      makePermission('FINANCE_INVOICE_CREATE'),
      makePermission('FINANCE_INVOICE_READ'),
    ];
    mockPermissionRepository.findAll.mockResolvedValue(permissions);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(mockPermissionRepository.findAll).toHaveBeenCalledTimes(1);
    expect(mockPermissionRepository.findByModule).not.toHaveBeenCalled();
  });

  it('deve filtrar por moduleId quando fornecido', async () => {
    const permissions = [makePermission('FINANCE_INVOICE_CREATE')];
    mockPermissionRepository.findByModule.mockResolvedValue(permissions);

    const result = await useCase.execute(MODULE_ID);

    expect(result).toHaveLength(1);
    expect(mockPermissionRepository.findByModule).toHaveBeenCalledWith(
      MODULE_ID,
    );
    expect(mockPermissionRepository.findAll).not.toHaveBeenCalled();
  });
});
