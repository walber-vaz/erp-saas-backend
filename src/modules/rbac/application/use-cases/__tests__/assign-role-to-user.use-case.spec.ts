import type { Mocked } from 'vitest';
import { DomainException } from '@shared/exceptions/domain.exception';
import { UserErrorMessages } from '@modules/auth/domain/constants/error-messages';
import {
  RoleErrorMessages,
  UserRoleErrorMessages,
} from '@modules/rbac/domain/constants/error-messages';
import { User } from '@modules/auth/domain/entities/user.entity';
import { Role } from '@modules/rbac/domain/entities/role.entity';
import { UserRole } from '@modules/rbac/domain/entities/user-role.entity';
import { UserRepository } from '@modules/auth/domain/repositories/user.repository';
import { RoleRepository } from '@modules/rbac/domain/repositories/role.repository';
import { UserRoleRepository } from '@modules/rbac/domain/repositories/user-role.repository';
import { AssignRoleToUserUseCase } from '../assign-role-to-user.use-case';

const ORG_ID = '550e8400-e29b-41d4-a716-446655440000';
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

const mockUserRepository: Mocked<UserRepository> = {
  findById: vi.fn(),
  findByEmail: vi.fn(),
  findByOrganization: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const mockRoleRepository: Mocked<RoleRepository> = {
  findById: vi.fn(),
  findByCode: vi.fn(),
  findByOrganization: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const makeUser = (overrides?: Partial<{ organizationId: string }>) =>
  User.create({
    id: USER_ID,
    organizationId: overrides?.organizationId ?? ORG_ID,
    name: 'João Silva',
    email: 'joao@empresa.com',
    passwordHash: 'hashed',
  });

const makeRole = (
  overrides?: Partial<{ organizationId: string | null; isSystem: boolean }>,
) =>
  Role.create({
    id: ROLE_ID,
    organizationId: overrides?.organizationId ?? ORG_ID,
    name: 'Admin',
    code: 'ADMIN',
    isSystem: overrides?.isSystem ?? false,
  });

describe('AssignRoleToUserUseCase', () => {
  let useCase: AssignRoleToUserUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new AssignRoleToUserUseCase(
      mockUserRoleRepository,
      mockUserRepository,
      mockRoleRepository,
    );
  });

  it('deve atribuir role ao usuário com sucesso', async () => {
    mockUserRepository.findById.mockResolvedValue(makeUser());
    mockRoleRepository.findById.mockResolvedValue(makeRole());
    mockUserRoleRepository.create.mockImplementation(async (ur) => ur);

    const result = await useCase.execute({
      userId: USER_ID,
      roleId: ROLE_ID,
      assignedBy: ASSIGNER_ID,
    });

    expect(result).toBeInstanceOf(UserRole);
    expect(result.userId).toBe(USER_ID);
    expect(result.roleId).toBe(ROLE_ID);
    expect(result.assignedBy).toBe(ASSIGNER_ID);
    expect(mockUserRoleRepository.create).toHaveBeenCalledTimes(1);
  });

  it('deve lançar exceção quando usuário não encontrado', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: USER_ID,
        roleId: ROLE_ID,
        assignedBy: ASSIGNER_ID,
      }),
    ).rejects.toThrow(new DomainException(UserErrorMessages.NOT_FOUND));

    expect(mockUserRoleRepository.create).not.toHaveBeenCalled();
  });

  it('deve lançar exceção quando role não encontrado', async () => {
    mockUserRepository.findById.mockResolvedValue(makeUser());
    mockRoleRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: USER_ID,
        roleId: ROLE_ID,
        assignedBy: ASSIGNER_ID,
      }),
    ).rejects.toThrow(new DomainException(RoleErrorMessages.NOT_FOUND));

    expect(mockUserRoleRepository.create).not.toHaveBeenCalled();
  });

  it('deve lançar exceção quando organização do usuário e role diferem', async () => {
    const OTHER_ORG = '550e8400-e29b-41d4-a716-446655440099';
    mockUserRepository.findById.mockResolvedValue(makeUser());
    mockRoleRepository.findById.mockResolvedValue(
      makeRole({ organizationId: OTHER_ORG }),
    );

    await expect(
      useCase.execute({
        userId: USER_ID,
        roleId: ROLE_ID,
        assignedBy: ASSIGNER_ID,
      }),
    ).rejects.toThrow(
      new DomainException(UserRoleErrorMessages.ORGANIZATION_MISMATCH),
    );

    expect(mockUserRoleRepository.create).not.toHaveBeenCalled();
  });

  it('deve permitir atribuição de role de sistema (organizationId null) a qualquer usuário', async () => {
    mockUserRepository.findById.mockResolvedValue(makeUser());
    mockRoleRepository.findById.mockResolvedValue(
      makeRole({ organizationId: null }),
    );
    mockUserRoleRepository.create.mockImplementation(async (ur) => ur);

    const result = await useCase.execute({
      userId: USER_ID,
      roleId: ROLE_ID,
      assignedBy: ASSIGNER_ID,
    });

    expect(result).toBeInstanceOf(UserRole);
    expect(mockUserRoleRepository.create).toHaveBeenCalledTimes(1);
  });
});
