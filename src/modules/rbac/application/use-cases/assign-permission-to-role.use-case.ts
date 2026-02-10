import { Inject, Injectable } from '@nestjs/common';
import { DomainException } from '@shared/exceptions/domain.exception';
import { RolePermission } from '@modules/rbac/domain/entities/role-permission.entity';
import { RolePermissionRepository } from '@modules/rbac/domain/repositories/role-permission.repository';
import { AssignRolePermissionDto } from '@modules/rbac/application/dtos/assign-role-permission.dto';
import {
  RoleErrorMessages,
  PermissionErrorMessages,
} from '@modules/rbac/domain/constants/error-messages';
import { RoleRepository } from '@modules/rbac/domain/repositories/role.repository';
import { PermissionRepository } from '@modules/rbac/domain/repositories/permission.repository';

@Injectable()
export class AssignPermissionToRoleUseCase {
  constructor(
    @Inject('RolePermissionRepository')
    private readonly rolePermissionRepository: RolePermissionRepository,
    @Inject('RoleRepository')
    private readonly roleRepository: RoleRepository,
    @Inject('PermissionRepository')
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async execute(dto: AssignRolePermissionDto): Promise<RolePermission> {
    const role = await this.roleRepository.findById(dto.roleId);
    if (!role) {
      throw new DomainException(RoleErrorMessages.NOT_FOUND);
    }

    const permission = await this.permissionRepository.findById(
      dto.permissionId,
    );
    if (!permission) {
      throw new DomainException(PermissionErrorMessages.NOT_FOUND);
    }

    const rolePermission = RolePermission.create({
      roleId: dto.roleId,
      permissionId: dto.permissionId,
      conditions: dto.conditions,
    });

    return this.rolePermissionRepository.create(rolePermission);
  }
}
