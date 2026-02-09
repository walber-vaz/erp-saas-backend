import type { Mocked } from 'vitest';
import { DomainException } from '@shared/exceptions/domain.exception';
import {
  AuthErrorMessages,
  UserErrorMessages,
} from '@modules/auth/domain/constants/error-messages';
import { User } from '@modules/auth/domain/entities/user.entity';
import { UserRepository } from '@modules/auth/domain/repositories/user.repository';
import { RefreshTokenRepository } from '@modules/auth/domain/repositories/refresh-token.repository';
import { HashService } from '@modules/auth/application/services/hash.service';
import { ChangePasswordUseCase } from '../change-password.use-case';

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

const mockHashService: Mocked<HashService> = {
  hash: vi.fn(),
  compare: vi.fn(),
} as any;

function createUser() {
  return User.create({
    organizationId: ORG_ID,
    name: 'João Silva',
    email: 'joao@empresa.com',
    passwordHash: '$2b$10$oldhash',
  });
}

describe('ChangePasswordUseCase', () => {
  let useCase: ChangePasswordUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new ChangePasswordUseCase(
      mockUserRepository,
      mockRefreshTokenRepository,
      mockHashService,
    );
  });

  it('deve alterar a senha com sucesso', async () => {
    const user = createUser();
    mockUserRepository.findById.mockResolvedValue(user);
    mockHashService.compare.mockResolvedValue(true);
    mockHashService.hash.mockResolvedValue('$2b$10$newhash');
    mockUserRepository.update.mockImplementation(async (u) => u);
    mockRefreshTokenRepository.revokeAllByUserId.mockResolvedValue(undefined);

    await useCase.execute(user.id, 'senhaAtual', 'novaSenha123');

    expect(user.passwordHash).toBe('$2b$10$newhash');
    expect(mockHashService.compare).toHaveBeenCalledWith(
      'senhaAtual',
      '$2b$10$oldhash',
    );
    expect(mockHashService.hash).toHaveBeenCalledWith('novaSenha123');
    expect(mockUserRepository.update).toHaveBeenCalledTimes(1);
  });

  it('deve revogar todos os tokens após alterar senha', async () => {
    const user = createUser();
    mockUserRepository.findById.mockResolvedValue(user);
    mockHashService.compare.mockResolvedValue(true);
    mockHashService.hash.mockResolvedValue('$2b$10$newhash');
    mockUserRepository.update.mockImplementation(async (u) => u);
    mockRefreshTokenRepository.revokeAllByUserId.mockResolvedValue(undefined);

    await useCase.execute(user.id, 'senhaAtual', 'novaSenha123');

    expect(mockRefreshTokenRepository.revokeAllByUserId).toHaveBeenCalledWith(
      user.id,
    );
  });

  it('deve lançar exceção quando senha atual é incorreta', async () => {
    const user = createUser();
    mockUserRepository.findById.mockResolvedValue(user);
    mockHashService.compare.mockResolvedValue(false);

    await expect(
      useCase.execute(user.id, 'senhaErrada', 'novaSenha123'),
    ).rejects.toThrow(
      new DomainException(AuthErrorMessages.CURRENT_PASSWORD_INVALID),
    );

    expect(mockUserRepository.update).not.toHaveBeenCalled();
    expect(mockRefreshTokenRepository.revokeAllByUserId).not.toHaveBeenCalled();
  });

  it('deve lançar exceção quando usuário não encontrado', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('id-inexistente', 'senha', 'nova'),
    ).rejects.toThrow(new DomainException(UserErrorMessages.NOT_FOUND));
  });
});
