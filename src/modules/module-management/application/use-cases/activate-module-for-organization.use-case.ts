import { Inject, Injectable } from '@nestjs/common';
import { DomainException } from '@shared/exceptions/domain.exception';
import { ActivateModuleDto } from '../dtos/activate-module.dto';
import { OrganizationModule } from '@modules/module-management/domain/entities/organization-module.entity';
import { OrganizationModuleRepository } from '@modules/module-management/domain/repositories/organization-module.repository';
import { OrganizationModuleErrorMessages } from '@modules/module-management/domain/constants/error-messages';
import { ModuleRepository } from '@modules/module-management/domain/repositories/module.repository';
import { ModuleErrorMessages } from '@modules/module-management/domain/constants/error-messages';
import { OrganizationRepository } from '@modules/organization/domain/repositories/organization.repository';
import { OrganizationErrorMessages } from '@modules/organization/domain/constants/error-messages';

@Injectable()
export class ActivateModuleForOrganizationUseCase {
  constructor(
    @Inject(OrganizationModuleRepository)
    private readonly organizationModuleRepository: OrganizationModuleRepository,
    @Inject(ModuleRepository)
    private readonly moduleRepository: ModuleRepository,
    @Inject(OrganizationRepository)
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(dto: ActivateModuleDto): Promise<OrganizationModule> {
    const organization = await this.organizationRepository.findById(
      dto.organizationId,
    );
    if (!organization) {
      throw new DomainException(OrganizationErrorMessages.NOT_FOUND);
    }

    const module = await this.moduleRepository.findById(dto.moduleId);
    if (!module) {
      throw new DomainException(ModuleErrorMessages.NOT_FOUND);
    }
    if (!module.isActive) {
      throw new DomainException(
        OrganizationModuleErrorMessages.MODULE_NOT_ACTIVE_GLOBALLY,
      );
    }

    let organizationModule =
      await this.organizationModuleRepository.findByOrganizationAndModule(
        dto.organizationId,
        dto.moduleId,
      );

    if (organizationModule) {
      if (organizationModule.isActive) {
        return organizationModule;
      }
      organizationModule.activate();
      return this.organizationModuleRepository.update(organizationModule);
    }

    organizationModule = OrganizationModule.create({
      organizationId: dto.organizationId,
      moduleId: dto.moduleId,
      isActive: true,
      activatedAt: new Date(),
    });

    return this.organizationModuleRepository.create(organizationModule);
  }
}
