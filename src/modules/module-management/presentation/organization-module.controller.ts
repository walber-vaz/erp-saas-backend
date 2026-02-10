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
import { RequirePermission } from '@modules/rbac/presentation/decorators/require-permission.decorator';
import { OrganizationModuleFacade } from '../application/facades/organization-module.facade';
import { ActivateModuleDto } from '../application/dtos/activate-module.dto';

@Controller('organizations/:organizationId/modules')
export class OrganizationModuleController {
  constructor(
    private readonly organizationModuleFacade: OrganizationModuleFacade,
  ) {}

  @Post(':moduleId/activate')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('MODULE_MANAGEMENT_ORGANIZATION_MODULE_ACTIVATE')
  async activateModuleForOrganization(@Body() dto: ActivateModuleDto) {
    return this.organizationModuleFacade.activate(dto);
  }

  @Delete(':id/deactivate')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission('MODULE_MANAGEMENT_ORGANIZATION_MODULE_DEACTIVATE')
  async deactivateModuleForOrganization(@Param('id') id: string) {
    await this.organizationModuleFacade.deactivate(id);
  }

  @Get()
  @RequirePermission('MODULE_MANAGEMENT_ORGANIZATION_MODULE_READ')
  async listOrganizationModules(
    @Param('organizationId') organizationId: string,
    @Query('isActive') isActive?: string,
  ) {
    return this.organizationModuleFacade.list(organizationId, {
      isActive: isActive ? isActive === 'true' : undefined,
    });
  }

  @Get(':moduleCode/check-access')
  @RequirePermission('MODULE_MANAGEMENT_ORGANIZATION_MODULE_READ')
  async checkModuleAccess(
    @Param('organizationId') organizationId: string,
    @Param('moduleCode') moduleCode: string,
  ) {
    return this.organizationModuleFacade.checkAccess(
      organizationId,
      moduleCode,
    );
  }
}
