import { Injectable } from '@nestjs/common';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { LoginDto } from '../dtos/login.dto';
import { RegisterUserUseCase } from '../use-cases/register-user.use-case';
import { LoginUseCase, LoginResult } from '../use-cases/login.use-case';
import {
  RefreshTokenUseCase,
  RefreshTokenResult,
} from '../use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../use-cases/logout.use-case';
import { RevokeAllTokensUseCase } from '../use-cases/revoke-all-tokens.use-case';
import { User } from '@modules/auth/domain/entities/user.entity';

@Injectable()
export class AuthFacade {
  constructor(
    private readonly registerUserUC: RegisterUserUseCase,
    private readonly loginUC: LoginUseCase,
    private readonly refreshTokenUC: RefreshTokenUseCase,
    private readonly logoutUC: LogoutUseCase,
    private readonly revokeAllTokensUC: RevokeAllTokensUseCase,
  ) {}

  async register(dto: RegisterUserDto): Promise<User> {
    return await this.registerUserUC.execute(dto);
  }

  async login(dto: LoginDto): Promise<LoginResult> {
    return await this.loginUC.execute(dto);
  }

  async refresh(token: string): Promise<RefreshTokenResult> {
    return await this.refreshTokenUC.execute(token);
  }

  async logout(token: string): Promise<void> {
    await this.logoutUC.execute(token);
  }

  async revokeAllTokens(userId: string): Promise<void> {
    await this.revokeAllTokensUC.execute(userId);
  }
}
