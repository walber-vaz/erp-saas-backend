import { ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { DomainExceptionFilter } from '@shared/exceptions/domain-exception.filter';
import { AuthModule } from '@modules/auth/auth.module';
import { UserRepository } from '@modules/auth/domain/repositories/user.repository';
import { RefreshTokenRepository } from '@modules/auth/domain/repositories/refresh-token.repository';
import { HashService } from '@modules/auth/application/services/hash.service';
import { TokenService } from '@modules/auth/application/services/token.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InMemoryUserRepository } from '@modules/auth/infra/repositories/in-memory-user.repository';
import { InMemoryRefreshTokenRepository } from '@modules/auth/infra/repositories/in-memory-refresh-token.repository';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@modules/auth/presentation/guards/jwt-auth.guard';
import { JwtStrategy } from '@modules/auth/infra/strategies/jwt.strategy';

export async function createAuthApp(): Promise<{
  app: INestApplication;
  userRepository: InMemoryUserRepository;
  refreshTokenRepository: InMemoryRefreshTokenRepository;
  hashService: HashService;
  tokenService: TokenService;
  jwtService: JwtService;
}> {
  const userRepository = new InMemoryUserRepository();
  const refreshTokenRepository = new InMemoryRefreshTokenRepository();
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

  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [AuthModule],
    providers: [
      {
        provide: APP_GUARD,
        useClass: JwtAuthGuard,
      },
    ],
  })
    .overrideProvider(UserRepository)
    .useValue(userRepository)
    .overrideProvider(RefreshTokenRepository)
    .useValue(refreshTokenRepository)
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
    hashService,
    tokenService,
    jwtService,
  };
}
