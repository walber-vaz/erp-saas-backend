import { UserRole } from '../entities/user-role.entity';

export abstract class UserRoleRepository {
  abstract findByUserId(userId: string): Promise<UserRole[]>;
  abstract findByRoleId(roleId: string): Promise<UserRole[]>;
  abstract create(userRole: UserRole): Promise<UserRole>;
  abstract delete(userId: string, roleId: string): Promise<void>;
  abstract deleteAllByUserId(userId: string): Promise<void>;
}
