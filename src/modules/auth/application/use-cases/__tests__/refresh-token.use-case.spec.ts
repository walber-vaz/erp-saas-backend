import type { Mocked } from 'vitest';
import { DomainException } from '@shared/exceptions/domain.exception';
import { AuthErrorMessages } from '@modules/auth/domain/constants/error-messages';
import { User } from '@modules/auth/domain/entities/user.entity';
import { RefreshToken } from '@modules/auth/domain/entities/refresh-token.entity';
import { UserRepository } from '@modules/auth/domain/repositories/user.repository';
import { RefreshTokenRepository } from '@modules/auth/domain/repositories/refresh-token.repository';
import { TokenService } from '@modules/auth/application/services/token.service';
import { RefreshTokenUseCase } from '../refresh-token.use-case';

const ORG_ID = '550e8400-e29b-41d4-a716-446655440000';
const USER_ID = '660e8400-e29b-41d4-a716-446655440000';
const FAMILY = '770e8400-e29b-41d4-a716-446655440000';

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

const mockTokenService: Mocked<TokenService> = {
  generateAccessToken: vi.fn(),
  generateRefreshToken: vi.fn(),
  verifyAccessToken: vi.fn(),
} as any;

function futureDate(days = 7): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function createValidRefreshToken(overrides?: { isRevoked?: boolean }) {
  return RefreshToken.create({
    userId: USER_ID,
    token: 'valid-token',
    family: FAMILY,
    expiresAt: futureDate(),
    isRevoked: overrides?.isRevoked ?? false,
  });
}

function createUser(overrides?: { isActive?: boolean }) {
  return User.create({
    id: USER_ID,
    organizationId: ORG_ID,
    name: 'João Silva',
    email: 'joao@empresa.com',
    passwordHash: '$2b$10$hash',
    isActive: overrides?.isActive ?? true,
  });
}

describe('RefreshTokenUseCase', () => {
  let useCase: RefreshTokenUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new RefreshTokenUseCase(
      mockUserRepository,
      mockRefreshTokenRepository,
      mockTokenService,
    );
  });

  it('deve renovar tokens com sucesso', async () => {
    const existingToken = createValidRefreshToken();
    const user = createUser();

    mockRefreshTokenRepository.findByToken.mockResolvedValue(existingToken);
    mockRefreshTokenRepository.update.mockImplementation(async (rt) => rt);
    mockUserRepository.findById.mockResolvedValue(user);
    mockTokenService.generateAccessToken.mockReturnValue('new-access-token');
    mockTokenService.generateRefreshToken.mockReturnValue('new-refresh-token');
    mockRefreshTokenRepository.create.mockImplementation(async (rt) => rt);

    const result = await useCase.execute('valid-token');

    expect(result.accessToken).toBe('new-access-token');
    expect(result.refreshToken).toBe('new-refresh-token');
    expect(existingToken.isRevoked).toBe(true);
    expect(mockRefreshTokenRepository.create).toHaveBeenCalledTimes(1);
  });

  it('deve manter a mesma family no novo token', async () => {
    const existingToken = createValidRefreshToken();
    const user = createUser();

    mockRefreshTokenRepository.findByToken.mockResolvedValue(existingToken);
    mockRefreshTokenRepository.update.mockImplementation(async (rt) => rt);
    mockUserRepository.findById.mockResolvedValue(user);
    mockTokenService.generateAccessToken.mockReturnValue('new-access');
    mockTokenService.generateRefreshToken.mockReturnValue('new-refresh');
    mockRefreshTokenRepository.create.mockImplementation(async (rt) => rt);

    await useCase.execute('valid-token');

    const createdToken = mockRefreshTokenRepository.create.mock.calls[0][0];
    expect(createdToken.family).toBe(FAMILY);
  });

  it('deve lançar exceção quando token não existe', async () => {
    mockRefreshTokenRepository.findByToken.mockResolvedValue(null);

    await expect(useCase.execute('inexistente')).rejects.toThrow(
      new DomainException(AuthErrorMessages.REFRESH_TOKEN_NOT_FOUND),
    );
  });

  it('deve revogar toda a family quando token já está revogado (rotation attack)', async () => {
    const revokedToken = createValidRefreshToken({ isRevoked: true });
    mockRefreshTokenRepository.findByToken.mockResolvedValue(revokedToken);

    await expect(useCase.execute('valid-token')).rejects.toThrow(
      new DomainException(AuthErrorMessages.REFRESH_TOKEN_REVOKED),
    );

    expect(mockRefreshTokenRepository.revokeAllByFamily).toHaveBeenCalledWith(
      FAMILY,
    );
  });

  it('deve lançar exceção quando token está expirado', async () => {
    const expiredToken = RefreshToken.create({
      userId: USER_ID,
      token: 'expired-token',
      family: FAMILY,
      expiresAt: new Date(Date.now() + 100),
    });
    // Simula expiração fazendo spy no isExpired
    vi.spyOn(expiredToken, 'isExpired').mockReturnValue(true);
    mockRefreshTokenRepository.findByToken.mockResolvedValue(expiredToken);

    await expect(useCase.execute('expired-token')).rejects.toThrow(
      new DomainException(AuthErrorMessages.REFRESH_TOKEN_EXPIRED),
    );
  });

  it('deve lançar exceção quando usuário está inativo', async () => {
    const existingToken = createValidRefreshToken();
    const inactiveUser = createUser({ isActive: false });

    mockRefreshTokenRepository.findByToken.mockResolvedValue(existingToken);
    mockRefreshTokenRepository.update.mockImplementation(async (rt) => rt);
    mockUserRepository.findById.mockResolvedValue(inactiveUser);

    await expect(useCase.execute('valid-token')).rejects.toThrow(
      new DomainException(AuthErrorMessages.USER_INACTIVE),
    );
  });
});
