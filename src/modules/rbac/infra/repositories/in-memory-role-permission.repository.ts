import { Injectable } from '@nestjs/common';
import { RolePermission } from '@modules/rbac/domain/entities/role-permission.entity';
import { RolePermissionRepository } from '@modules/rbac/domain/repositories/role-permission.repository';

@Injectable()
export class InMemoryRolePermissionRepository implements RolePermissionRepository {
  private rolePermissions: RolePermission[] = [];

  async findByRoleId(roleId: string): Promise<RolePermission[]> {
    return this.rolePermissions.filter((rp) => rp.roleId === roleId);
  }

  async create(rolePermission: RolePermission): Promise<RolePermission> {
    this.rolePermissions.push(rolePermission);
    return rolePermission;
  }

  async delete(roleId: string, permissionId: string): Promise<void> {
    this.rolePermissions = this.rolePermissions.filter(
      (rp) => !(rp.roleId === roleId && rp.permissionId === permissionId),
    );
  }

  async deleteAllByRoleId(roleId: string): Promise<void> {
    this.rolePermissions = this.rolePermissions.filter(
      (rp) => rp.roleId !== roleId,
    );
  }

  clear(): void {
    this.rolePermissions = [];
  }
}
