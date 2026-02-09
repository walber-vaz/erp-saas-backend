import {
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  Body,
} from '@nestjs/common';
import { UpdateUserDto } from '@modules/auth/application/dtos/update-user.dto';
import { UserFacade } from '@modules/auth/application/facades/user.facade';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthenticatedUser } from '@modules/auth/infra/strategies/jwt.strategy';

@Controller('users')
export class UserController {
  constructor(private readonly users: UserFacade) {}

  @Get()
  async list(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return await this.users.list(currentUser.organizationId, {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const user = await this.users.findById(id);
    return user.toJSON();
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.users.update(id, dto);
    return user.toJSON();
  }

  @Delete(':id')
  async deactivate(@Param('id') id: string) {
    await this.users.deactivate(id);
  }
}
