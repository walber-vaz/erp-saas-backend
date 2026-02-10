import type { Mocked } from 'vitest';
import { Role } from '@modules/rbac/domain/entities/role.entity';
import { RoleRepository } from '@modules/rbac/domain/repositories/role.repository';
import { ListRolesUseCase } from '../list-roles.use-case';

const ORG_ID = '550e8400-e29b-41d4-a716-446655440000';

const mockRoleRepository: Mocked<RoleRepository> = {
  findById: vi.fn(),
  findByCode: vi.fn(),
  findByOrganization: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

describe('ListRolesUseCase', () => {
  let useCase: ListRolesUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new ListRolesUseCase(mockRoleRepository);
  });

  it('deve delegar para findByOrganization', async () => {
    const roles = [
      Role.create({
        organizationId: ORG_ID,
        name: 'Admin',
        code: 'ADMIN',
      }),
    ];
    mockRoleRepository.findByOrganization.mockResolvedValue(roles);

    const result = await useCase.execute(ORG_ID);

    expect(result).toHaveLength(1);
    expect(mockRoleRepository.findByOrganization).toHaveBeenCalledWith(ORG_ID);
  });
});
