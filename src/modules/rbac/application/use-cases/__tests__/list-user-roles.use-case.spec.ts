import type { Mocked } from 'vitest';
import { UserRole } from '@modules/rbac/domain/entities/user-role.entity';
import { UserRoleRepository } from '@modules/rbac/domain/repositories/user-role.repository';
import { ListUserRolesUseCase } from '../list-user-roles.use-case';

const USER_ID = '550e8400-e29b-41d4-a716-446655440001';
const ROLE_ID = '550e8400-e29b-41d4-a716-446655440002';
const ASSIGNER_ID = '550e8400-e29b-41d4-a716-446655440003';

const mockUserRoleRepository: Mocked<UserRoleRepository> = {
  findByUserId: vi.fn(),
  findByRoleId: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
  deleteAllByUserId: vi.fn(),
};

describe('ListUserRolesUseCase', () => {
  let useCase: ListUserRolesUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new ListUserRolesUseCase(mockUserRoleRepository);
  });

  it('deve retornar roles não expirados', async () => {
    const activeRole = UserRole.create({
      userId: USER_ID,
      roleId: ROLE_ID,
      assignedBy: ASSIGNER_ID,
      expiresAt: new Date(Date.now() + 86400000), // tomorrow
    });
    mockUserRoleRepository.findByUserId.mockResolvedValue([activeRole]);

    const result = await useCase.execute(USER_ID);

    expect(result).toHaveLength(1);
    expect(result[0].roleId).toBe(ROLE_ID);
  });

  it('deve filtrar roles expirados', async () => {
    const expiredRole = UserRole.create({
      userId: USER_ID,
      roleId: ROLE_ID,
      assignedBy: ASSIGNER_ID,
      expiresAt: new Date(Date.now() - 86400000), // yesterday
    });
    mockUserRoleRepository.findByUserId.mockResolvedValue([expiredRole]);

    const result = await useCase.execute(USER_ID);

    expect(result).toHaveLength(0);
  });

  it('deve retornar roles sem data de expiração', async () => {
    const permanentRole = UserRole.create({
      userId: USER_ID,
      roleId: ROLE_ID,
      assignedBy: ASSIGNER_ID,
    });
    mockUserRoleRepository.findByUserId.mockResolvedValue([permanentRole]);

    const result = await useCase.execute(USER_ID);

    expect(result).toHaveLength(1);
  });
});
