import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DomainExceptionFilter } from '@shared/exceptions/domain-exception.filter';
import { RbacModule } from '@modules/rbac/rbac.module';
import { AuthModule } from '@modules/auth/auth.module';
import { UserRepository } from '@modules/auth/domain/repositories/user.repository';
import { RefreshTokenRepository } from '@modules/auth/domain/repositories/refresh-token.repository';
import { HashService } from '@modules/auth/application/services/hash.service';
import { TokenService } from '@modules/auth/application/services/token.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InMemoryUserRepository } from '@modules/auth/infra/repositories/in-memory-user.repository';
import { InMemoryRefreshTokenRepository } from '@modules/auth/infra/repositories/in-memory-refresh-token.repository';
import { InMemoryPermissionRepository } from '@modules/rbac/infra/repositories/in-memory-permission.repository';
import { InMemoryRoleRepository } from '@modules/rbac/infra/repositories/in-memory-role.repository';
import { InMemoryRolePermissionRepository } from '@modules/rbac/infra/repositories/in-memory-role-permission.repository';
import { InMemoryUserRoleRepository } from '@modules/rbac/infra/repositories/in-memory-user-role.repository';
import { InMemoryRoleInheritanceRepository } from '@modules/rbac/infra/repositories/in-memory-role-inheritance.repository';
import { PermissionRepository } from '@modules/rbac/domain/repositories/permission.repository';
import { RoleRepository } from '@modules/rbac/domain/repositories/role.repository';
import { RolePermissionRepository } from '@modules/rbac/domain/repositories/role-permission.repository';
import { UserRoleRepository } from '@modules/rbac/domain/repositories/user-role.repository';
import { RoleInheritanceRepository } from '@modules/rbac/domain/repositories/role-inheritance.repository';
import { ModuleRepository } from '@modules/module-management/domain/repositories/module.repository';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@modules/auth/presentation/guards/jwt-auth.guard';
import { PermissionGuard } from '@modules/rbac/presentation/guards/permission.guard';
import { JwtStrategy } from '@modules/auth/infra/strategies/jwt.strategy';
import { Module as ErpModule } from '@modules/module-management/domain/entities/module.entity';
import { User } from '@modules/auth/domain/entities/user.entity';
import { Permission } from '@modules/rbac/domain/entities/permission.entity';
import { Role } from '@modules/rbac/domain/entities/role.entity';
import { RolePermission } from '@modules/rbac/domain/entities/role-permission.entity';
import { UserRole } from '@modules/rbac/domain/entities/user-role.entity';

const TEST_MODULE_ID = '550e8400-e29b-41d4-a716-446655440099';
const TEST_MODULE_CODE = 'RBAC';
const ORG_ID = '550e8400-e29b-41d4-a716-446655440000';

export interface RbacTestContext {
  app: INestApplication;
  userRepository: InMemoryUserRepository;
  refreshTokenRepository: InMemoryRefreshTokenRepository;
  permissionRepository: InMemoryPermissionRepository;
  roleRepository: InMemoryRoleRepository;
  rolePermissionRepository: InMemoryRolePermissionRepository;
  userRoleRepository: InMemoryUserRoleRepository;
  roleInheritanceRepository: InMemoryRoleInheritanceRepository;
  hashService: HashService;
  tokenService: TokenService;
  jwtService: JwtService;
}

class InMemoryModuleRepository {
  private modules: ErpModule[] = [
    ErpModule.create({
      id: TEST_MODULE_ID,
      code: TEST_MODULE_CODE,
      name: 'RBAC Module',
    }),
  ];

  async findById(id: string): Promise<ErpModule | null> {
    return this.modules.find((m) => m.id === id) || null;
  }
}

