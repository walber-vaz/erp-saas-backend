import { Inject, Injectable } from '@nestjs/common';
import { DomainException } from '@shared/exceptions/domain.exception';
import { OrganizationModuleRepository } from '@modules/module-management/domain/repositories/organization-module.repository';
import { ModuleRepository } from '@modules/module-management/domain/repositories/module.repository';
import { ModuleErrorMessages } from '@modules/module-management/domain/constants/error-messages';

@Injectable()
export class CheckModuleAccessUseCase {
  constructor(
    @Inject(OrganizationModuleRepository)
    private readonly organizationModuleRepository: OrganizationModuleRepository,
    @Inject(ModuleRepository)
    private readonly moduleRepository: ModuleRepository,
  ) {}

  async execute(organizationId: string, moduleCode: string): Promise<boolean> {
    const module = await this.moduleRepository.findByCode(
      moduleCode.toUpperCase(),
    );
    if (!module) {
      throw new DomainException(ModuleErrorMessages.NOT_FOUND);
    }

    const organizationModule =
      await this.organizationModuleRepository.findByOrganizationAndModule(
        organizationId,
        module.id,
      );

    return organizationModule?.isActive ?? false;
  }
}
