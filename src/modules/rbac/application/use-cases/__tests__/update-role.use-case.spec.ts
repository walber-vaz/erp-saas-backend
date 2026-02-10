import type { Mocked } from 'vitest';
import { DomainException } from '@shared/exceptions/domain.exception';
import { RoleErrorMessages } from '@modules/rbac/domain/constants/error-messages';
import { Role } from '@modules/rbac/domain/entities/role.entity';
import { RoleRepository } from '@modules/rbac/domain/repositories/role.repository';
import { UpdateRoleUseCase } from '../update-role.use-case';

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

const makeRole = (overrides?: Partial<{ isSystem: boolean }>) =>
  Role.create({
    id: ROLE_ID,
    organizationId: ORG_ID,
    name: 'Admin',
    code: 'ADMIN',
    isSystem: overrides?.isSystem ?? false,
  });

describe('UpdateRoleUseCase', () => {
  let useCase: UpdateRoleUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new UpdateRoleUseCase(mockRoleRepository);
  });

  it('deve atualizar name e description com sucesso', async () => {
    const role = makeRole();
    mockRoleRepository.findById.mockResolvedValue(role);
    mockRoleRepository.update.mockImplementation(async (r) => r);

    const result = await useCase.execute(ROLE_ID, {
      name: 'Manager',
      description: 'Gerente do sistema',
    });

    expect(result).toBeInstanceOf(Role);
    expect(result.name).toBe('Manager');
    expect(result.description).toBe('Gerente do sistema');
    expect(mockRoleRepository.update).toHaveBeenCalledTimes(1);
  });

  it('deve lançar exceção quando role não encontrado', async () => {
    mockRoleRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(ROLE_ID, { name: 'Manager' })).rejects.toThrow(
      new DomainException(RoleErrorMessages.NOT_FOUND),
    );

    expect(mockRoleRepository.update).not.toHaveBeenCalled();
  });

  it('deve lançar exceção quando role é de sistema', async () => {
    mockRoleRepository.findById.mockResolvedValue(makeRole({ isSystem: true }));

    await expect(useCase.execute(ROLE_ID, { name: 'Manager' })).rejects.toThrow(
      new DomainException(RoleErrorMessages.IS_SYSTEM_IMMUTABLE),
    );

    expect(mockRoleRepository.update).not.toHaveBeenCalled();
  });
});
