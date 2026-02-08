import { Injectable } from '@nestjs/common';
import { DomainException } from '@shared/exceptions/domain.exception';
import { OrganizationErrorMessages } from '../../domain/constants/error-messages';
import { OrganizationRepository } from '../../domain/repositories/organization.repository';

@Injectable()
export class DeactivateOrganizationUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const organization = await this.organizationRepository.findById(id);
    if (!organization) {
      throw new DomainException(OrganizationErrorMessages.NOT_FOUND);
    }

    organization.deactivate();

    await this.organizationRepository.update(organization);
  }
}
