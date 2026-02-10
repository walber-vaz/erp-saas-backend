import { Inject, Injectable } from '@nestjs/common';
import { RolePermissionRepository } from '@modules/rbac/domain/repositories/role-permission.repository';

@Injectable()
export class RemovePermissionFromRoleUseCase {
  constructor(
    @Inject('RolePermissionRepository')
    private readonly rolePermissionRepository: RolePermissionRepository,
  ) {}

  async execute(roleId: string, permissionId: string): Promise<void> {
    await this.rolePermissionRepository.delete(roleId, permissionId);
  }
}
