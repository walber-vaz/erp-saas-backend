import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
import { RegisterUserDto } from '@modules/auth/application/dtos/register-user.dto';
import { LoginDto } from '@modules/auth/application/dtos/login.dto';
import { RefreshTokenDto } from '@modules/auth/application/dtos/refresh-token.dto';
import { UpdateUserDto } from '@modules/auth/application/dtos/update-user.dto';
import { ChangePasswordDto } from '@modules/auth/application/dtos/change-password.dto';
import { AuthFacade } from '@modules/auth/application/facades/auth.facade';
import { UserFacade } from '@modules/auth/application/facades/user.facade';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthenticatedUser } from '@modules/auth/infra/strategies/jwt.strategy';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthFacade,
    private readonly users: UserFacade,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    const user = await this.auth.register(dto);
    return user.toJSON();
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async doLogin(@Body() dto: LoginDto) {
    return await this.auth.login(dto);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async doRefresh(@Body() dto: RefreshTokenDto) {
    return await this.auth.refresh(dto.refreshToken);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async doLogout(@Body() dto: RefreshTokenDto) {
    await this.auth.logout(dto.refreshToken);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout-all')
  async doLogoutAll(@CurrentUser() user: AuthenticatedUser) {
    await this.auth.revokeAllTokens(user.userId);
  }

  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser) {
    const found = await this.users.findById(user.userId);
    return found.toJSON();
  }

  @Patch('me')
  async updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateUserDto,
  ) {
    const updated = await this.users.update(user.userId, dto);
    return updated.toJSON();
  }

  @Patch('me/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePassword(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.users.changePassword(
      user.userId,
      dto.currentPassword,
      dto.newPassword,
    );
  }
}
