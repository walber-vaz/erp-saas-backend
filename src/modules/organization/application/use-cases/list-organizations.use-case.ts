import { Injectable } from '@nestjs/common';
import { Organization } from '../../domain/entities/organization.entity';
import {
  FindAllParams,
  FindAllResult,
  OrganizationRepository,
} from '../../domain/repositories/organization.repository';

@Injectable()
export class ListOrganizationsUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(params?: FindAllParams): Promise<FindAllResult> {
    return this.organizationRepository.findAll(params);
  }
}
