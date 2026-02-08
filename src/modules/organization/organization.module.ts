import { Module } from '@nestjs/common';
import { CreateOrganizationUseCase } from './application/use-cases/create-organization.use-case';
import { DeactivateOrganizationUseCase } from './application/use-cases/deactivate-organization.use-case';
import { FindOrganizationUseCase } from './application/use-cases/find-organization.use-case';
import { ListOrganizationsUseCase } from './application/use-cases/list-organizations.use-case';
import { UpdateOrganizationUseCase } from './application/use-cases/update-organization.use-case';
import { OrganizationRepository } from './domain/repositories/organization.repository';
import { PrismaOrganizationRepository } from './infra/repositories/prisma-organization.repository';
import { OrganizationController } from './presentation/organization.controller';

@Module({
  controllers: [OrganizationController],
  providers: [
    CreateOrganizationUseCase,
    UpdateOrganizationUseCase,
    FindOrganizationUseCase,
    ListOrganizationsUseCase,
    DeactivateOrganizationUseCase,
    {
      provide: OrganizationRepository,
      useClass: PrismaOrganizationRepository,
    },
  ],
})
export class OrganizationModule {}
