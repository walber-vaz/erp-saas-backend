import { Injectable } from '@nestjs/common';
import { ActivateModuleDto } from '../dtos/activate-module.dto';
import { ActivateModuleForOrganizationUseCase } from '../use-cases/activate-module-for-organization.use-case';
import { DeactivateModuleForOrganizationUseCase } from '../use-cases/deactivate-module-for-organization.use-case';
import { ListOrganizationModulesUseCase } from '../use-cases/list-organization-modules.use-case';
import {
  OrganizationModule,
  OrganizationModuleWithModule,
} from '../../domain/entities/organization-module.entity';
import { CheckModuleAccessUseCase } from '../use-cases/check-module-access.use-case';

@Injectable()
export class OrganizationModuleFacade {
  constructor(
    private readonly activateModuleForOrganizationUC: ActivateModuleForOrganizationUseCase,
    private readonly deactivateModuleForOrganizationUC: DeactivateModuleForOrganizationUseCase,
    private readonly listOrganizationModulesUC: ListOrganizationModulesUseCase,
    private readonly checkModuleAccessUC: CheckModuleAccessUseCase,
  ) {}

  async activate(dto: ActivateModuleDto): Promise<OrganizationModule> {
    return await this.activateModuleForOrganizationUC.execute(dto);
  }

  async deactivate(id: string): Promise<void> {
    return await this.deactivateModuleForOrganizationUC.execute(id);
  }

  async list(
    organizationId: string,
    params?: { isActive?: boolean },
  ): Promise<OrganizationModuleWithModule[]> {
    return await this.listOrganizationModulesUC.execute(
      organizationId,
      params?.isActive,
    );
  }

  async checkAccess(organizationId: string, moduleCode: string): Promise<boolean> {
    return await this.checkModuleAccessUC.execute(organizationId, moduleCode);
  }
}
