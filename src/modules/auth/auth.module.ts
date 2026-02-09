import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { RevokeAllTokensUseCase } from './application/use-cases/revoke-all-tokens.use-case';
import { FindUserUseCase } from './application/use-cases/find-user.use-case';
import { ListUsersUseCase } from './application/use-cases/list-users.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { ChangePasswordUseCase } from './application/use-cases/change-password.use-case';
import { DeactivateUserUseCase } from './application/use-cases/deactivate-user.use-case';
import { HashService } from './application/services/hash.service';
import { TokenService } from './application/services/token.service';
import { UserRepository } from './domain/repositories/user.repository';
import { PrismaUserRepository } from './infra/repositories/prisma-user.repository';
import { RefreshTokenRepository } from './domain/repositories/refresh-token.repository';
import { PrismaRefreshTokenRepository } from './infra/repositories/prisma-refresh-token.repository';
import { AuthController } from './presentation/auth.controller';
import { UserController } from './presentation/user.controller';
import { JwtStrategy } from './infra/strategies/jwt.strategy';
import { AuthFacade } from './application/facades/auth.facade';
import { UserFacade } from './application/facades/user.facade';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const expiresIn = configService.get<string | number>(
          'JWT_EXPIRES_IN',
          '15m',
        );
        return {
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: expiresIn as StringValue,
          },
        };
      },
      inject: [ConfigService],
    }),
    PassportModule,
  ],
  providers: [
    RegisterUserUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    RevokeAllTokensUseCase,
    FindUserUseCase,
    ListUsersUseCase,
    UpdateUserUseCase,
    ChangePasswordUseCase,
    DeactivateUserUseCase,
    HashService,
    TokenService,
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
    {
      provide: RefreshTokenRepository,
      useClass: PrismaRefreshTokenRepository,
    },
    JwtStrategy,
    AuthFacade,
    UserFacade,
  ],
  controllers: [AuthController, UserController],
  exports: [HashService, TokenService, UserRepository, RefreshTokenRepository],
})
export class AuthModule {}
