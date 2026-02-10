import { Injectable } from '@nestjs/common';
import { UserRole } from '@modules/rbac/domain/entities/user-role.entity';
import { UserRoleRepository } from '@modules/rbac/domain/repositories/user-role.repository';

@Injectable()
export class InMemoryUserRoleRepository implements UserRoleRepository {
  private userRoles: UserRole[] = [];

  async findByUserId(userId: string): Promise<UserRole[]> {
    return this.userRoles.filter((ur) => ur.userId === userId);
  }

  async findByRoleId(roleId: string): Promise<UserRole[]> {
    return this.userRoles.filter((ur) => ur.roleId === roleId);
  }

  async create(userRole: UserRole): Promise<UserRole> {
    this.userRoles.push(userRole);
    return userRole;
  }

  async delete(userId: string, roleId: string): Promise<void> {
    this.userRoles = this.userRoles.filter(
      (ur) => !(ur.userId === userId && ur.roleId === roleId),
    );
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    this.userRoles = this.userRoles.filter((ur) => ur.userId !== userId);
  }

  clear(): void {
    this.userRoles = [];
  }
}
