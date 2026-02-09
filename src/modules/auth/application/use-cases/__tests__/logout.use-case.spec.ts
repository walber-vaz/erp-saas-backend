import type { Mocked } from 'vitest';
import { DomainException } from '@shared/exceptions/domain.exception';
import { AuthErrorMessages } from '@modules/auth/domain/constants/error-messages';
import { RefreshToken } from '@modules/auth/domain/entities/refresh-token.entity';
import { RefreshTokenRepository } from '@modules/auth/domain/repositories/refresh-token.repository';
import { LogoutUseCase } from '../logout.use-case';

const USER_ID = '550e8400-e29b-41d4-a716-446655440000';
const FAMILY = '660e8400-e29b-41d4-a716-446655440000';

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

function futureDate(days = 7): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

describe('LogoutUseCase', () => {
  let useCase: LogoutUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new LogoutUseCase(mockRefreshTokenRepository);
  });

  it('deve revogar o token com sucesso', async () => {
    const token = RefreshToken.create({
      userId: USER_ID,
      token: 'my-token',
      family: FAMILY,
      expiresAt: futureDate(),
    });
    mockRefreshTokenRepository.findByToken.mockResolvedValue(token);
    mockRefreshTokenRepository.update.mockImplementation(async (rt) => rt);

    await useCase.execute('my-token');

    expect(token.isRevoked).toBe(true);
    expect(mockRefreshTokenRepository.update).toHaveBeenCalledWith(token);
  });

  it('deve lançar exceção quando token não existe', async () => {
    mockRefreshTokenRepository.findByToken.mockResolvedValue(null);

    await expect(useCase.execute('inexistente')).rejects.toThrow(
      new DomainException(AuthErrorMessages.REFRESH_TOKEN_NOT_FOUND),
    );
  });

  it('não deve lançar exceção ao fazer logout de token já revogado', async () => {
    const token = RefreshToken.create({
      userId: USER_ID,
      token: 'my-token',
      family: FAMILY,
      expiresAt: futureDate(),
      isRevoked: true,
    });
    mockRefreshTokenRepository.findByToken.mockResolvedValue(token);

    await expect(useCase.execute('my-token')).resolves.toBeUndefined();
    expect(mockRefreshTokenRepository.update).not.toHaveBeenCalled();
  });
});
