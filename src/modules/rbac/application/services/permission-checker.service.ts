import { Inject, Injectable } from '@nestjs/common';
import { UserRoleRepository } from '@modules/rbac/domain/repositories/user-role.repository';
import { RoleRepository } from '@modules/rbac/domain/repositories/role.repository';
import { RolePermissionRepository } from '@modules/rbac/domain/repositories/role-permission.repository';
import { PermissionRepository } from '@modules/rbac/domain/repositories/permission.repository';
import { Permission } from '@modules/rbac/domain/entities/permission.entity';
import { RoleInheritanceRepository } from '@modules/rbac/domain/repositories/role-inheritance.repository';

export type EffectivePermission = {
  permission: Permission;
  conditions: Record<string, any> | null;
};

@Injectable()
export class PermissionCheckerService {
  constructor(
    @Inject(UserRoleRepository)
    private readonly userRoleRepository: UserRoleRepository,
    @Inject(RoleRepository)
    private readonly roleRepository: RoleRepository,
    @Inject(RolePermissionRepository)
    private readonly rolePermissionRepository: RolePermissionRepository,
    @Inject(PermissionRepository)
    private readonly permissionRepository: PermissionRepository,
    @Inject(RoleInheritanceRepository)
    private readonly roleInheritanceRepository: RoleInheritanceRepository,
  ) {}

  async userHasPermission(
    userId: string,
    permissionCode: string,
    context?: any,
  ): Promise<boolean> {
    const userEffectivePermissions = await this.getUserPermissions(userId);

    for (const effectivePermission of userEffectivePermissions) {
      if (effectivePermission.permission.code === permissionCode) {
        if (this.evaluateCondition(effectivePermission.conditions, context)) {
          return true;
        }
      }
    }

    return false;
  }

  async getUserPermissions(userId: string): Promise<EffectivePermission[]> {
    const userRoles = await this.userRoleRepository.findByUserId(userId);
    const activeUserRoles = userRoles.filter(
      (userRole) => !userRole.isExpired(),
    );

    const effectiveRoleIds = new Set<string>();
    for (const userRole of activeUserRoles) {
      effectiveRoleIds.add(userRole.roleId);
      const inheritedRoleIds = await this.resolveRoleInheritance(
        userRole.roleId,
      );
      inheritedRoleIds.forEach((id) => effectiveRoleIds.add(id));
    }

    const allEffectivePermissions: EffectivePermission[] = [];
    for (const roleId of Array.from(effectiveRoleIds)) {
      const rolePermissions =
        await this.rolePermissionRepository.findByRoleId(roleId);
      for (const rolePermission of rolePermissions) {
        const permission = await this.permissionRepository.findById(
          rolePermission.permissionId,
        );
        if (permission) {
          allEffectivePermissions.push({
            permission,
            conditions: rolePermission.conditions,
          });
        }
      }
    }

    const uniqueEffectivePermissionsMap = new Map<
      string,
      EffectivePermission
    >();
    for (const item of allEffectivePermissions) {
      if (!uniqueEffectivePermissionsMap.has(item.permission.id)) {
        uniqueEffectivePermissionsMap.set(item.permission.id, item);
      }
    }
    const uniqueEffectivePermissions = Array.from(
      uniqueEffectivePermissionsMap.values(),
    );

    return uniqueEffectivePermissions;
  }

  async resolveRoleInheritance(roleId: string): Promise<string[]> {
    const inheritedRoleIds = new Set<string>();
    const rolesToProcess = [roleId];

    while (rolesToProcess.length > 0) {
      const currentRoleId = rolesToProcess.shift();
      if (currentRoleId && !inheritedRoleIds.has(currentRoleId)) {
        inheritedRoleIds.add(currentRoleId);
        const parentInheritances =
          await this.roleInheritanceRepository.findByChildId(currentRoleId);
        for (const inheritance of parentInheritances) {
          if (!inheritedRoleIds.has(inheritance.parentRoleId)) {
            rolesToProcess.push(inheritance.parentRoleId);
          }
        }
      }
    }
    inheritedRoleIds.delete(roleId);
    return Array.from(inheritedRoleIds);
  }

  private evaluateCondition(
    conditions: Record<string, any> | null,
    context: Record<string, any> | null,
  ): boolean {
    if (!conditions) {
      return true;
    }

    if (!context) {
      return false;
    }

    for (const key in conditions) {
      if (
        Object.prototype.hasOwnProperty.call(conditions, key) &&
        Object.prototype.hasOwnProperty.call(context, key)
      ) {
        if (conditions[key] !== context[key]) {
          return false;
        }
      } else {
        // If a condition exists for a key not present in context, it fails
        return false;
      }
    }

    return true; // All conditions met
  }
}
