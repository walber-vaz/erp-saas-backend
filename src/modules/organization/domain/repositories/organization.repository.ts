import { Organization } from '../entities/organization.entity';

export interface FindAllParams {
  page: number;
  limit: number;
}

export interface FindAllResult {
  data: Organization[];
  total: number;
}

export abstract class OrganizationRepository {
  abstract findById(id: string): Promise<Organization | null>;
  abstract findBySlug(slug: string): Promise<Organization | null>;
  abstract findByDocument(document: string): Promise<Organization | null>;
  abstract findAll(params?: FindAllParams): Promise<FindAllResult>;
  abstract create(organization: Organization): Promise<Organization>;
  abstract update(organization: Organization): Promise<Organization>;
  abstract delete(id: string): Promise<void>;
}
