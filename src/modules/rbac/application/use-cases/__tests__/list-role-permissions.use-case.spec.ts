import type { Mocked } from 'vitest';
import { RolePermission } from '@modules/rbac/domain/entities/role-permission.entity';
import { RolePermissionRepository } from '@modules/rbac/domain/repositories/role-permission.repository';
import { ListRolePermissionsUseCase } from '../list-role-permissions.use-case';

const ROLE_ID = '550e8400-e29b-41d4-a716-446655440001';
const PERMISSION_ID = '550e8400-e29b-41d4-a716-446655440002';

const mockRolePermissionRepository: Mocked<RolePermissionRepository> = {
  findByRoleId: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
  deleteAllByRoleId: vi.fn(),
};

describe('ListRolePermissionsUseCase', () => {
  let useCase: ListRolePermissionsUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new ListRolePermissionsUseCase(mockRolePermissionRepository);
  });

  it('deve delegar para findByRoleId do repositório', async () => {
    const rolePermissions = [
      RolePermission.create({
        roleId: ROLE_ID,
        permissionId: PERMISSION_ID,
      }),
    ];
    mockRolePermissionRepository.findByRoleId.mockResolvedValue(
      rolePermissions,
    );

    const result = await useCase.execute(ROLE_ID);

    expect(result).toHaveLength(1);
    expect(mockRolePermissionRepository.findByRoleId).toHaveBeenCalledWith(
      ROLE_ID,
    );
  });
});
