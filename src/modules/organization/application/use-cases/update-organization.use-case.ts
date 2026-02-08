import { Injectable } from '@nestjs/common';
import { DomainException } from '@shared/exceptions/domain.exception';
import { OrganizationErrorMessages } from '../../domain/constants/error-messages';
import { Organization } from '../../domain/entities/organization.entity';
import { OrganizationRepository } from '../../domain/repositories/organization.repository';
import { UpdateOrganizationDto } from '../dtos/update-organization.dto';

@Injectable()
export class UpdateOrganizationUseCase {
  constructor(private readonly organizationRepository: OrganizationRepository) {}

  async execute(id: string, dto: UpdateOrganizationDto): Promise<Organization> {
    const organization = await this.organizationRepository.findById(id);
    if (!organization) {
      throw new DomainException(OrganizationErrorMessages.NOT_FOUND);
    }

    if (dto.slug && dto.slug !== organization.slug) {
      const existingSlug = await this.organizationRepository.findBySlug(dto.slug);
      if (existingSlug) {
        throw new DomainException(OrganizationErrorMessages.SLUG_TAKEN);
      }
    }

    if (dto.document && dto.document !== organization.document) {
      const existingDocument = await this.organizationRepository.findByDocument(dto.document);
      if (existingDocument) {
        throw new DomainException(OrganizationErrorMessages.DOCUMENT_TAKEN);
      }
    }

    organization.update(dto);

    return this.organizationRepository.update(organization);
  }
}
