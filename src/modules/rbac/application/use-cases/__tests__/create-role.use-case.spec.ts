import type { Mocked } from 'vitest';
import { DomainException } from '@shared/exceptions/domain.exception';
import { RoleErrorMessages } from '@modules/rbac/domain/constants/error-messages';
import { Role } from '@modules/rbac/domain/entities/role.entity';
import { RoleRepository } from '@modules/rbac/domain/repositories/role.repository';
import { CreateRoleUseCase } from '../create-role.use-case';

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

describe('CreateRoleUseCase', () => {
  let useCase: CreateRoleUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new CreateRoleUseCase(mockRoleRepository);
  });

  it('deve criar role com organizationId', async () => {
    mockRoleRepository.findByCode.mockResolvedValue(null);
    mockRoleRepository.create.mockImplementation(async (r) => r);

    const result = await useCase.execute({
      organizationId: ORG_ID,
      name: 'Admin',
      code: 'ADMIN',
    });

    expect(result).toBeInstanceOf(Role);
    expect(result.organizationId).toBe(ORG_ID);
    expect(result.name).toBe('Admin');
    expect(result.code).toBe('ADMIN');
    expect(mockRoleRepository.findByCode).toHaveBeenCalledWith(ORG_ID, 'ADMIN');
    expect(mockRoleRepository.create).toHaveBeenCalledTimes(1);
  });

  it('deve criar role de sistema quando organizationId undefined', async () => {
    mockRoleRepository.findByCode.mockResolvedValue(null);
    mockRoleRepository.create.mockImplementation(async (r) => r);

    const result = await useCase.execute({
      name: 'Super Admin',
      code: 'SUPER_ADMIN',
    });

    expect(result).toBeInstanceOf(Role);
    expect(result.organizationId).toBeNull();
    expect(mockRoleRepository.findByCode).toHaveBeenCalledWith(
      null,
      'SUPER_ADMIN',
    );
  });

  it('deve lançar exceção quando code já em uso', async () => {
    mockRoleRepository.findByCode.mockResolvedValue(
      Role.create({
        organizationId: ORG_ID,
        name: 'Admin',
        code: 'ADMIN',
      }),
    );

    await expect(
      useCase.execute({
        organizationId: ORG_ID,
        name: 'Admin',
        code: 'ADMIN',
      }),
    ).rejects.toThrow(
      new DomainException(RoleErrorMessages.CODE_ALREADY_IN_USE),
    );

    expect(mockRoleRepository.create).not.toHaveBeenCalled();
  });
});
