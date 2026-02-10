import type { Mocked } from 'vitest';
import { UserRoleRepository } from '@modules/rbac/domain/repositories/user-role.repository';
import { RemoveRoleFromUserUseCase } from '../remove-role-from-user.use-case';

const USER_ID = '550e8400-e29b-41d4-a716-446655440001';
const ROLE_ID = '550e8400-e29b-41d4-a716-446655440002';

const mockUserRoleRepository: Mocked<UserRoleRepository> = {
  findByUserId: vi.fn(),
  findByRoleId: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
  deleteAllByUserId: vi.fn(),
};

describe('RemoveRoleFromUserUseCase', () => {
  let useCase: RemoveRoleFromUserUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new RemoveRoleFromUserUseCase(mockUserRoleRepository);
  });

  it('deve delegar remoção ao repositório', async () => {
    mockUserRoleRepository.delete.mockResolvedValue(undefined);

    await useCase.execute(USER_ID, ROLE_ID);

    expect(mockUserRoleRepository.delete).toHaveBeenCalledWith(
      USER_ID,
      ROLE_ID,
    );
    expect(mockUserRoleRepository.delete).toHaveBeenCalledTimes(1);
  });
});
