import { Injectable } from '@nestjs/common';
import { AssignRolePermissionDto } from '../dtos/assign-role-permission.dto';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { UpdateRoleDto } from '../dtos/update-role.dto';
import { AssignPermissionToRoleUseCase } from '../use-cases/assign-permission-to-role.use-case';
import { CreateRoleUseCase } from '../use-cases/create-role.use-case';
import { DeleteRoleUseCase } from '../use-cases/delete-role.use-case';
import { FindRoleUseCase } from '../use-cases/find-role.use-case';
import { ListRolePermissionsUseCase } from '../use-cases/list-role-permissions.use-case';
import { ListRolesUseCase } from '../use-cases/list-roles.use-case';
import { RemovePermissionFromRoleUseCase } from '../use-cases/remove-permission-from-role.use-case';
import { UpdateRoleUseCase } from '../use-cases/update-role.use-case';

@Injectable()
export class RoleFacade {
  constructor(
    private readonly createRoleUseCase: CreateRoleUseCase,
    private readonly findRoleUseCase: FindRoleUseCase,
    private readonly listRolesUseCase: ListRolesUseCase,
    private readonly updateRoleUseCase: UpdateRoleUseCase,
    private readonly deleteRoleUseCase: DeleteRoleUseCase,
    private readonly assignPermissionToRoleUseCase: AssignPermissionToRoleUseCase,
    private readonly removePermissionFromRoleUseCase: RemovePermissionFromRoleUseCase,
    private readonly listRolePermissionsUseCase: ListRolePermissionsUseCase,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    return this.createRoleUseCase.execute(createRoleDto);
  }

  async findById(id: string) {
    return this.findRoleUseCase.execute(id);
  }

  async list(filters: { organizationId?: string }) {
    return this.listRolesUseCase.execute(filters.organizationId ?? null);
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    return this.updateRoleUseCase.execute(id, updateRoleDto);
  }

  async delete(id: string) {
    await this.deleteRoleUseCase.execute(id);
  }

  async assignPermission(
    roleId: string,
    assignRolePermissionDto: AssignRolePermissionDto,
  ) {
    return this.assignPermissionToRoleUseCase.execute({
      ...assignRolePermissionDto,
      roleId,
    });
  }

  async removePermission(roleId: string, permissionId: string) {
    await this.removePermissionFromRoleUseCase.execute(roleId, permissionId);
  }

  async listPermissions(roleId: string) {
    return this.listRolePermissionsUseCase.execute(roleId);
  }
}
