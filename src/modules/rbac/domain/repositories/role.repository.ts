import { Role } from '../entities/role.entity';

export abstract class RoleRepository {
  abstract findById(id: string): Promise<Role | null>;
  abstract findByCode(
    organizationId: string | null,
    code: string,
  ): Promise<Role | null>;
  abstract findByOrganization(organizationId: string | null): Promise<Role[]>;
  abstract findAll(): Promise<Role[]>;
  abstract create(role: Role): Promise<Role>;
  abstract update(role: Role): Promise<Role>;
  abstract delete(id: string): Promise<void>;
}
