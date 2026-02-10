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
import { CreateModuleDto } from '../application/dtos/create-module.dto';
import { UpdateModuleDto } from '../application/dtos/update-module.dto';
import { RequirePermission } from '@modules/rbac/presentation/decorators/require-permission.decorator';
import { ModuleFacade } from '../application/facades/module.facade';

@Controller('modules')
export class ModuleController {
  constructor(private readonly moduleFacade: ModuleFacade) {}

  @Post()
  @RequirePermission('MODULE_MANAGEMENT_MODULE_CREATE')
  async create(@Body() createModuleDto: CreateModuleDto) {
    return this.moduleFacade.create(createModuleDto);
  }

  @Get()
  @RequirePermission('MODULE_MANAGEMENT_MODULE_READ')
  async findAll(@Query('isActive') isActive?: string) {
    return this.moduleFacade.list({
      isActive: isActive ? isActive === 'true' : undefined,
    });
  }

  @Get(':id')
  @RequirePermission('MODULE_MANAGEMENT_MODULE_READ')
  async findOne(@Param('id') id: string) {
    return this.moduleFacade.findById(id);
  }

  @Patch(':id')
  @RequirePermission('MODULE_MANAGEMENT_MODULE_UPDATE')
  async update(
    @Param('id') id: string,
    @Body() updateModuleDto: UpdateModuleDto,
  ) {
    return this.moduleFacade.update(id, updateModuleDto);
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('MODULE_MANAGEMENT_MODULE_ACTIVATE')
  async activate(@Param('id') id: string) {
    return this.moduleFacade.activate(id);
  }

  @Post(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @RequirePermission('MODULE_MANAGEMENT_MODULE_DEACTIVATE')
  async deactivate(@Param('id') id: string) {
    return this.moduleFacade.deactivate(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission('MODULE_MANAGEMENT_MODULE_DELETE')
  async remove(@Param('id') id: string) {
    await this.moduleFacade.delete(id);
  }
}
