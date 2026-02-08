import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateOrganizationDto } from '../application/dtos/create-organization.dto';
import { UpdateOrganizationDto } from '../application/dtos/update-organization.dto';
import { CreateOrganizationUseCase } from '../application/use-cases/create-organization.use-case';
import { DeactivateOrganizationUseCase } from '../application/use-cases/deactivate-organization.use-case';
import { FindOrganizationUseCase } from '../application/use-cases/find-organization.use-case';
import { ListOrganizationsUseCase } from '../application/use-cases/list-organizations.use-case';
import { UpdateOrganizationUseCase } from '../application/use-cases/update-organization.use-case';

@Controller('organizations')
export class OrganizationController {
  constructor(
    private readonly createOrganization: CreateOrganizationUseCase,
    private readonly updateOrganization: UpdateOrganizationUseCase,
    private readonly findOrganization: FindOrganizationUseCase,
    private readonly listOrganizations: ListOrganizationsUseCase,
    private readonly deactivateOrganization: DeactivateOrganizationUseCase,
  ) {}

  @Post()
  create(@Body() dto: CreateOrganizationDto) {
    return this.createOrganization.execute(dto);
  }

  @Get()
  list(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.listOrganizations.execute({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.findOrganization.execute(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    return this.updateOrganization.execute(id, dto);
  }

  @Delete(':id')
  deactivate(@Param('id') id: string) {
    return this.deactivateOrganization.execute(id);
  }
}
