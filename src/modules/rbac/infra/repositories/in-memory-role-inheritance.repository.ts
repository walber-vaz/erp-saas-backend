import { Injectable } from '@nestjs/common';
import { RoleInheritance } from '@modules/rbac/domain/entities/role-inheritance.entity';
import { RoleInheritanceRepository } from '@modules/rbac/domain/repositories/role-inheritance.repository';

@Injectable()
export class InMemoryRoleInheritanceRepository implements RoleInheritanceRepository {
  private inheritances: RoleInheritance[] = [];

  async findByParentId(parentRoleId: string): Promise<RoleInheritance[]> {
    return this.inheritances.filter((ri) => ri.parentRoleId === parentRoleId);
  }

  async findByChildId(childRoleId: string): Promise<RoleInheritance[]> {
    return this.inheritances.filter((ri) => ri.childRoleId === childRoleId);
  }

  async create(roleInheritance: RoleInheritance): Promise<RoleInheritance> {
    this.inheritances.push(roleInheritance);
    return roleInheritance;
  }

  async delete(parentRoleId: string, childRoleId: string): Promise<void> {
    this.inheritances = this.inheritances.filter(
      (ri) =>
        !(ri.parentRoleId === parentRoleId && ri.childRoleId === childRoleId),
    );
  }

  clear(): void {
    this.inheritances = [];
  }
}
