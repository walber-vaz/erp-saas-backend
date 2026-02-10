import { Inject, Injectable } from '@nestjs/common';
import { DomainException } from '@shared/exceptions/domain.exception';
import { OrganizationModuleRepository } from '@modules/module-management/domain/repositories/organization-module.repository';
import { OrganizationModuleErrorMessages } from '@modules/module-management/domain/constants/error-messages';

@Injectable()
export class DeactivateModuleForOrganizationUseCase {
  constructor(
    @Inject(OrganizationModuleRepository)
    private readonly organizationModuleRepository: OrganizationModuleRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const organizationModule =
      await this.organizationModuleRepository.findById(id);
    if (!organizationModule) {
      throw new DomainException(OrganizationModuleErrorMessages.NOT_FOUND);
    }

    if (!organizationModule.isActive) {
      return;
    }

    organizationModule.deactivate();

    await this.organizationModuleRepository.update(organizationModule);
  }
}
