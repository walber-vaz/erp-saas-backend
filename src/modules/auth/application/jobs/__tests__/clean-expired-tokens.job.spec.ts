import type { Mocked } from 'vitest';
import { CleanExpiredTokensJob } from '../clean-expired-tokens.job';
import { RefreshTokenRepository } from '@modules/auth/domain/repositories/refresh-token.repository';
import { Logger } from '@nestjs/common';

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

describe('CleanExpiredTokensJob', () => {
  let job: CleanExpiredTokensJob;
  let logger: Logger;

  beforeEach(() => {
    vi.clearAllMocks();
    logger = new Logger(CleanExpiredTokensJob.name);
    vi.spyOn(logger, 'log').mockImplementation(() => {});
    vi.spyOn(logger, 'error').mockImplementation(() => {});

    job = new CleanExpiredTokensJob(mockRefreshTokenRepository);
    // Manually set the logger to our mocked one
    (job as any)['logger'] = logger;
  });

  it('deve chamar deleteExpired no repositório', async () => {
    mockRefreshTokenRepository.deleteExpired.mockResolvedValue(undefined);

    await job.execute();

    expect(mockRefreshTokenRepository.deleteExpired).toHaveBeenCalledTimes(1);
    expect(logger.log).toHaveBeenCalledWith(
      'Iniciando job de limpeza de tokens expirados...',
    );
    expect(logger.log).toHaveBeenCalledWith('Tokens expirados limpos com sucesso.');
  });

  it('deve logar erro se a limpeza falhar', async () => {
    const error = new Error('Database error');
    mockRefreshTokenRepository.deleteExpired.mockRejectedValue(error);

    await job.execute();

    expect(mockRefreshTokenRepository.deleteExpired).toHaveBeenCalledTimes(1);
    expect(logger.log).toHaveBeenCalledWith(
      'Iniciando job de limpeza de tokens expirados...',
    );
    expect(logger.error).toHaveBeenCalledWith(
      'Erro ao limpar tokens expirados:',
      error.message,
    );
  });
});
