import { Injectable } from '@nestjs/common';
import { DomainException } from '@shared/exceptions/domain.exception';
import { OrganizationErrorMessages } from '../../domain/constants/error-messages';
import { Organization } from '../../domain/entities/organization.entity';
import { OrganizationRepository } from '../../domain/repositories/organization.repository';
import { CreateOrganizationDto } from '../dtos/create-organization.dto';

@Injectable()
export class CreateOrganizationUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(dto: CreateOrganizationDto): Promise<Organization> {
    const existingSlug = await this.organizationRepository.findBySlug(dto.slug);
    if (existingSlug) {
      throw new DomainException(OrganizationErrorMessages.SLUG_TAKEN);
    }

    if (dto.document) {
      const existingDocument = await this.organizationRepository.findByDocument(
        dto.document,
      );
      if (existingDocument) {
        throw new DomainException(OrganizationErrorMessages.DOCUMENT_TAKEN);
      }
    }

    const organization = Organization.create({
      name: dto.name,
      slug: dto.slug,
      document: dto.document,
    });

    return this.organizationRepository.create(organization);
  }
}
