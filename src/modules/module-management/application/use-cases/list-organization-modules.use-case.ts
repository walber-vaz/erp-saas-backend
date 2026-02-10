import { Inject, Injectable } from '@nestjs/common';
import { OrganizationModule } from '@modules/module-management/domain/entities/organization-module.entity';
import { OrganizationModuleRepository } from '@modules/module-management/domain/repositories/organization-module.repository';
import { ModuleRepository } from '@modules/module-management/domain/repositories/module.repository';
import { Module } from '@modules/module-management/domain/entities/module.entity';

export interface OrganizationModuleWithModule extends OrganizationModule {
  module: Module;
}

@Injectable()
export class ListOrganizationModulesUseCase {
  constructor(
    @Inject(OrganizationModuleRepository)
    private readonly organizationModuleRepository: OrganizationModuleRepository,
    @Inject(ModuleRepository)
    private readonly moduleRepository: ModuleRepository,
  ) {}

  async execute(
    organizationId: string,
    isActive?: boolean,
  ): Promise<OrganizationModuleWithModule[]> {
    const orgModules =
      await this.organizationModuleRepository.findByOrganization(
        organizationId,
        { isActive },
      );

    const modulePromises = orgModules.map(async (orgModule) => {
      const module = await this.moduleRepository.findById(orgModule.moduleId);
      return { ...orgModule, isActive: orgModule.isActive, module };
    });

    const orgModulesWithModule = await Promise.all(modulePromises);

    return orgModulesWithModule.filter(
      (om): om is OrganizationModuleWithModule => om.module !== null,
    );
  }
}
