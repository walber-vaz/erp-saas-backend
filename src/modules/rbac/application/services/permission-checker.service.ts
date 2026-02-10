import { Inject, Injectable } from '@nestjs/common';
import { UserRoleRepository } from '@modules/rbac/domain/repositories/user-role.repository';
import { RoleRepository } from '@modules/rbac/domain/repositories/role.repository';
import { RolePermissionRepository } from '@modules/rbac/domain/repositories/role-permission.repository';
import { PermissionRepository } from '@modules/rbac/domain/repositories/permission.repository';
import { Permission } from '@modules/rbac/domain/entities/permission.entity';
import { UserRole } from '@modules/rbac/domain/entities/user-role.entity';
import { RoleInheritanceRepository } from '@modules/rbac/domain/repositories/role-inheritance.repository';
import { Role } from '@modules/rbac/domain/entities/role.entity';

@Injectable()
export class PermissionCheckerService {
  constructor(
    @Inject('UserRoleRepository')
    private readonly userRoleRepository: UserRoleRepository,
    @Inject('RoleRepository')
    private readonly roleRepository: RoleRepository,
    @Inject('RolePermissionRepository')
    private readonly rolePermissionRepository: RolePermissionRepository,
    @Inject('PermissionRepository')
    private readonly permissionRepository: PermissionRepository,
    @Inject('RoleInheritanceRepository')
    private readonly roleInheritanceRepository: RoleInheritanceRepository,
  ) {}

  async userHasPermission(
    userId: string,
    permissionCode: string,
    context?: any,
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(userId);
    const hasPermission = userPermissions.some(
      (permission) => permission.code === permissionCode,
    );

    // TODO: Implement condition evaluation
    return hasPermission;
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
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

    const allPermissions: Permission[] = [];
    for (const roleId of Array.from(effectiveRoleIds)) {
      const rolePermissions =
        await this.rolePermissionRepository.findByRoleId(roleId);
      for (const rolePermission of rolePermissions) {
        const permission = await this.permissionRepository.findById(
          rolePermission.permissionId,
        );
        if (permission) {
          allPermissions.push(permission);
        }
      }
    }

    // Return unique permissions
    const uniquePermissions = Array.from(
      new Map(allPermissions.map((item) => [item.id, item])).values(),
    );

    return uniquePermissions;
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
    // Remove the initial roleId from the result, as it's not "inherited" by itself
    inheritedRoleIds.delete(roleId);
    return Array.from(inheritedRoleIds);
  }
}
