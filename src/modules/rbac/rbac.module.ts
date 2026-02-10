import { Module } from '@nestjs/common';
import { AuthModule } from '@modules/auth/auth.module';
import { PermissionController } from './presentation/permission.controller';
import { RoleController } from './presentation/role.controller';
import { UserRoleController } from './presentation/user-role.controller';
import { AssignPermissionToRoleUseCase } from './application/use-cases/assign-permission-to-role.use-case';
import { AssignRoleToUserUseCase } from './application/use-cases/assign-role-to-user.use-case';
import { CreatePermissionUseCase } from './application/use-cases/create-permission.use-case';
import { CreateRoleInheritanceUseCase } from './application/use-cases/create-role-inheritance.use-case';
import { CreateRoleUseCase } from './application/use-cases/create-role.use-case';
import { DeletePermissionUseCase } from './application/use-cases/delete-permission.use-case';
import { DeleteRoleUseCase } from './application/use-cases/delete-role.use-case';
import { FindPermissionUseCase } from './application/use-cases/find-permission.use-case';
import { FindRoleUseCase } from './application/use-cases/find-role.use-case';
import { ListPermissionsUseCase } from './application/use-cases/list-permissions.use-case';
import { ListRoleInheritanceUseCase } from './application/use-cases/list-role-inheritance.use-case';
import { ListRolePermissionsUseCase } from './application/use-cases/list-role-permissions.use-case';
import { ListRolesUseCase } from './application/use-cases/list-roles.use-case';
import { ListUserRolesUseCase } from './application/use-cases/list-user-roles.use-case';
import { RemovePermissionFromRoleUseCase } from './application/use-cases/remove-permission-from-role.use-case';
import { RemoveRoleFromUserUseCase } from './application/use-cases/remove-role-from-user.use-case';
import { RemoveRoleInheritanceUseCase } from './application/use-cases/remove-role-inheritance.use-case';
import { UpdateRoleUseCase } from './application/use-cases/update-role.use-case';
import { PermissionCheckerService } from './application/services/permission-checker.service';
import { PermissionFacade } from './application/facades/permission.facade';
import { RoleFacade } from './application/facades/role.facade';
import { UserRoleFacade } from './application/facades/user-role.facade';
import { PermissionRepository } from './domain/repositories/permission.repository';
import { RoleInheritanceRepository } from './domain/repositories/role-inheritance.repository';
import { RolePermissionRepository } from './domain/repositories/role-permission.repository';
import { RoleRepository } from './domain/repositories/role.repository';
import { UserRoleRepository } from './domain/repositories/user-role.repository';
import { PrismaPermissionRepository } from './infra/repositories/prisma-permission.repository';
import { PrismaRoleInheritanceRepository } from './infra/repositories/prisma-role-inheritance.repository';
import { PrismaRolePermissionRepository } from './infra/repositories/prisma-role-permission.repository';
import { PrismaRoleRepository } from './infra/repositories/prisma-role.repository';
import { PrismaUserRoleRepository } from './infra/repositories/prisma-user-role.repository';
import { ModuleRepository } from '@modules/module-management/domain/repositories/module.repository';
import { PrismaModuleRepository } from '@modules/module-management/infra/repositories/prisma-module.repository';

const useCases = [
  AssignPermissionToRoleUseCase,
  AssignRoleToUserUseCase,
  CreatePermissionUseCase,
  CreateRoleInheritanceUseCase,
  CreateRoleUseCase,
  DeletePermissionUseCase,
  DeleteRoleUseCase,
  FindPermissionUseCase,
  FindRoleUseCase,
  ListPermissionsUseCase,
  ListRoleInheritanceUseCase,
  ListRolePermissionsUseCase,
  ListRolesUseCase,
  ListUserRolesUseCase,
  RemovePermissionFromRoleUseCase,
  RemoveRoleFromUserUseCase,
  RemoveRoleInheritanceUseCase,
  UpdateRoleUseCase,
];

const facades = [PermissionFacade, RoleFacade, UserRoleFacade];

const repositories = [
  {
    provide: PermissionRepository,
    useClass: PrismaPermissionRepository,
  },
  {
    provide: RoleRepository,
    useClass: PrismaRoleRepository,
  },
  {
    provide: RolePermissionRepository,
    useClass: PrismaRolePermissionRepository,
  },
  {
    provide: UserRoleRepository,
    useClass: PrismaUserRoleRepository,
  },
  {
    provide: RoleInheritanceRepository,
    useClass: PrismaRoleInheritanceRepository,
  },
  {
    provide: ModuleRepository,
    useClass: PrismaModuleRepository,
  },
];

@Module({
  imports: [AuthModule],
  controllers: [PermissionController, RoleController, UserRoleController],
  providers: [
    ...useCases,
    ...facades,
    ...repositories,
    PermissionCheckerService,
  ],
  exports: [PermissionCheckerService],
})
export class RbacModule {}
