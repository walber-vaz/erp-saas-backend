import { User } from '../entities/user.entity';

export interface FindByOrganizationParams {
  page: number;
  limit: number;
}

export interface FindByOrganizationResult {
  data: User[];
  total: number;
}

export abstract class UserRepository {
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(
    organizationId: string,
    email: string,
  ): Promise<User | null>;
  abstract findByOrganization(
    organizationId: string,
    params?: FindByOrganizationParams,
  ): Promise<FindByOrganizationResult>;
  abstract create(user: User): Promise<User>;
  abstract update(user: User): Promise<User>;
  abstract delete(id: string): Promise<void>;
}