export async function createRbacApp(): Promise<RbacTestContext> {
  const userRepository = new InMemoryUserRepository();
  const refreshTokenRepository = new InMemoryRefreshTokenRepository();
  const permissionRepository = new InMemoryPermissionRepository();
  const roleRepository = new InMemoryRoleRepository();
  const rolePermissionRepository = new InMemoryRolePermissionRepository();
  const userRoleRepository = new InMemoryUserRoleRepository();
  const roleInheritanceRepository = new InMemoryRoleInheritanceRepository();

  const mockConfigService = {
    get: vi.fn((key: string, defaultValue?: any) => {
      if (key === 'JWT_SECRET') return 'test-secret-key';
      if (key === 'JWT_EXPIRES_IN') return '15m';
      return defaultValue;
    }),
    getOrThrow: vi.fn((key: string) => {
      if (key === 'JWT_SECRET') return 'test-secret-key';
      throw new Error(`Missing config for ${key}`);
    }),
  };

  const moduleRepository = new InMemoryModuleRepository();

  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [RbacModule, AuthModule],
    providers: [
      {
        provide: APP_GUARD,
        useClass: JwtAuthGuard,
      },
      {
        provide: APP_GUARD,
        useClass: PermissionGuard,
      },
    ],
  })
    .overrideProvider(UserRepository)
    .useValue(userRepository)
    .overrideProvider(RefreshTokenRepository)
    .useValue(refreshTokenRepository)
    .overrideProvider(PermissionRepository)
    .useValue(permissionRepository)
    .overrideProvider(RoleRepository)
    .useValue(roleRepository)
    .overrideProvider(RolePermissionRepository)
    .useValue(rolePermissionRepository)
    .overrideProvider(UserRoleRepository)
    .useValue(userRoleRepository)
    .overrideProvider(RoleInheritanceRepository)
    .useValue(roleInheritanceRepository)
    .overrideProvider(ModuleRepository)
    .useValue(moduleRepository)
    .overrideProvider(ConfigService)
    .useValue(mockConfigService)
    .overrideProvider(JwtStrategy)
    .useValue(new JwtStrategy(mockConfigService as unknown as ConfigService))
    .compile();

  const hashService = moduleRef.get(HashService);
  const jwtService = moduleRef.get(JwtService);
  const tokenService = moduleRef.get(TokenService);

  const app = moduleRef.createNestApplication();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new DomainExceptionFilter());

  await app.init();

  return {
    app,
    userRepository,
    refreshTokenRepository,
    permissionRepository,
    roleRepository,
    rolePermissionRepository,
    userRoleRepository,
    roleInheritanceRepository,
    hashService,
    tokenService,
    jwtService,
  };
}

/**
 * Creates an authenticated user with all RBAC permissions needed for testing.
 * Returns the accessToken to use in requests.
 */
export async function setupAuthenticatedUser(
  ctx: RbacTestContext,
  permissions: string[],
): Promise<{ accessToken: string; userId: string }> {
  const passwordHash = await ctx.hashService.hash('TestPassword123!');
  const user = User.create({
    organizationId: ORG_ID,
    name: 'Test Admin',
    email: `admin-${Date.now()}@test.com`,
    passwordHash,
  });
  await ctx.userRepository.create(user);

  const role = Role.create({
    organizationId: ORG_ID,
    name: 'Test Admin Role',
    code: `ADMIN_${Date.now()}`,
  });
  await ctx.roleRepository.create(role);

  for (const permCode of permissions) {
    let perm = await ctx.permissionRepository.findByCode(permCode);
    if (!perm) {
      perm = Permission.create({
        moduleId: TEST_MODULE_ID,
        code: permCode,
        resource: permCode.split('_').slice(1, -1).join('_'),
        action: permCode.split('_').pop()!,
      });
      await ctx.permissionRepository.create(perm);
    }

    const rp = RolePermission.create({
      roleId: role.id,
      permissionId: perm.id,
    });
    await ctx.rolePermissionRepository.create(rp);
  }

  const userRole = UserRole.create({
    userId: user.id,
    roleId: role.id,
    assignedBy: user.id,
  });
  await ctx.userRoleRepository.create(userRole);

  const payload = { sub: user.id, organizationId: ORG_ID };
  const accessToken = ctx.jwtService.sign(payload);

  return { accessToken, userId: user.id };
}

export { ORG_ID, TEST_MODULE_ID, TEST_MODULE_CODE };
