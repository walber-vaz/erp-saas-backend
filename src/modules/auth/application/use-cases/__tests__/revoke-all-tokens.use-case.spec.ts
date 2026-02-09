import type { Mocked } from 'vitest';
import { RefreshTokenRepository } from '@modules/auth/domain/repositories/refresh-token.repository';
import { RevokeAllTokensUseCase } from '../revoke-all-tokens.use-case';

const USER_ID = '550e8400-e29b-41d4-a716-446655440000';

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

describe('RevokeAllTokensUseCase', () => {
  let useCase: RevokeAllTokensUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new RevokeAllTokensUseCase(mockRefreshTokenRepository);
  });

  it('deve revogar todos os tokens do usuário', async () => {
    mockRefreshTokenRepository.revokeAllByUserId.mockResolvedValue(undefined);

    await useCase.execute(USER_ID);

    expect(mockRefreshTokenRepository.revokeAllByUserId).toHaveBeenCalledWith(
      USER_ID,
    );
    expect(mockRefreshTokenRepository.revokeAllByUserId).toHaveBeenCalledTimes(
      1,
    );
  });
});
