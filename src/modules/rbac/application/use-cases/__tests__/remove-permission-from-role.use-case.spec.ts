import type { Mocked } from 'vitest';
import { RolePermissionRepository } from '@modules/rbac/domain/repositories/role-permission.repository';
import { RemovePermissionFromRoleUseCase } from '../remove-permission-from-role.use-case';

const ROLE_ID = '550e8400-e29b-41d4-a716-446655440001';
const PERMISSION_ID = '550e8400-e29b-41d4-a716-446655440002';

const mockRolePermissionRepository: Mocked<RolePermissionRepository> = {
  findByRoleId: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
  deleteAllByRoleId: vi.fn(),
};

describe('RemovePermissionFromRoleUseCase', () => {
  let useCase: RemovePermissionFromRoleUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new RemovePermissionFromRoleUseCase(mockRolePermissionRepository);
  });

  it('deve delegar para delete do repositório', async () => {
    mockRolePermissionRepository.delete.mockResolvedValue(undefined);

    await useCase.execute(ROLE_ID, PERMISSION_ID);

    expect(mockRolePermissionRepository.delete).toHaveBeenCalledWith(
      ROLE_ID,
      PERMISSION_ID,
    );
  });
});
