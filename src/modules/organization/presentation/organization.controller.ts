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
import { OrganizationFacade } from '../application/facades/organization.facade';

@Controller('organizations')
export class OrganizationController {
  constructor(private readonly organizations: OrganizationFacade) {}

  @Post()
  async create(@Body() dto: CreateOrganizationDto) {
    return await this.organizations.create(dto);
  }

  @Get()
  async list(@Query('page') page?: string, @Query('limit') limit?: string) {
    return await this.organizations.list({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return await this.organizations.findById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateOrganizationDto) {
    return await this.organizations.update(id, dto);
  }

  @Delete(':id')
  async deactivate(@Param('id') id: string) {
    await this.organizations.deactivate(id);
  }
}
