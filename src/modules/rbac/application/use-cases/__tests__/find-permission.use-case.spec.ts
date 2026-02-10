import type { Mocked } from 'vitest';
import { DomainException } from '@shared/exceptions/domain.exception';
import { PermissionErrorMessages } from '@modules/rbac/domain/constants/error-messages';
import { Permission } from '@modules/rbac/domain/entities/permission.entity';
import { PermissionRepository } from '@modules/rbac/domain/repositories/permission.repository';
import { FindPermissionUseCase } from '../find-permission.use-case';

const MODULE_ID = '550e8400-e29b-41d4-a716-446655440000';
const PERMISSION_ID = '550e8400-e29b-41d4-a716-446655440001';

const mockPermissionRepository: Mocked<PermissionRepository> = {
  findById: vi.fn(),
  findByCode: vi.fn(),
  findByModule: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
};

const makePermission = () =>
  Permission.create({
    id: PERMISSION_ID,
    moduleId: MODULE_ID,
    code: 'FINANCE_INVOICE_CREATE',
    resource: 'invoice',
    action: 'create',
  });

describe('FindPermissionUseCase', () => {
  let useCase: FindPermissionUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new FindPermissionUseCase(mockPermissionRepository);
  });

  it('deve retornar permissão quando encontrada', async () => {
    const permission = makePermission();
    mockPermissionRepository.findById.mockResolvedValue(permission);

    const result = await useCase.execute(PERMISSION_ID);

    expect(result).toBeInstanceOf(Permission);
    expect(result.id).toBe(PERMISSION_ID);
    expect(mockPermissionRepository.findById).toHaveBeenCalledWith(
      PERMISSION_ID,
    );
  });

  it('deve lançar exceção quando permissão não encontrada', async () => {
    mockPermissionRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(PERMISSION_ID)).rejects.toThrow(
      new DomainException(PermissionErrorMessages.NOT_FOUND),
    );
  });
});
