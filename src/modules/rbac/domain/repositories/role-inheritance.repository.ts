import { RoleInheritance } from '../entities/role-inheritance.entity';

export abstract class RoleInheritanceRepository {
  abstract findByParentId(parentRoleId: string): Promise<RoleInheritance[]>;
  abstract findByChildId(childRoleId: string): Promise<RoleInheritance[]>;
  abstract create(roleInheritance: RoleInheritance): Promise<RoleInheritance>;
  abstract delete(parentRoleId: string, childRoleId: string): Promise<void>;
}
