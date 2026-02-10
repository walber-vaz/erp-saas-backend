import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CreatePermissionDto } from '../application/dtos/create-permission.dto';
import { RequirePermission } from './decorators/require-permission.decorator';
import { PermissionFacade } from '../application/facades/permission.facade';

@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissions: PermissionFacade) {}

  @Post()
  @RequirePermission('RBAC_PERMISSION_CREATE')
  async create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissions.create(createPermissionDto);
  }

  @Get()
  @RequirePermission('RBAC_PERMISSION_READ')
  async findAll(@Query('moduleId') moduleId?: string) {
    return this.permissions.list({ moduleId });
  }

  @Get(':id')
  @RequirePermission('RBAC_PERMISSION_READ')
  async findOne(@Param('id') id: string) {
    return this.permissions.findById(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission('RBAC_PERMISSION_DELETE')
  async remove(@Param('id') id: string) {
    await this.permissions.delete(id);
  }
}
