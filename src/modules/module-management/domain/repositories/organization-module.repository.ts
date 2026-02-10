import { OrganizationModule } from '../entities/organization-module.entity';

export abstract class OrganizationModuleRepository {
  abstract findById(id: string): Promise<OrganizationModule | null>;
  abstract findByOrganizationAndModule(
    organizationId: string,
    moduleId: string,
  ): Promise<OrganizationModule | null>;
  abstract findByOrganization(
    organizationId: string,
    params?: { isActive?: boolean },
  ): Promise<OrganizationModule[]>;
  abstract findByModule(moduleId: string): Promise<OrganizationModule[]>;
  abstract create(orgModule: OrganizationModule): Promise<OrganizationModule>;
  abstract update(orgModule: OrganizationModule): Promise<OrganizationModule>;
  abstract delete(id: string): Promise<void>;
}
