import { RolePermission } from '../entities/role-permission.entity';

export abstract class RolePermissionRepository {
  abstract findByRoleId(roleId: string): Promise<RolePermission[]>;
  abstract create(rolePermission: RolePermission): Promise<RolePermission>;
  abstract delete(roleId: string, permissionId: string): Promise<void>;
  abstract deleteAllByRoleId(roleId: string): Promise<void>;
}
