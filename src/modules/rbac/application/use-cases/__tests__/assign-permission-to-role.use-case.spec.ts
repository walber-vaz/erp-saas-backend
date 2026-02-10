import type { Mocked } from 'vitest';
import { DomainException } from '@shared/exceptions/domain.exception';
import {
  RoleErrorMessages,
  PermissionErrorMessages,
} from '@modules/rbac/domain/constants/error-messages';
import { Role } from '@modules/rbac/domain/entities/role.entity';
import { Permission } from '@modules/rbac/domain/entities/permission.entity';
import { RolePermission } from '@modules/rbac/domain/entities/role-permission.entity';
import { RolePermissionRepository } from '@modules/rbac/domain/repositories/role-permission.repository';
import { RoleRepository } from '@modules/rbac/domain/repositories/role.repository';
import { PermissionRepository } from '@modules/rbac/domain/repositories/permission.repository';
import { AssignPermissionToRoleUseCase } from '../assign-permission-to-role.use-case';

const ORG_ID = '550e8400-e29b-41d4-a716-446655440000';
const ROLE_ID = '550e8400-e29b-41d4-a716-446655440001';
const PERMISSION_ID = '550e8400-e29b-41d4-a716-446655440002';
const MODULE_ID = '550e8400-e29b-41d4-a716-446655440003';

const mockRolePermissionRepository: Mocked<RolePermissionRepository> = {
  findByRoleId: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
  deleteAllByRoleId: vi.fn(),
};

const mockRoleRepository: Mocked<RoleRepository> = {
  findById: vi.fn(),
  findByCode: vi.fn(),
  findByOrganization: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const mockPermissionRepository: Mocked<PermissionRepository> = {
  findById: vi.fn(),
  findByCode: vi.fn(),
  findByModule: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
};

const makeRole = () =>
  Role.create({
    id: ROLE_ID,
    organizationId: ORG_ID,
    name: 'Admin',
    code: 'ADMIN',
  });

const makePermission = () =>
  Permission.create({
    id: PERMISSION_ID,
    moduleId: MODULE_ID,
    code: 'FINANCE_INVOICE_CREATE',
    resource: 'invoice',
    action: 'create',
  });

describe('AssignPermissionToRoleUseCase', () => {
  let useCase: AssignPermissionToRoleUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new AssignPermissionToRoleUseCase(
      mockRolePermissionRepository,
      mockRoleRepository,
      mockPermissionRepository,
    );
  });

  it('deve atribuir permissão ao role com sucesso', async () => {
    mockRoleRepository.findById.mockResolvedValue(makeRole());
    mockPermissionRepository.findById.mockResolvedValue(makePermission());
    mockRolePermissionRepository.create.mockImplementation(async (rp) => rp);

    const result = await useCase.execute({
      roleId: ROLE_ID,
      permissionId: PERMISSION_ID,
    });

    expect(result).toBeInstanceOf(RolePermission);
    expect(result.roleId).toBe(ROLE_ID);
    expect(result.permissionId).toBe(PERMISSION_ID);
    expect(result.conditions).toBeNull();
    expect(mockRolePermissionRepository.create).toHaveBeenCalledTimes(1);
  });

  it('deve atribuir permissão com conditions', async () => {
    mockRoleRepository.findById.mockResolvedValue(makeRole());
    mockPermissionRepository.findById.mockResolvedValue(makePermission());
    mockRolePermissionRepository.create.mockImplementation(async (rp) => rp);

    const conditions = { maxAmount: 10000 };
    const result = await useCase.execute({
      roleId: ROLE_ID,
      permissionId: PERMISSION_ID,
      conditions,
    });

    expect(result).toBeInstanceOf(RolePermission);
    expect(result.conditions).toEqual(conditions);
  });

  it('deve lançar exceção quando role não encontrado', async () => {
    mockRoleRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        roleId: ROLE_ID,
        permissionId: PERMISSION_ID,
      }),
    ).rejects.toThrow(new DomainException(RoleErrorMessages.NOT_FOUND));

    expect(mockRolePermissionRepository.create).not.toHaveBeenCalled();
  });

  it('deve lançar exceção quando permissão não encontrada', async () => {
    mockRoleRepository.findById.mockResolvedValue(makeRole());
    mockPermissionRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        roleId: ROLE_ID,
        permissionId: PERMISSION_ID,
      }),
    ).rejects.toThrow(new DomainException(PermissionErrorMessages.NOT_FOUND));

    expect(mockRolePermissionRepository.create).not.toHaveBeenCalled();
  });
});
