import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { AssignUserRoleDto } from '../application/dtos/assign-user-role.dto';
import { UserRoleFacade } from '../application/facades/user-role.facade';
import { RequirePermission } from './decorators/require-permission.decorator';

@Controller('users/:userId/roles')
export class UserRoleController {
  constructor(private readonly userRoles: UserRoleFacade) {}

  @Post()
  @RequirePermission('RBAC_USER_ROLE_ASSIGN')
  async assignRole(
    @Param('userId') userId: string,
    @Body() assignUserRoleDto: AssignUserRoleDto,
  ) {
    return this.userRoles.assignRole({ ...assignUserRoleDto, userId });
  }

  @Delete(':roleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission('RBAC_USER_ROLE_REVOKE')
  async removeRole(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    await this.userRoles.removeRole(userId, roleId);
  }

  @Get()
  @RequirePermission('RBAC_USER_ROLE_READ')
  async listRoles(@Param('userId') userId: string) {
    return this.userRoles.listUserRoles(userId);
  }
}
