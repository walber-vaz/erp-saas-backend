import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AssignRolePermissionDto } from '../application/dtos/assign-role-permission.dto';
import { CreateRoleDto } from '../application/dtos/create-role.dto';
import { UpdateRoleDto } from '../application/dtos/update-role.dto';
import { RoleFacade } from '../application/facades/role.facade';
import { RequirePermission } from './decorators/require-permission.decorator';
import { CurrentUser } from '@modules/auth/presentation/decorators/current-user.decorator';
import { TokenPayload } from '@modules/auth/domain/interfaces/token-payload.interface';

@Controller('roles')
export class RoleController {
  constructor(private readonly roles: RoleFacade) {}

  @Post()
  @RequirePermission('RBAC_ROLE_CREATE')
  async create(
    @CurrentUser() user: TokenPayload,
    @Body() createRoleDto: CreateRoleDto,
  ) {
    if (!createRoleDto.organizationId) {
      createRoleDto.organizationId = user.organizationId;
    }
    return this.roles.create(createRoleDto);
  }

  @Get()
  @RequirePermission('RBAC_ROLE_READ')
  async findAll(@CurrentUser() user: TokenPayload) {
    return this.roles.list({ organizationId: user.organizationId });
  }

  @Get(':id')
  @RequirePermission('RBAC_ROLE_READ')
  async findOne(@Param('id') id: string) {
    return this.roles.findById(id);
  }

  @Patch(':id')
  @RequirePermission('RBAC_ROLE_UPDATE')
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.roles.update(id, updateRoleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission('RBAC_ROLE_DELETE')
  async remove(@Param('id') id: string) {
    await this.roles.delete(id);
  }

  @Post(':id/permissions')
  @RequirePermission('RBAC_ROLE_UPDATE')
  async assignPermission(
    @Param('id') roleId: string,
    @Body() assignRolePermissionDto: AssignRolePermissionDto,
  ) {
    return this.roles.assignPermission(roleId, assignRolePermissionDto);
  }

  @Delete(':id/permissions/:permissionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission('RBAC_ROLE_UPDATE')
  async removePermission(
    @Param('id') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    await this.roles.removePermission(roleId, permissionId);
  }

  @Get(':id/permissions')
  @RequirePermission('RBAC_ROLE_READ')
  async listPermissions(@Param('id') roleId: string) {
    return this.roles.listPermissions(roleId);
  }
}
