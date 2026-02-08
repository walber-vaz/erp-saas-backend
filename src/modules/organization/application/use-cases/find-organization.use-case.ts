import { Injectable } from '@nestjs/common';
import { DomainException } from '@shared/exceptions/domain.exception';
import { OrganizationErrorMessages } from '../../domain/constants/error-messages';
import { Organization } from '../../domain/entities/organization.entity';
import { OrganizationRepository } from '../../domain/repositories/organization.repository';

@Injectable()
export class FindOrganizationUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(id: string): Promise<Organization> {
    const organization = await this.organizationRepository.findById(id);
    if (!organization) {
      throw new DomainException(OrganizationErrorMessages.NOT_FOUND);
    }

    return organization;
  }
}
