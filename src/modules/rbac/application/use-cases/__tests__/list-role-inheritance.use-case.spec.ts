import type { Mocked } from 'vitest';
import { RoleInheritance } from '@modules/rbac/domain/entities/role-inheritance.entity';
import { RoleInheritanceRepository } from '@modules/rbac/domain/repositories/role-inheritance.repository';
import { ListRoleInheritanceUseCase } from '../list-role-inheritance.use-case';

const ROLE_ID = '550e8400-e29b-41d4-a716-446655440001';
const PARENT_ID = '550e8400-e29b-41d4-a716-446655440002';
const CHILD_ID = '550e8400-e29b-41d4-a716-446655440003';

const mockRoleInheritanceRepository: Mocked<RoleInheritanceRepository> = {
  findByParentId: vi.fn(),
  findByChildId: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
};

describe('ListRoleInheritanceUseCase', () => {
  let useCase: ListRoleInheritanceUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new ListRoleInheritanceUseCase(mockRoleInheritanceRepository);
  });

  it('deve retornar pais e filhos do role', async () => {
    const parentInheritance = RoleInheritance.create({
      parentRoleId: PARENT_ID,
      childRoleId: ROLE_ID,
    });
    const childInheritance = RoleInheritance.create({
      parentRoleId: ROLE_ID,
      childRoleId: CHILD_ID,
    });

    mockRoleInheritanceRepository.findByChildId.mockResolvedValue([
      parentInheritance,
    ]);
    mockRoleInheritanceRepository.findByParentId.mockResolvedValue([
      childInheritance,
    ]);

    const result = await useCase.execute(ROLE_ID);

    expect(result.parents).toHaveLength(1);
    expect(result.parents[0].parentRoleId).toBe(PARENT_ID);
    expect(result.children).toHaveLength(1);
    expect(result.children[0].childRoleId).toBe(CHILD_ID);
  });

  it('deve retornar listas vazias quando não há herança', async () => {
    mockRoleInheritanceRepository.findByChildId.mockResolvedValue([]);
    mockRoleInheritanceRepository.findByParentId.mockResolvedValue([]);

    const result = await useCase.execute(ROLE_ID);

    expect(result.parents).toHaveLength(0);
    expect(result.children).toHaveLength(0);
  });
});
