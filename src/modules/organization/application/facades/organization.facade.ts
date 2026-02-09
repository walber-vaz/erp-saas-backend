import { Injectable } from '@nestjs/common';
import { Organization } from '@modules/organization/domain/entities/organization.entity';
import {
  FindAllParams,
  FindAllResult,
} from '@modules/organization/domain/repositories/organization.repository';
import { CreateOrganizationDto } from '../dtos/create-organization.dto';
import { UpdateOrganizationDto } from '../dtos/update-organization.dto';
import { CreateOrganizationUseCase } from '../use-cases/create-organization.use-case';
import { UpdateOrganizationUseCase } from '../use-cases/update-organization.use-case';
import { FindOrganizationUseCase } from '../use-cases/find-organization.use-case';
import { ListOrganizationsUseCase } from '../use-cases/list-organizations.use-case';
import { DeactivateOrganizationUseCase } from '../use-cases/deactivate-organization.use-case';

@Injectable()
export class OrganizationFacade {
  constructor(
    private readonly createOrganizationUC: CreateOrganizationUseCase,
    private readonly updateOrganizationUC: UpdateOrganizationUseCase,
    private readonly findOrganizationUC: FindOrganizationUseCase,
    private readonly listOrganizationsUC: ListOrganizationsUseCase,
    private readonly deactivateOrganizationUC: DeactivateOrganizationUseCase,
  ) {}

  async create(dto: CreateOrganizationDto): Promise<Organization> {
    return await this.createOrganizationUC.execute(dto);
  }

  async findById(id: string): Promise<Organization> {
    return await this.findOrganizationUC.execute(id);
  }

  async list(params?: FindAllParams): Promise<FindAllResult> {
    return await this.listOrganizationsUC.execute(params);
  }

  async update(id: string, dto: UpdateOrganizationDto): Promise<Organization> {
    return await this.updateOrganizationUC.execute(id, dto);
  }

  async deactivate(id: string): Promise<void> {
    return await this.deactivateOrganizationUC.execute(id);
  }
}
