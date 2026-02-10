import { Permission } from '../entities/permission.entity';

export abstract class PermissionRepository {
  abstract findById(id: string): Promise<Permission | null>;
  abstract findByCode(code: string): Promise<Permission | null>;
  abstract findByModule(moduleId: string): Promise<Permission[]>;
  abstract findAll(): Promise<Permission[]>;
  abstract create(permission: Permission): Promise<Permission>;
  abstract delete(id: string): Promise<void>;
}
