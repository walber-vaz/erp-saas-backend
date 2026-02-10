import type { Mocked } from 'vitest';
import { UserRoleRepository } from '@modules/rbac/domain/repositories/user-role.repository';
import { RoleRepository } from '@modules/rbac/domain/repositories/role.repository';
import { RolePermissionRepository } from '@modules/rbac/domain/repositories/role-permission.repository';
import { PermissionRepository } from '@modules/rbac/domain/repositories/permission.repository';
import { RoleInheritanceRepository } from '@modules/rbac/domain/repositories/role-inheritance.repository';
import { UserRole } from '@modules/rbac/domain/entities/user-role.entity';
import { RolePermission } from '@modules/rbac/domain/entities/role-permission.entity';
import { Permission } from '@modules/rbac/domain/entities/permission.entity';
import { RoleInheritance } from '@modules/rbac/domain/entities/role-inheritance.entity';
import { PermissionCheckerService } from '../permission-checker.service';

const USER_ID = '550e8400-e29b-41d4-a716-446655440001';
const ROLE_A = '550e8400-e29b-41d4-a716-446655440010';
const ROLE_B = '550e8400-e29b-41d4-a716-446655440011';
const ROLE_C = '550e8400-e29b-41d4-a716-446655440012';
const ROLE_D = '550e8400-e29b-41d4-a716-446655440013';
const PERM_ID_1 = '550e8400-e29b-41d4-a716-446655440020';
const PERM_ID_2 = '550e8400-e29b-41d4-a716-446655440021';
const MODULE_ID = '550e8400-e29b-41d4-a716-446655440030';
const ASSIGNER_ID = '550e8400-e29b-41d4-a716-446655440040';

