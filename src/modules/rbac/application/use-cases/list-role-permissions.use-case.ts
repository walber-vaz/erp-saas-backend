import { Inject, Injectable } from '@nestjs/common';
import { RolePermission } from '@modules/rbac/domain/entities/role-permission.entity';
import { RolePermissionRepository } from '@modules/rbac/domain/repositories/role-permission.repository';

@Injectable()
export class ListRolePermissionsUseCase {
  constructor(
    @Inject(RolePermissionRepository)
    private readonly rolePermissionRepository: RolePermissionRepository,
  ) {}

  async execute(roleId: string): Promise<RolePermission[]> {
    return this.rolePermissionRepository.findByRoleId(roleId);
  }
}
