import type { Mocked } from 'vitest';
import { DomainException } from '@shared/exceptions/domain.exception';
import { RoleInheritanceErrorMessages } from '@modules/rbac/domain/constants/error-messages';
import { Role } from '@modules/rbac/domain/entities/role.entity';
import { RoleInheritance } from '@modules/rbac/domain/entities/role-inheritance.entity';
import { RoleRepository } from '@modules/rbac/domain/repositories/role.repository';
import { RoleInheritanceRepository } from '@modules/rbac/domain/repositories/role-inheritance.repository';
import { CreateRoleInheritanceUseCase } from '../create-role-inheritance.use-case';

const ROLE_A = '550e8400-e29b-41d4-a716-446655440001';
const ROLE_B = '550e8400-e29b-41d4-a716-446655440002';
const ROLE_C = '550e8400-e29b-41d4-a716-446655440003';
const ORG_ID = '550e8400-e29b-41d4-a716-446655440000';

const mockRoleInheritanceRepository: Mocked<RoleInheritanceRepository> = {
  findByParentId: vi.fn(),
  findByChildId: vi.fn(),
  create: vi.fn(),
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

const makeRole = (id: string) =>
  Role.create({
    id,
    organizationId: ORG_ID,
    name: `Role ${id.slice(-1)}`,
    code: `ROLE_${id.slice(-1)}`,
  });

describe('CreateRoleInheritanceUseCase', () => {
  let useCase: CreateRoleInheritanceUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new CreateRoleInheritanceUseCase(
      mockRoleInheritanceRepository,
      mockRoleRepository,
    );
  });

  it('deve criar herança com sucesso', async () => {
    mockRoleRepository.findById.mockImplementation(async (id) => makeRole(id));
    mockRoleInheritanceRepository.findByChildId.mockResolvedValue([]);
    mockRoleInheritanceRepository.create.mockImplementation(async (ri) => ri);

    const result = await useCase.execute({
      parentRoleId: ROLE_A,
      childRoleId: ROLE_B,
    });

    expect(result).toBeInstanceOf(RoleInheritance);
    expect(result.parentRoleId).toBe(ROLE_A);
    expect(result.childRoleId).toBe(ROLE_B);
    expect(mockRoleInheritanceRepository.create).toHaveBeenCalledTimes(1);
  });

  it('deve lançar exceção quando role pai não encontrado', async () => {
    mockRoleRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ parentRoleId: ROLE_A, childRoleId: ROLE_B }),
    ).rejects.toThrow(
      new DomainException(RoleInheritanceErrorMessages.PARENT_ROLE_NOT_FOUND),
    );
  });

  it('deve lançar exceção quando role filho não encontrado', async () => {
    mockRoleRepository.findById.mockImplementation(async (id) =>
      id === ROLE_A ? makeRole(id) : null,
    );

    await expect(
      useCase.execute({ parentRoleId: ROLE_A, childRoleId: ROLE_B }),
    ).rejects.toThrow(
      new DomainException(RoleInheritanceErrorMessages.CHILD_ROLE_NOT_FOUND),
    );
  });

  it('deve lançar exceção para auto-herança', async () => {
    mockRoleRepository.findById.mockImplementation(async (id) => makeRole(id));

    await expect(
      useCase.execute({ parentRoleId: ROLE_A, childRoleId: ROLE_A }),
    ).rejects.toThrow(
      new DomainException(RoleInheritanceErrorMessages.CANNOT_INHERIT_SELF),
    );
  });

  it('deve detectar ciclo direto (A→B, B→A)', async () => {
    mockRoleRepository.findById.mockImplementation(async (id) => makeRole(id));

    // B already inherits from A (A is parent of B), so B's parents = [A]
    // Now trying to add A inherits from B (B is parent of A)
    // Cycle check: traverse ancestors of B (the parent) → B's parents = [A] → A's parents = []
    // We check if childRoleId (A) is reachable from parentRoleId (B)
    mockRoleInheritanceRepository.findByChildId.mockImplementation(
      async (childId) => {
        if (childId === ROLE_B) {
          return [
            RoleInheritance.create({
              parentRoleId: ROLE_A,
              childRoleId: ROLE_B,
            }),
          ];
        }
        return [];
      },
    );

    await expect(
      useCase.execute({ parentRoleId: ROLE_B, childRoleId: ROLE_A }),
    ).rejects.toThrow(
      new DomainException(RoleInheritanceErrorMessages.CYCLE_DETECTED),
    );
  });

  it('deve detectar ciclo indireto (A→B→C, C→A)', async () => {
    mockRoleRepository.findById.mockImplementation(async (id) => makeRole(id));

    // Existing: A is parent of B, B is parent of C
    // Trying: C is parent of A
    // Cycle check: traverse ancestors of C (parentRoleId) → C's parents = [B] → B's parents = [A]
    // A === childRoleId (A) → cycle!
    mockRoleInheritanceRepository.findByChildId.mockImplementation(
      async (childId) => {
        if (childId === ROLE_C) {
          return [
            RoleInheritance.create({
              parentRoleId: ROLE_B,
              childRoleId: ROLE_C,
            }),
          ];
        }
        if (childId === ROLE_B) {
          return [
            RoleInheritance.create({
              parentRoleId: ROLE_A,
              childRoleId: ROLE_B,
            }),
          ];
        }
        return [];
      },
    );

    await expect(
      useCase.execute({ parentRoleId: ROLE_C, childRoleId: ROLE_A }),
    ).rejects.toThrow(
      new DomainException(RoleInheritanceErrorMessages.CYCLE_DETECTED),
    );
  });
});
