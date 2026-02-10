import { Module } from '@nestjs/common';
import { ModuleController } from './presentation/module.controller';
import { OrganizationModuleController } from './presentation/organization-module.controller';
import { ModuleFacade } from './application/facades/module.facade';
import { OrganizationModuleFacade } from './application/facades/organization-module.facade';
import { CreateModuleUseCase } from './application/use-cases/create-module.use-case';
import { UpdateModuleUseCase } from './application/use-cases/update-module.use-case';
import { FindModuleUseCase } from './application/use-cases/find-module.use-case';
import { ListModulesUseCase } from './application/use-cases/list-modules.use-case';
import { ActivateModuleUseCase } from './application/use-cases/activate-module.use-case';
import { DeactivateModuleUseCase } from './application/use-cases/deactivate-module.use-case';
import { ActivateModuleForOrganizationUseCase } from './application/use-cases/activate-module-for-organization.use-case';
import { DeactivateModuleForOrganizationUseCase } from './application/use-cases/deactivate-module-for-organization.use-case';
import { ListOrganizationModulesUseCase } from './application/use-cases/list-organization-modules.use-case';
import { CheckModuleAccessUseCase } from './application/use-cases/check-module-access.use-case';
import { ModuleRepository } from './domain/repositories/module.repository';
import { OrganizationModuleRepository } from './domain/repositories/organization-module.repository';
import { PrismaModuleRepository } from './infra/repositories/prisma-module.repository';
import { PrismaOrganizationModuleRepository } from './infra/repositories/prisma-organization-module.repository';
import { OrganizationModule as OrmOrganizationModule } from '@modules/organization/organization.module';
import { RbacModule } from '@modules/rbac/rbac.module';

const useCases = [
  CreateModuleUseCase,
  UpdateModuleUseCase,
  FindModuleUseCase,
  ListModulesUseCase,
  ActivateModuleUseCase,
  DeactivateModuleUseCase,
  ActivateModuleForOrganizationUseCase,
  DeactivateModuleForOrganizationUseCase,
  ListOrganizationModulesUseCase,
  CheckModuleAccessUseCase,
];

const facades = [ModuleFacade, OrganizationModuleFacade];

const repositories = [
  {
    provide: ModuleRepository,
    useClass: PrismaModuleRepository,
  },
  {
    provide: OrganizationModuleRepository,
    useClass: PrismaOrganizationModuleRepository,
  },
];

@Module({
  imports: [OrmOrganizationModule, RbacModule],
  controllers: [ModuleController, OrganizationModuleController],
  providers: [...useCases, ...facades, ...repositories],
  exports: [CheckModuleAccessUseCase, ModuleRepository],
})
export class ModuleManagementModule {}
