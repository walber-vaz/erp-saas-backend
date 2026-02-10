import { Injectable } from '@nestjs/common';
import { Permission } from '@modules/rbac/domain/entities/permission.entity';
import { PermissionRepository } from '@modules/rbac/domain/repositories/permission.repository';

@Injectable()
export class InMemoryPermissionRepository implements PermissionRepository {
  private permissions: Permission[] = [];

  async findById(id: string): Promise<Permission | null> {
    return this.permissions.find((p) => p.id === id) || null;
  }

  async findByCode(code: string): Promise<Permission | null> {
    return this.permissions.find((p) => p.code === code) || null;
  }

  async findByModule(moduleId: string): Promise<Permission[]> {
    return this.permissions.filter((p) => p.moduleId === moduleId);
  }

  async findAll(): Promise<Permission[]> {
    return [...this.permissions];
  }

  async create(permission: Permission): Promise<Permission> {
    this.permissions.push(permission);
    return permission;
  }

  async delete(id: string): Promise<void> {
    this.permissions = this.permissions.filter((p) => p.id !== id);
  }

  clear(): void {
    this.permissions = [];
  }
}
