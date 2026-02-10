import type { Mocked } from 'vitest';
import { DomainException } from '@shared/exceptions/domain.exception';
import { RoleErrorMessages } from '@modules/rbac/domain/constants/error-messages';
import { Role } from '@modules/rbac/domain/entities/role.entity';
import { RoleRepository } from '@modules/rbac/domain/repositories/role.repository';
import { FindRoleUseCase } from '../find-role.use-case';

const ORG_ID = '550e8400-e29b-41d4-a716-446655440000';
const ROLE_ID = '550e8400-e29b-41d4-a716-446655440001';

const mockRoleRepository: Mocked<RoleRepository> = {
  findById: vi.fn(),
  findByCode: vi.fn(),
  findByOrganization: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const makeRole = () =>
  Role.create({
    id: ROLE_ID,
    organizationId: ORG_ID,
    name: 'Admin',
    code: 'ADMIN',
  });

describe('FindRoleUseCase', () => {
  let useCase: FindRoleUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new FindRoleUseCase(mockRoleRepository);
  });

  it('deve retornar role quando encontrado', async () => {
    const role = makeRole();
    mockRoleRepository.findById.mockResolvedValue(role);

    const result = await useCase.execute(ROLE_ID);

    expect(result).toBeInstanceOf(Role);
    expect(result.id).toBe(ROLE_ID);
    expect(mockRoleRepository.findById).toHaveBeenCalledWith(ROLE_ID);
  });

  it('deve lançar exceção quando role não encontrado', async () => {
    mockRoleRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(ROLE_ID)).rejects.toThrow(
      new DomainException(RoleErrorMessages.NOT_FOUND),
    );
  });
});
