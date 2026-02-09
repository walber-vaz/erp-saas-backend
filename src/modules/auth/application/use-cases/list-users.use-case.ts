import { Injectable } from '@nestjs/common';
import {
  FindByOrganizationParams,
  FindByOrganizationResult,
  UserRepository,
} from '@modules/auth/domain/repositories/user.repository';

@Injectable()
export class ListUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    organizationId: string,
    params?: FindByOrganizationParams,
  ): Promise<FindByOrganizationResult> {
    return this.userRepository.findByOrganization(organizationId, params);
  }
}
