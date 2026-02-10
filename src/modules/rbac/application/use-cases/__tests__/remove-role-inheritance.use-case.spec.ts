import type { Mocked } from 'vitest';
import { RoleInheritanceRepository } from '@modules/rbac/domain/repositories/role-inheritance.repository';
import { RemoveRoleInheritanceUseCase } from '../remove-role-inheritance.use-case';

const PARENT_ID = '550e8400-e29b-41d4-a716-446655440001';
const CHILD_ID = '550e8400-e29b-41d4-a716-446655440002';

const mockRoleInheritanceRepository: Mocked<RoleInheritanceRepository> = {
  findByParentId: vi.fn(),
  findByChildId: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
};

describe('RemoveRoleInheritanceUseCase', () => {
  let useCase: RemoveRoleInheritanceUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new RemoveRoleInheritanceUseCase(mockRoleInheritanceRepository);
  });

  it('deve delegar remoção ao repositório', async () => {
    mockRoleInheritanceRepository.delete.mockResolvedValue(undefined);

    await useCase.execute(PARENT_ID, CHILD_ID);

    expect(mockRoleInheritanceRepository.delete).toHaveBeenCalledWith(
      PARENT_ID,
      CHILD_ID,
    );
    expect(mockRoleInheritanceRepository.delete).toHaveBeenCalledTimes(1);
  });
});
