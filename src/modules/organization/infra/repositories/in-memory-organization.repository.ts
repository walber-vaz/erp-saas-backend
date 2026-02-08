import { Organization } from '../../domain/entities/organization.entity';
import {
  FindAllParams,
  FindAllResult,
  OrganizationRepository,
} from '../../domain/repositories/organization.repository';

export class InMemoryOrganizationRepository extends OrganizationRepository {
  private organizations: Organization[] = [];

  async findById(id: string): Promise<Organization | null> {
    return this.organizations.find((org) => org.id === id) ?? null;
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    return this.organizations.find((org) => org.slug === slug) ?? null;
  }

  async findByDocument(document: string): Promise<Organization | null> {
    return this.organizations.find((org) => org.document === document) ?? null;
  }

  async findAll(params?: FindAllParams): Promise<FindAllResult> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const start = (page - 1) * limit;

    return {
      data: this.organizations.slice(start, start + limit),
      total: this.organizations.length,
    };
  }

  async create(organization: Organization): Promise<Organization> {
    this.organizations.push(organization);
    return organization;
  }

  async update(organization: Organization): Promise<Organization> {
    const index = this.organizations.findIndex((org) => org.id === organization.id);
    if (index >= 0) {
      this.organizations[index] = organization;
    }
    return organization;
  }

  async delete(id: string): Promise<void> {
    this.organizations = this.organizations.filter((org) => org.id !== id);
  }

  clear(): void {
    this.organizations = [];
  }
}
