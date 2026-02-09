import type { Mocked } from 'vitest';
import { DomainException } from '@shared/exceptions/domain.exception';
import { AuthErrorMessages } from '@modules/auth/domain/constants/error-messages';
import { User } from '@modules/auth/domain/entities/user.entity';
import { UserRepository } from '@modules/auth/domain/repositories/user.repository';
import { RefreshTokenRepository } from '@modules/auth/domain/repositories/refresh-token.repository';
import { HashService } from '@modules/auth/application/services/hash.service';
import { TokenService } from '@modules/auth/application/services/token.service';
import { LoginUseCase } from '../login.use-case';

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

const mockTokenService: Mocked<TokenService> = {
  generateAccessToken: vi.fn(),
  generateRefreshToken: vi.fn(),
  verifyAccessToken: vi.fn(),
} as any;

function createUser(overrides?: Partial<{ isActive: boolean }>) {
  return User.create({
    organizationId: ORG_ID,
    name: 'João Silva',
    email: 'joao@empresa.com',
    passwordHash: '$2b$10$hashedpassword',
    isActive: overrides?.isActive ?? true,
  });
}

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new LoginUseCase(
      mockUserRepository,
      mockRefreshTokenRepository,
      mockHashService,
      mockTokenService,
    );
  });

  it('deve fazer login com sucesso', async () => {
    const user = createUser();
    mockUserRepository.findByEmail.mockResolvedValue(user);
    mockHashService.compare.mockResolvedValue(true);
    mockTokenService.generateAccessToken.mockReturnValue('access-token');
    mockTokenService.generateRefreshToken.mockReturnValue('refresh-token');
    mockRefreshTokenRepository.create.mockImplementation(async (rt) => rt);
    mockUserRepository.update.mockImplementation(async (u) => u);

    const result = await useCase.execute({
      organizationId: ORG_ID,
      email: 'joao@empresa.com',
      password: 'senha123',
    });

    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(result.user.id).toBe(user.id);
    expect(result.user.name).toBe('João Silva');
    expect(mockRefreshTokenRepository.create).toHaveBeenCalledTimes(1);
    expect(mockUserRepository.update).toHaveBeenCalledTimes(1);
  });

  it('deve lançar exceção quando usuário não existe', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({
        organizationId: ORG_ID,
        email: 'naoexiste@empresa.com',
        password: 'senha123',
      }),
    ).rejects.toThrow(
      new DomainException(AuthErrorMessages.INVALID_CREDENTIALS),
    );
  });

  it('deve lançar exceção quando usuário está inativo', async () => {
    const user = createUser({ isActive: false });
    mockUserRepository.findByEmail.mockResolvedValue(user);

    await expect(
      useCase.execute({
        organizationId: ORG_ID,
        email: 'joao@empresa.com',
        password: 'senha123',
      }),
    ).rejects.toThrow(new DomainException(AuthErrorMessages.USER_INACTIVE));
  });

  it('deve lançar exceção quando senha é inválida', async () => {
    const user = createUser();
    mockUserRepository.findByEmail.mockResolvedValue(user);
    mockHashService.compare.mockResolvedValue(false);

    await expect(
      useCase.execute({
        organizationId: ORG_ID,
        email: 'joao@empresa.com',
        password: 'senhaerrada',
      }),
    ).rejects.toThrow(
      new DomainException(AuthErrorMessages.INVALID_CREDENTIALS),
    );
  });

  it('deve atualizar lastLoginAt do usuário', async () => {
    const user = createUser();
    mockUserRepository.findByEmail.mockResolvedValue(user);
    mockHashService.compare.mockResolvedValue(true);
    mockTokenService.generateAccessToken.mockReturnValue('access-token');
    mockTokenService.generateRefreshToken.mockReturnValue('refresh-token');
    mockRefreshTokenRepository.create.mockImplementation(async (rt) => rt);
    mockUserRepository.update.mockImplementation(async (u) => u);

    await useCase.execute({
      organizationId: ORG_ID,
      email: 'joao@empresa.com',
      password: 'senha123',
    });

    expect(user.lastLoginAt).toBeInstanceOf(Date);
    expect(mockUserRepository.update).toHaveBeenCalledWith(user);
  });
});