const mockUserRoleRepository: Mocked<UserRoleRepository> = {
  findByUserId: vi.fn(),
  findByRoleId: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
  deleteAllByUserId: vi.fn(),
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

const mockRolePermissionRepository: Mocked<RolePermissionRepository> = {
  findByRoleId: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
  deleteAllByRoleId: vi.fn(),
};

const mockPermissionRepository: Mocked<PermissionRepository> = {
  findById: vi.fn(),
  findByCode: vi.fn(),
  findByModule: vi.fn(),
  findAll: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
};

const mockRoleInheritanceRepository: Mocked<RoleInheritanceRepository> = {
  findByParentId: vi.fn(),
  findByChildId: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
};

const makeUserRole = (roleId: string, expired = false) =>
  UserRole.create({
    userId: USER_ID,
    roleId,
    assignedBy: ASSIGNER_ID,
    expiresAt: expired ? new Date(Date.now() - 86400000) : null,
  });

const makeRolePermission = (roleId: string, permissionId: string) =>
  RolePermission.create({ roleId, permissionId });

const makePermission = (id: string, code: string) =>
  Permission.create({
    id,
    moduleId: MODULE_ID,
    code,
    resource: 'invoice',
    action: 'create',
  });

const makeInheritance = (parentRoleId: string, childRoleId: string) =>
  RoleInheritance.create({ parentRoleId, childRoleId });

describe('PermissionCheckerService', () => {
  let service: PermissionCheckerService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new PermissionCheckerService(
      mockUserRoleRepository,
      mockRoleRepository,
      mockRolePermissionRepository,
      mockPermissionRepository,
      mockRoleInheritanceRepository,
    );
  });

  describe('resolveRoleInheritance', () => {
    it('deve retornar array vazio quando role não tem pais', async () => {
      mockRoleInheritanceRepository.findByChildId.mockResolvedValue([]);

      const result = await service.resolveRoleInheritance(ROLE_A);

      expect(result).toEqual([]);
    });

    it('deve retornar IDs dos roles pai (nível único)', async () => {
      mockRoleInheritanceRepository.findByChildId
        .mockResolvedValueOnce([makeInheritance(ROLE_B, ROLE_A)])
        .mockResolvedValueOnce([]);

      const result = await service.resolveRoleInheritance(ROLE_A);

      expect(result).toContain(ROLE_B);
      expect(result).toHaveLength(1);
    });

    it('deve retornar ancestrais recursivamente (A→B→C)', async () => {
      mockRoleInheritanceRepository.findByChildId
        .mockResolvedValueOnce([makeInheritance(ROLE_B, ROLE_C)])
        .mockResolvedValueOnce([makeInheritance(ROLE_A, ROLE_B)])
        .mockResolvedValueOnce([]);

      const result = await service.resolveRoleInheritance(ROLE_C);

      expect(result).toContain(ROLE_B);
      expect(result).toContain(ROLE_A);
      expect(result).toHaveLength(2);
    });

    it('deve lidar com herança diamante sem duplicatas', async () => {
      mockRoleInheritanceRepository.findByChildId
        .mockResolvedValueOnce([
          makeInheritance(ROLE_B, ROLE_D),
          makeInheritance(ROLE_C, ROLE_D),
        ])
        .mockResolvedValueOnce([makeInheritance(ROLE_A, ROLE_B)])
        .mockResolvedValueOnce([makeInheritance(ROLE_A, ROLE_C)])
        .mockResolvedValue([]);

      const result = await service.resolveRoleInheritance(ROLE_D);

      expect(result).toContain(ROLE_B);
      expect(result).toContain(ROLE_C);
      expect(result).toContain(ROLE_A);
      const unique = new Set(result);
      expect(unique.size).toBe(result.length);
    });
  });

  describe('getUserPermissions', () => {
    it('deve retornar permissões dos roles diretos do usuário', async () => {
      const userRole = makeUserRole(ROLE_A);
      const rolePerm = makeRolePermission(ROLE_A, PERM_ID_1);
      const permission = makePermission(PERM_ID_1, 'FINANCE_INVOICE_CREATE');

      mockUserRoleRepository.findByUserId.mockResolvedValue([userRole]);
      mockRoleInheritanceRepository.findByChildId.mockResolvedValue([]);
      mockRolePermissionRepository.findByRoleId.mockResolvedValue([rolePerm]);
      mockPermissionRepository.findById.mockResolvedValue(permission);

      const result = await service.getUserPermissions(USER_ID);

      expect(result).toHaveLength(1);
      expect(result[0].permission.code).toBe('FINANCE_INVOICE_CREATE');
    });

    it('deve filtrar roles expirados do usuário', async () => {
      const activeRole = makeUserRole(ROLE_A, false);
      const expiredRole = makeUserRole(ROLE_B, true);

      mockUserRoleRepository.findByUserId.mockResolvedValue([
        activeRole,
        expiredRole,
      ]);
      mockRoleInheritanceRepository.findByChildId.mockResolvedValue([]);
      mockRolePermissionRepository.findByRoleId.mockResolvedValue([
        makeRolePermission(ROLE_A, PERM_ID_1),
      ]);
      mockPermissionRepository.findById.mockResolvedValue(
        makePermission(PERM_ID_1, 'FINANCE_INVOICE_CREATE'),
      );

      const result = await service.getUserPermissions(USER_ID);

      expect(result).toHaveLength(1);
      expect(mockRolePermissionRepository.findByRoleId).toHaveBeenCalledTimes(
        1,
      );
    });

    it('deve incluir permissões de roles herdados', async () => {
      const userRole = makeUserRole(ROLE_B);
      const permDirect = makePermission(PERM_ID_1, 'FINANCE_INVOICE_CREATE');
      const permInherited = makePermission(PERM_ID_2, 'FINANCE_INVOICE_READ');

      mockUserRoleRepository.findByUserId.mockResolvedValue([userRole]);
      mockRoleInheritanceRepository.findByChildId
        .mockResolvedValueOnce([makeInheritance(ROLE_A, ROLE_B)])
        .mockResolvedValue([]);
      mockRolePermissionRepository.findByRoleId
        .mockResolvedValueOnce([makeRolePermission(ROLE_B, PERM_ID_1)])
        .mockResolvedValueOnce([makeRolePermission(ROLE_A, PERM_ID_2)]);
      mockPermissionRepository.findById
        .mockResolvedValueOnce(permDirect)
        .mockResolvedValueOnce(permInherited);

      const result = await service.getUserPermissions(USER_ID);

      expect(result).toHaveLength(2);
      const codes = result.map((p) => p.permission.code);
      expect(codes).toContain('FINANCE_INVOICE_CREATE');
      expect(codes).toContain('FINANCE_INVOICE_READ');
    });

    it('deve retornar permissões únicas (sem duplicatas)', async () => {
      const userRoleA = makeUserRole(ROLE_A);
      const userRoleB = makeUserRole(ROLE_B);
      const permission = makePermission(PERM_ID_1, 'FINANCE_INVOICE_CREATE');

      mockUserRoleRepository.findByUserId.mockResolvedValue([
        userRoleA,
        userRoleB,
      ]);
      mockRoleInheritanceRepository.findByChildId.mockResolvedValue([]);
      mockRolePermissionRepository.findByRoleId.mockResolvedValue([
        makeRolePermission(ROLE_A, PERM_ID_1),
      ]);
      mockPermissionRepository.findById.mockResolvedValue(permission);

      const result = await service.getUserPermissions(USER_ID);

      expect(result).toHaveLength(1);
      expect(result[0].permission.code).toBe('FINANCE_INVOICE_CREATE');
    });

    it('deve retornar array vazio quando usuário não tem roles', async () => {
      mockUserRoleRepository.findByUserId.mockResolvedValue([]);

      const result = await service.getUserPermissions(USER_ID);

      expect(result).toEqual([]);
    });
  });

  describe('userHasPermission', () => {
    it('deve retornar true quando usuário tem a permissão', async () => {
      const userRole = makeUserRole(ROLE_A);
      const permission = makePermission(PERM_ID_1, 'FINANCE_INVOICE_CREATE');

      mockUserRoleRepository.findByUserId.mockResolvedValue([userRole]);
      mockRoleInheritanceRepository.findByChildId.mockResolvedValue([]);
      mockRolePermissionRepository.findByRoleId.mockResolvedValue([
        makeRolePermission(ROLE_A, PERM_ID_1),
      ]);
      mockPermissionRepository.findById.mockResolvedValue(permission);

      const result = await service.userHasPermission(
        USER_ID,
        'FINANCE_INVOICE_CREATE',
      );

      expect(result).toBe(true);
    });

    it('deve retornar false quando usuário não tem a permissão', async () => {
      const userRole = makeUserRole(ROLE_A);
      const permission = makePermission(PERM_ID_1, 'FINANCE_INVOICE_CREATE');

      mockUserRoleRepository.findByUserId.mockResolvedValue([userRole]);
      mockRoleInheritanceRepository.findByChildId.mockResolvedValue([]);
      mockRolePermissionRepository.findByRoleId.mockResolvedValue([
        makeRolePermission(ROLE_A, PERM_ID_1),
      ]);
      mockPermissionRepository.findById.mockResolvedValue(permission);

      const result = await service.userHasPermission(
        USER_ID,
        'FINANCE_INVOICE_DELETE',
      );

      expect(result).toBe(false);
    });

    it('deve retornar true quando permissão vem via role herdado', async () => {
      const userRole = makeUserRole(ROLE_B);
      const permission = makePermission(PERM_ID_1, 'FINANCE_INVOICE_CREATE');

      mockUserRoleRepository.findByUserId.mockResolvedValue([userRole]);
      mockRoleInheritanceRepository.findByChildId
        .mockResolvedValueOnce([makeInheritance(ROLE_A, ROLE_B)])
        .mockResolvedValue([]);
      mockRolePermissionRepository.findByRoleId
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([makeRolePermission(ROLE_A, PERM_ID_1)]);
      mockPermissionRepository.findById.mockResolvedValue(permission);

      const result = await service.userHasPermission(
        USER_ID,
        'FINANCE_INVOICE_CREATE',
      );

      expect(result).toBe(true);
    });
  });
});
