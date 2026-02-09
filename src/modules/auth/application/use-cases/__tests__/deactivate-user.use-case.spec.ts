import type { Mocked } from 'vitest';
import { DomainException } from '@shared/exceptions/domain.exception';
import { UserErrorMessages } from '@modules/auth/domain/constants/error-messages';
import { User } from '@modules/auth/domain/entities/user.entity';
import { UserRepository } from '@modules/auth/domain/repositories/user.repository';
import { RefreshTokenRepository } from '@modules/auth/domain/repositories/refresh-token.repository';
import { DeactivateUserUseCase } from '../deactivate-user.use-case';

const ORG_ID = '550e8400-e29b-41d4-a716-446655440000';

const mockUserRepository: Mocked<UserRepository> = {
  findById: vi.fn(),
  findByEmail: vi.fn(),
  findByOrganization: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const mockRefreshTokenRepository: Mocked<RefreshTokenRepository> = {
  findById: vi.fn(),
  findByToken: vi.fn(),
  findByFamily: vi.fn(),
  findByUserId: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  revokeAllByFamily: vi.fn(),
  revokeAllByUserId: vi.fn(),
  deleteExpired: vi.fn(),
};

function createUser() {
  return User.create({
    organizationId: ORG_ID,
    name: 'João Silva',
    email: 'joao@empresa.com',
    passwordHash: 'hash',
  });
}

describe('DeactivateUserUseCase', () => {
  let useCase: DeactivateUserUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new DeactivateUserUseCase(
      mockUserRepository,
      mockRefreshTokenRepository,
    );
  });

  it('deve desativar o usuário com sucesso', async () => {
    const user = createUser();
    mockUserRepository.findById.mockResolvedValue(user);
    mockUserRepository.update.mockImplementation(async (u) => u);
    mockRefreshTokenRepository.revokeAllByUserId.mockResolvedValue(undefined);

    await useCase.execute(user.id);

    expect(user.isActive).toBe(false);
    expect(mockUserRepository.update).toHaveBeenCalledWith(user);
  });

  it('deve revogar todos os tokens ao desativar', async () => {
    const user = createUser();
    mockUserRepository.findById.mockResolvedValue(user);
    mockUserRepository.update.mockImplementation(async (u) => u);
    mockRefreshTokenRepository.revokeAllByUserId.mockResolvedValue(undefined);

    await useCase.execute(user.id);

    expect(mockRefreshTokenRepository.revokeAllByUserId).toHaveBeenCalledWith(
      user.id,
    );
  });

  it('deve lançar exceção quando usuário não encontrado', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('id-inexistente')).rejects.toThrow(
      new DomainException(UserErrorMessages.NOT_FOUND),
    );
  });

  it('deve lançar exceção quando usuário já está inativo', async () => {
    const user = User.create({
      organizationId: ORG_ID,
      name: 'João',
      email: 'joao@empresa.com',
      passwordHash: 'hash',
      isActive: false,
    });
    mockUserRepository.findById.mockResolvedValue(user);

    await expect(useCase.execute(user.id)).rejects.toThrow(
      new DomainException(UserErrorMessages.ALREADY_INACTIVE),
    );

    expect(mockUserRepository.update).not.toHaveBeenCalled();
  });
});
