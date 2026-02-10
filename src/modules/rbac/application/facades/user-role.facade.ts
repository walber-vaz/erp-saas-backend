import { Injectable } from '@nestjs/common';
import { AssignUserRoleDto } from '../dtos/assign-user-role.dto';
import { AssignRoleToUserUseCase } from '../use-cases/assign-role-to-user.use-case';
import { ListUserRolesUseCase } from '../use-cases/list-user-roles.use-case';
import { RemoveRoleFromUserUseCase } from '../use-cases/remove-role-from-user.use-case';

@Injectable()
export class UserRoleFacade {
  constructor(
    private readonly assignRoleToUserUseCase: AssignRoleToUserUseCase,
    private readonly removeRoleFromUserUseCase: RemoveRoleFromUserUseCase,
    private readonly listUserRolesUseCase: ListUserRolesUseCase,
  ) {}

  async assignRole(assignUserRoleDto: AssignUserRoleDto) {
    return this.assignRoleToUserUseCase.execute(assignUserRoleDto);
  }

  async removeRole(userId: string, roleId: string) {
    await this.removeRoleFromUserUseCase.execute(userId, roleId);
  }

  async listUserRoles(userId: string) {
    return this.listUserRolesUseCase.execute(userId);
  }
}
