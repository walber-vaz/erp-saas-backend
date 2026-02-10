import { Injectable } from '@nestjs/common';
import { Role } from '@modules/rbac/domain/entities/role.entity';
import { RoleRepository } from '@modules/rbac/domain/repositories/role.repository';

@Injectable()
export class InMemoryRoleRepository implements RoleRepository {
  private roles: Role[] = [];

  async findById(id: string): Promise<Role | null> {
    return this.roles.find((r) => r.id === id) || null;
  }

  async findByCode(
    organizationId: string | null,
    code: string,
  ): Promise<Role | null> {
    return (
      this.roles.find(
        (r) => r.organizationId === organizationId && r.code === code,
      ) || null
    );
  }

  async findByOrganization(organizationId: string | null): Promise<Role[]> {
    return this.roles.filter((r) => r.organizationId === organizationId);
  }

  async findAll(): Promise<Role[]> {
    return [...this.roles];
  }

  async create(role: Role): Promise<Role> {
    this.roles.push(role);
    return role;
  }

  async update(role: Role): Promise<Role> {
    const index = this.roles.findIndex((r) => r.id === role.id);
    if (index !== -1) {
      this.roles[index] = role;
    }
    return role;
  }

  async delete(id: string): Promise<void> {
    this.roles = this.roles.filter((r) => r.id !== id);
  }

  clear(): void {
    this.roles = [];
  }
}
